"""Validation helpers for processed parquet datasets."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import pyarrow.parquet as pq

REQUIRED_FACT_COLUMNS = {
    "id",
    "film_id",
    "developer_id",
    "format_id",
    "format",
    "dev_time",
    "active",
}

REQUIRED_DIMENSION_COLUMNS = {
    "films": {"id", "film", "active"},
    "developers": {"id", "developer", "active"},
    "formats": {"id", "format", "active"},
}


def _read_parquet(path: Path) -> pd.DataFrame:
    return pq.read_table(path).to_pandas()


def validate_processed_dataset(
    films_path: Path,
    developers_path: Path,
    formats_path: Path,
    times_path: Path,
) -> list[str]:
    """
    Return a list of validation error messages. Empty list means the dataset is valid.
    """
    errors: list[str] = []

    for label, path in [
        ("films", films_path),
        ("developers", developers_path),
        ("formats", formats_path),
        ("developing_times", times_path),
    ]:
        if not path.exists():
            errors.append(f"Missing {label} parquet: {path}")
            return errors

    films = _read_parquet(films_path)
    developers = _read_parquet(developers_path)
    formats = _read_parquet(formats_path)
    times = _read_parquet(times_path)

    for name, df, required in [
        ("films", films, REQUIRED_DIMENSION_COLUMNS["films"]),
        ("developers", developers, REQUIRED_DIMENSION_COLUMNS["developers"]),
        ("formats", formats, REQUIRED_DIMENSION_COLUMNS["formats"]),
    ]:
        missing = required - set(df.columns)
        if missing:
            errors.append(f"{name} missing columns: {sorted(missing)}")
        if df["id"].duplicated().any():
            errors.append(f"{name} has duplicate id values")

    missing_fact = REQUIRED_FACT_COLUMNS - set(times.columns)
    if missing_fact:
        errors.append(f"developing_times missing columns: {sorted(missing_fact)}")

    if times["dev_time"].isna().any():
        errors.append("developing_times contains null dev_time values")

    film_ids = set(films["id"].dropna())
    developer_ids = set(developers["id"].dropna())
    format_ids = set(formats["id"].dropna())

    orphan_films = set(times["film_id"].dropna()) - film_ids
    if orphan_films:
        errors.append(f"developing_times has unknown film_id values: {sorted(orphan_films)}")

    orphan_developers = set(times["developer_id"].dropna()) - developer_ids
    if orphan_developers:
        errors.append(
            f"developing_times has unknown developer_id values: {sorted(orphan_developers)}"
        )

    orphan_formats = set(times["format_id"].dropna()) - format_ids
    if orphan_formats:
        errors.append(
            f"developing_times has unknown format_id values: {sorted(orphan_formats)}"
        )

    return errors
