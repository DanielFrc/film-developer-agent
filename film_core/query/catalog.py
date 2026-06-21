from dataclasses import dataclass
from pathlib import Path
from typing import Any

import config
from film_core.query.explorer import ExplorerDataNotFoundError


@dataclass(frozen=True)
class CatalogConfig:
    name: str
    path: Path
    label_column: str
    value_column: str | None = None


def get_catalog_config(catalog: str) -> CatalogConfig:
    catalogs = {
        "films": CatalogConfig(
            name="films",
            path=Path(config.GOLD_FILMS_OUT),
            label_column="film",
            value_column="value",
        ),
        "developers": CatalogConfig(
            name="developers",
            path=Path(config.GOLD_DEVELOPERS_OUT),
            label_column="developer",
            value_column="value",
        ),
    }
    if catalog not in catalogs:
        raise ValueError(f"Unsupported catalog: {catalog}")
    return catalogs[catalog]


def query_catalog(
    catalog: str,
    *,
    page: int = 1,
    page_size: int = 25,
    q: str | None = None,
) -> dict[str, Any]:
    import duckdb

    cfg = get_catalog_config(catalog)
    if not cfg.path.exists():
        raise ExplorerDataNotFoundError(
            f"Catalog data not found at {cfg.path}. Run the pipeline first."
        )

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    offset = (page - 1) * page_size

    escaped = str(cfg.path).replace("'", "''")
    source = f"read_parquet('{escaped}')"
    select_columns = [cfg.label_column]
    if cfg.value_column:
        select_columns.append(cfg.value_column)

    sql = (
        f"SELECT {', '.join(select_columns)} FROM {source} "
        f"WHERE active = true"
    )
    count_sql = f"SELECT COUNT(*) FROM {source} WHERE active = true"
    params: list[str] = []

    if q:
        sql += f" AND LOWER({cfg.label_column}) LIKE ?"
        count_sql += f" AND LOWER({cfg.label_column}) LIKE ?"
        params.append(f"%{q.strip().lower()}%")

    sql += f" ORDER BY {cfg.label_column} LIMIT ? OFFSET ?"

    conn = duckdb.connect()
    try:
        total = conn.execute(count_sql, params).fetchone()[0]
        rows = conn.execute(sql, [*params, page_size, offset]).fetchdf()
        columns = list(rows.columns)
        records = [
            {col: (None if row[col] != row[col] else row[col]) for col in columns}
            for row in rows.to_dict(orient="records")
        ]
        for record in records:
            for key, value in record.items():
                if value is not None and not isinstance(value, str | int | float | bool):
                    record[key] = str(value)

        return {
            "catalog": catalog,
            "rows": records,
            "total": int(total),
            "page": page,
            "page_size": page_size,
            "columns": columns,
        }
    finally:
        conn.close()
