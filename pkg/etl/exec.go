package etl

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jdetok/stlmetromap/pkg/gis"
	"github.com/jdetok/stlmetromap/pkg/pgis"
	"go.uber.org/zap"
)

func ExecETLProc(ctx context.Context, db *pgxpool.Pool, lg *zap.SugaredLogger) error {
	data := gis.ACSObj{}
	acsData, err := gis.GetACSData(ctx)
	if err != nil {
		return err
	}
	data = acsData.Data
	insData := pgis.InsertData(data)

	tableCnf := &pgis.TableConf{
		Schema:   "gis",
		Table:    "acs",
		Headers:  pgis.GetColHeaders(insData, "geoid"),
		KeyCol:   "geoid",
		GeomType: "",
	}

	if err := tableCnf.CreateTableNotExists(ctx, db, lg); err != nil {
		return err
	}

	if err := tableCnf.Upsert(ctx, db, insData, lg); err != nil {
		return err
	}
	return nil
}
