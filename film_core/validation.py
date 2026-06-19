"""Validation helpers for silver and gold parquet datasets."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import pyarrow.parquet as pq

SILVER_FACT_COLUMNS = {
    "id",
    "film",
    "developer",
    "iso",
    "dilution",
    "35mm",
    "120",
    "sheet",
    "active",
}

SILVER_DIMENSION_COLUMNS = {
    "films": {"id", "film", "active"},
    "developers": {"id", "developer", "active"},
    "formats": {"id", "format", "active"},
}

GOLD_FACT_COLUMNS = {
    "id",
    "film_id",
    "developer_id",
    "format_id",
    "format",
    "dev_time",
    "active",
}

GOLD_DIMENSION_COLUMNS = SILVER_DIMENSION_COLUMNS


def _read_parquet(path: Path) -> pd.DataFrame:
    return pq.read_table(path).to_pandas()


def _validate_dimensions(
    errors: list[str],
    datasets: list[tuple[str, pd.DataFrame, set[str]]],
) -> None:
    for name, df, required in datasets:
        missing = required - set(df.columns)
        if missing:
            errors.append(f"{name} missing columns: {sorted(missing)}")
        if "id" in df.columns and df["id"].duplicated().any():
            errors.append(f"{name} has duplicate id values")


def validate_silver_dataset(
    films_path: Path,
    developers_path: Path,
    formats_path: Path,
    times_path: Path,
) -> list[str]:
    """Validate silver (processed) parquet outputs."""
    errors: list[str] = []

    paths = [
        ("films", films_path),
        ("developers", developers_path),
        ("formats", formats_path),
        ("developing_times", times_path),
    ]
    for label, path in paths:
        if not path.exists():
            errors.append(f"Missing {label} parquet: {path}")
            return errors

    films = _read_parquet(films_path)
    developers = _read_parquet(developers_path)
    formats = _read_parquet(formats_path)
    times = _read_parquet(times_path)

    _validate_dimensions(
        errors,
        [
            ("films", films, SILVER_DIMENSION_COLUMNS["films"]),
            ("developers", developers, SILVER_DIMENSION_COLUMNS["developers"]),
            ("formats", formats, SILVER_DIMENSION_COLUMNS["formats"]),
        ],
    )

    missing_fact = SILVER_FACT_COLUMNS - set(times.columns)
    if missing_fact:
        errors.append(f"developing_times missing columns: {sorted(missing_fact)}")

    if "dev_time" in times.columns:
        errors.append("silver developing_times must remain wide (dev_time column unexpected)")

    return errors


def validate_gold_dataset(
    films_path: Path,
    developers_path: Path,
    formats_path: Path,
    times_path: Path,
) -> list[str]:
    """Validate gold (normalized) parquet outputs including FK integrity."""
    errors: list[str] = []

    paths = [
        ("films", films_path),
        ("developers", developers_path),
        ("formats", formats_path),
        ("developing_times", times_path),
    ]
    for label, path in paths:
        if not path.exists():
            errors.append(f"Missing {label} parquet: {path}")
            return errors

    films = _read_parquet(films_path)
    developers = _read_parquet(developers_path)
    formats = _read_parquet(formats_path)
    times = _read_parquet(times_path)

    _validate_dimensions(
        errors,
        [
            ("films", films, GOLD_DIMENSION_COLUMNS["films"]),
            ("developers", developers, GOLD_DIMENSION_COLUMNS["developers"]),
            ("formats", formats, GOLD_DIMENSION_COLUMNS["formats"]),
        ],
    )

    missing_fact = GOLD_FACT_COLUMNS - set(times.columns)
    if missing_fact:
        errors.append(f"developing_times missing columns: {sorted(missing_fact)}")

    if times["dev_time"].isna().any():
        errors.append("developing_times contains null dev_time values")

    film_ids = set(films["id"].dropna())
    developer_ids = set(developers["id"].dropna())
    format_ids = set(formats["id"].dropna())

    orphan_films = set(times["film_id"].dropna()) - film_ids
    if orphan_films:
        errors.append(
            f"developing_times has unknown film_id values: {sorted(orphan_films)}"
        )

    orphan_developers = set(times["developer_id"].dropna()) - developer_ids
    if orphan_developers:
        errors.append(
            "developing_times has unknown developer_id values: "
            f"{sorted(orphan_developers)}"
        )

    orphan_formats = set(times["format_id"].dropna()) - format_ids
    if orphan_formats:
        errors.append(
            f"developing_times has unknown format_id values: {sorted(orphan_formats)}"
        )

    return errors


def validate_processed_dataset(
    films_path: Path,
    developers_path: Path,
    formats_path: Path,
    times_path: Path,
) -> list[str]:
    """Backward-compatible alias for gold validation."""
    return validate_gold_dataset(films_path, developers_path, formats_path, times_path)
