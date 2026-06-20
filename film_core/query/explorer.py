from dataclasses import dataclass
from pathlib import Path
from typing import Any

import config


class ExplorerDataNotFoundError(FileNotFoundError):
    """Raised when layer data is missing."""


@dataclass(frozen=True)
class LayerConfig:
    name: str
    path: Path
    kind: str  # parquet | json
    film_column: str
    developer_column: str
    iso_column: str


def get_layer_config(layer: str) -> LayerConfig:
    layers = {
        "gold": LayerConfig(
            name="gold",
            path=Path(config.GOLD_DEVELOPING_TIMES_OUT),
            kind="parquet",
            film_column="film",
            developer_column="developer",
            iso_column="iso",
        ),
        "silver": LayerConfig(
            name="silver",
            path=Path(config.DEVELOPING_TIMES_OUT),
            kind="parquet",
            film_column="film",
            developer_column="developer",
            iso_column="iso",
        ),
        "bronze": LayerConfig(
            name="bronze",
            path=Path(config.DEVELOPING_TIMES_PATH),
            kind="json",
            film_column="film",
            developer_column="developer",
            iso_column="iso",
        ),
    }
    if layer not in layers:
        raise ValueError(f"Unsupported layer: {layer}")
    return layers[layer]


def _ensure_exists(path: Path) -> None:
    if not path.exists():
        raise ExplorerDataNotFoundError(
            f"Layer data not found at {path}. Run the pipeline first."
        )


def _read_fn(layer: LayerConfig) -> str:
    escaped = str(layer.path).replace("'", "''")
    if layer.kind == "parquet":
        return f"read_parquet('{escaped}')"
    return f"read_json_auto('{escaped}')"


def get_layer_schema(layer: str) -> list[dict[str, str]]:
    import duckdb

    cfg = get_layer_config(layer)
    _ensure_exists(cfg.path)

    conn = duckdb.connect()
    try:
        source = _read_fn(cfg)
        rows = conn.execute(f"DESCRIBE SELECT * FROM {source}").fetchall()
        return [{"name": row[0], "type": row[1]} for row in rows]
    finally:
        conn.close()


def query_layer(
    layer: str,
    *,
    page: int = 1,
    page_size: int = 25,
    film: str | None = None,
    developer: str | None = None,
    iso: str | None = None,
) -> dict[str, Any]:
    import duckdb

    cfg = get_layer_config(layer)
    _ensure_exists(cfg.path)

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    offset = (page - 1) * page_size

    source = _read_fn(cfg)
    sql = f"SELECT * FROM {source} WHERE 1=1"
    count_sql = f"SELECT COUNT(*) FROM {source} WHERE 1=1"
    params: list[str] = []

    if film:
        sql += f" AND LOWER({cfg.film_column}) LIKE ?"
        count_sql += f" AND LOWER({cfg.film_column}) LIKE ?"
        params.append(f"%{film.strip().lower()}%")
    if developer:
        sql += f" AND LOWER({cfg.developer_column}) LIKE ?"
        count_sql += f" AND LOWER({cfg.developer_column}) LIKE ?"
        params.append(f"%{developer.strip().lower()}%")
    if iso:
        sql += f" AND {cfg.iso_column} = ?"
        count_sql += f" AND {cfg.iso_column} = ?"
        params.append(iso.strip())

    sql += " LIMIT ? OFFSET ?"

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
            "layer": layer,
            "rows": records,
            "total": int(total),
            "page": page,
            "page_size": page_size,
            "columns": columns,
        }
    finally:
        conn.close()
