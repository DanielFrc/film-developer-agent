from dataclasses import dataclass
from pathlib import Path
from typing import Any

import config
from film_core.normalize import sanitize_notes


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


_SOURCE_COLUMN_CANDIDATES = ("source", "data_source", "source_url")


def _find_source_column(columns: list[str]) -> str | None:
    lowered = {column.lower(): column for column in columns}
    for candidate in _SOURCE_COLUMN_CANDIDATES:
        if candidate in lowered:
            return lowered[candidate]
    return None


def _get_columns(conn, layer: LayerConfig) -> list[str]:
    source = _read_fn(layer)
    rows = conn.execute(f"DESCRIBE SELECT * FROM {source}").fetchall()
    return [row[0] for row in rows]


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
    source: str | None = None,
) -> dict[str, Any]:
    import duckdb

    cfg = get_layer_config(layer)
    _ensure_exists(cfg.path)

    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    offset = (page - 1) * page_size

    conn = duckdb.connect()
    try:
        columns = _get_columns(conn, cfg)
        source_column = _find_source_column(columns)

        source_expr = _read_fn(cfg)
        sql = f"SELECT * FROM {source_expr} WHERE 1=1"
        count_sql = f"SELECT COUNT(*) FROM {source_expr} WHERE 1=1"
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
        if source and source_column:
            sql += f" AND LOWER({source_column}) LIKE ?"
            count_sql += f" AND LOWER({source_column}) LIKE ?"
            params.append(f"%{source.strip().lower()}%")

        sql += " LIMIT ? OFFSET ?"

        total = conn.execute(count_sql, params).fetchone()[0]
        rows = conn.execute(sql, [*params, page_size, offset]).fetchdf()
        result_columns = list(rows.columns)
        records = [
            {col: (None if row[col] != row[col] else row[col]) for col in result_columns}
            for row in rows.to_dict(orient="records")
        ]
        for record in records:
            for key, value in record.items():
                if value is not None and not isinstance(value, str | int | float | bool):
                    record[key] = str(value)
            if "notes" in record:
                record["notes"] = sanitize_notes(
                    str(record["notes"]) if record["notes"] is not None else None
                )

        display_columns = [column for column in result_columns if column != "notes"]

        return {
            "layer": layer,
            "rows": records,
            "total": int(total),
            "page": page,
            "page_size": page_size,
            "columns": display_columns,
            "source_filter_applied": bool(source and source_column),
        }
    finally:
        conn.close()
