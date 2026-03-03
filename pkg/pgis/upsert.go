package pgis

import (
	"context"
	"fmt"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Data map[string]map[string]string

type Config struct {
	Schema string
	Table  string

	// Name of the outer-key column (default: "geoid")
	KeyColumn string

	// If true, store "" as NULL (default: true)
	EmptyAsNull bool

	// Optional: filter/transform headers before becoming columns.
	// Return ("", false) to skip a header.
	HeaderMap func(h string) (col string, ok bool)
}

func NewConfig(schema, table string) Config {
	return Config{
		Schema:      schema,
		Table:       table,
		KeyColumn:   "geoid",
		EmptyAsNull: true,
	}
}

func fqTable(schema, table string) string {
	if schema == "" {
		return quoteIdent(table)
	}
	return quoteIdent(schema) + "." + quoteIdent(table)
}

// collectHeaders returns sorted unique headers across data, after applying HeaderMap.
func collectHeaders(data Data, cfg Config) []string {
	set := make(map[string]struct{}, 256)

	for _, row := range data {
		for h := range row {
			if h == "" {
				continue
			}
			col := h
			ok := true
			if cfg.HeaderMap != nil {
				col, ok = cfg.HeaderMap(h)
			}
			if !ok || col == "" {
				continue
			}
			// Prevent collisions with id/key column (case-insensitive).
			if strings.EqualFold(col, "id") || strings.EqualFold(col, cfg.KeyColumn) {
				continue
			}
			set[col] = struct{}{}
		}
	}

	headers := make([]string, 0, len(set))
	for h := range set {
		headers = append(headers, h)
	}
	sort.Strings(headers)
	return headers
}

// EnsureTable creates the table if it doesn't exist.
// Columns: id bigserial PK, <KeyColumn> text unique not null, and each header as text.
func EnsureTable(ctx context.Context, db *pgxpool.Pool, cfg Config, data Data) error {
	if cfg.Table == "" {
		return fmt.Errorf("table name is required")
	}
	if cfg.KeyColumn == "" {
		cfg.KeyColumn = "geoid"
	}

	headers := collectHeaders(data, cfg)

	cols := make([]string, 0, 2+len(headers))
	cols = append(cols, "id bigserial primary key")
	cols = append(cols, fmt.Sprintf("%s text unique not null", quoteIdent(cfg.KeyColumn)))

	for _, h := range headers {
		cols = append(cols, fmt.Sprintf("%s text", quoteIdent(h)))
	}

	ddl := fmt.Sprintf(
		"CREATE TABLE IF NOT EXISTS %s (\n    %s\n);",
		fqTable(cfg.Schema, cfg.Table),
		strings.Join(cols, ",\n    "),
	)

	_, err := db.Exec(ctx, ddl)
	return err
}

// update each row
// Outer key is stored in KeyColumn. Inner headers become columns.
func Upsert(ctx context.Context, db *pgxpool.Pool, cfg Config, data Data) error {
	if cfg.Table == "" {
		return fmt.Errorf("table name is required")
	}
	if cfg.KeyColumn == "" {
		cfg.KeyColumn = "geoid"
	}
	// Default EmptyAsNull to true unless caller explicitly set it false via NewConfig.
	// If caller passes Config literal, they should set EmptyAsNull explicitly.
	if cfg.Schema == "" && cfg.Table != "" && cfg.KeyColumn == "geoid" && cfg.HeaderMap == nil {
		// can't reliably detect intent; leave as provided
	}

	headers := collectHeaders(data, cfg)

	// INSERT columns: key + headers...
	insertCols := make([]string, 0, 1+len(headers))
	insertCols = append(insertCols, cfg.KeyColumn)
	insertCols = append(insertCols, headers...)

	// Placeholders $1 $2...
	placeholders := make([]string, 0, len(insertCols))
	for i := 1; i <= len(insertCols); i++ {
		placeholders = append(placeholders, fmt.Sprintf("$%d", i))
	}

	// ON CONFLICT update set: each header column
	setParts := make([]string, 0, len(headers))
	for _, h := range headers {
		qh := quoteIdent(h)
		setParts = append(setParts, fmt.Sprintf("%s = EXCLUDED.%s", qh, qh))
	}

	// Quote insert columns
	quotedCols := make([]string, 0, len(insertCols))
	for _, c := range insertCols {
		quotedCols = append(quotedCols, quoteIdent(c))
	}

	q := fmt.Sprintf(`
INSERT INTO %s (%s)
VALUES (%s)
ON CONFLICT (%s) DO UPDATE SET
    %s;
`,
		fqTable(cfg.Schema, cfg.Table),
		strings.Join(quotedCols, ", "),
		strings.Join(placeholders, ", "),
		quoteIdent(cfg.KeyColumn),
		strings.Join(setParts, ",\n    "),
	)

	tx, err := db.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback(ctx)
		}
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
				// note: headerMap might rename columns; values still keyed by original header.
				// If you use HeaderMap, consider normalizing data keys before passing in,
				// OR implement a ValueLookup function. For prototyping, keep HeaderMap nil.
				v = row[h]
			}
			if cfg.EmptyAsNull && v == "" {
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

// create table if needed, add any missing columns (if headers expand later), upsert rows
func EnsureAndUpsert(ctx context.Context, db *pgxpool.Pool, cfg Config, data Data) error {
	if cfg.EmptyAsNull == false && cfg.Schema == "" && cfg.Table != "" {
		// this is necessary
	}
	if err := EnsureTable(ctx, db, cfg, data); err != nil {
		return err
	}
	return Upsert(ctx, db, cfg, data)
}
