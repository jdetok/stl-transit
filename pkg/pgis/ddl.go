package pgis

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

// array of keyvals (one map per row)
type InsertData map[string]map[string]string

// index fields will have an index created as [name]indexcol
type TableConf struct {
	Table      string
	Schema     string
	KeyCol     string
	Headers    []string
	GeoIndexes map[string]string
	Indexes    map[string]string
	GeomType   string
	HeaderMap  func(h string) (col string, ok bool)
}

// create table if not exists
func (c *TableConf) CreateTableNotExists(ctx context.Context, db *pgxpool.Pool, lg *zap.SugaredLogger) error {
	if c.Schema == "" || c.Table == "" {
		return fmt.Errorf("schema and table must both be passed")
	}

	if len(c.Headers) == 0 {
		return fmt.Errorf("schema and table must both be passed")
	}

	createTbl := c.CreateTableStatement()
	fmt.Println(createTbl)
	indexes := c.CreateIndexStatements()

	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() error {
		if err != nil {
			lg.Errorf("an error occured: %v\nattempting to rollback...", err)
			rbErr := tx.Rollback(ctx)
			if rbErr != nil {
				return fmt.Errorf("rollback failed: %v\noriginal error: %v", rbErr, err)
			}
			return fmt.Errorf("rollback success after error: %v", err)
		}
		return nil
	}()

	_, err = db.Exec(ctx, createTbl)
	if err != nil {
		return err
	}

	for _, idx := range indexes {
		fmt.Println(idx)
		_, err = db.Exec(ctx, idx)
		if err != nil {
			return err
		}
	}
	lg.Infof("created table with %d indexes", len(indexes))
	return nil
}

func (c *TableConf) CreateTableStatement() string {
	geom := ""
	if c.GeomType != "" {
		geom = fmt.Sprintf(",\n\tgeom geometry(%s, 4326)", c.GeomType)
	}
	headers := make([]string, 0)
	if c.KeyCol != "" {
		for _, k := range c.Headers {
			if strings.EqualFold(k, c.KeyCol) || strings.EqualFold(k, "id") {
				continue
			}
			headers = append(headers, k)
		}
	} else {
		headers = c.Headers
	}
	return fmt.Sprintf(
		`create table if not exists %s.%s (
	id bigserial primary key,	
	%s text unique not null,
	%s text%s
)`, c.Schema, c.Table, c.KeyCol, strings.Join(headers, " text,\n\t"), geom)
}

// returns array of create index strings
func (c *TableConf) CreateIndexStatements() []string {
	idxStatements := make([]string, len(c.Indexes)+len(c.GeoIndexes))
	for _, col := range c.Indexes {
		idxStatements = append(idxStatements, c.buildIndex(col, false))
	}
	for _, col := range c.GeoIndexes {
		idxStatements = append(idxStatements, c.buildIndex(col, true))
	}
	return idxStatements
}

// if index on multiple columns, pass cols with commas c1,c2,c3
func (c *TableConf) buildIndex(col string, isGeo bool) string {
	geom := ""
	idxPrefix := "idx"
	if isGeo {
		geom = "using gist"
		idxPrefix = "gix"
	}
	return fmt.Sprintf("create index if not exists %s_%s_%s on %s.%s %s (%s)",
		idxPrefix, c.Table, col, c.Schema, c.Table, geom, col)
}

func GetColHeaders(d InsertData, keyCol string) []string {
	cols := make([]string, 0)
	set := make(map[string]struct{}, 0)
	for _, row := range d {
		for h := range row {
			if h == "" {
				continue
			}
			col := quoteIdent(h)
			ok := true
			if !ok || col == "" || strings.EqualFold(col, quoteIdent(keyCol)) {
				continue
			}
			if _, ok := set[col]; !ok {
				set[col] = struct{}{}
			}
		}
	}
	for h := range set {
		cols = append(cols, h)
	}
	sort.Strings(cols)
	return cols
}
func quoteIdent(s string) string {
	return `"` + strings.ToLower(strings.ReplaceAll(s, `"`, `""`)) + `"`
}

func (c *TableConf) Upsert(ctx context.Context, db *pgxpool.Pool, data InsertData, lg *zap.SugaredLogger) error {
	if c.Table == "" {
		return fmt.Errorf("table name is required")
	}
	if c.KeyCol == "" {
		c.KeyCol = "geoid"
	}
	headers := GetColHeaders(data, c.KeyCol)
	insertCols := make([]string, 0, 1+len(headers))
	insertCols = append(insertCols, c.KeyCol)
	insertCols = append(insertCols, headers...)

	placeholders := make([]string, 0, len(insertCols))
	for i := 1; i <= len(insertCols); i++ {
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
	}

	setParts := make([]string, 0, len(headers))
	for _, h := range headers {
		setParts = append(setParts, fmt.Sprintf("%s = EXCLUDED.%s", h, h))
	}

	quotedCols := make([]string, 0, len(insertCols))
	for _, c := range insertCols {
		quotedCols = append(quotedCols, c)
	}

	q := fmt.Sprintf(`
insert into %s.%s (%s)
values (%s)
on conflict (%s) do update set
	%s;`, quoteIdent(c.Schema), quoteIdent(c.Table),
		strings.Join(quotedCols, ", "), strings.Join(placeholders, ", "),
		quoteIdent(c.KeyCol),
		strings.Join(setParts, ",\n    "))

	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() error {
		if err != nil {
			lg.Errorf("an error occured: %v\nattempting to rollback...", err)
			rbErr := tx.Rollback(ctx)
			if rbErr != nil {
				return fmt.Errorf("rollback failed: %v\noriginal error: %v", rbErr, err)
			}
			return fmt.Errorf("rollback success after error: %v", err)
		}
		return nil
	}()

	b := &pgx.Batch{}

	keys := make([]string, 0, len(data))
	for k := range data {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	for _, key := range keys {
		if key == "" {
			continue
		}
		row := data[key]

		args := make([]any, 0, len(insertCols))
		args = append(args, key)
		for _, h := range headers {
			v := ""
			if row != nil {
				v = row[h]
			}
			if v == "" {
				args = append(args, nil)
			} else {
				args = append(args, v)
			}
		}

		b.Queue(q, args...)

	}
	br := tx.SendBatch(ctx, b)
	for i := 0; i < b.Len(); i++ {
		if _, e := br.Exec(); e != nil {
			_ = br.Close()
			err = e
			return err
		}
	}
	if e := br.Close(); e != nil {
		err = e
		return err
	}

	if e := tx.Commit(ctx); e != nil {
		err = e
		return err
	}
	return nil
}
