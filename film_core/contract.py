"""Stable contract between ETL output and the user application layer."""

GOLD_SCHEMA_VERSION = "1"

GOLD_TABLES = (
    "digitaltruth_films.parquet.gz",
    "digitaltruth_developers.parquet.gz",
    "digitaltruth_formats.parquet.gz",
    "digitaltruth_film_data.parquet.gz",
)
