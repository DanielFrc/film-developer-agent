import logging

import pandas as pd

from film_core.audit import add_audit_information
from film_core.catalog import get_catalog_id

GOLD_COLUMNS = [
    "id",
    "film_id",
    "film",
    "developer_id",
    "developer",
    "iso",
    "dilution",
    "format",
    "format_id",
    "dev_time",
    "temp",
    "notes",
    "created_at",
    "updated_at",
    "active",
]


def process_developing_times_gold(
    times_df: pd.DataFrame,
    developers_df: pd.DataFrame,
    films_df: pd.DataFrame,
    format_df: pd.DataFrame,
) -> pd.DataFrame:
    """Gold layer: melt wide silver fact table and assign foreign keys."""
    logger = logging.getLogger(__name__)
    logger.info("Processing gold developing times fact table.")

    df = times_df.copy()
    df["film_id"] = df.apply(
        lambda row: get_catalog_id(row, films_df, "film", "id"), axis=1
    )
    df["developer_id"] = df.apply(
        lambda row: get_catalog_id(row, developers_df, "developer", "id"), axis=1
    )

    df["120"] = df["120"].fillna(df["35mm"])
    df["sheet"] = df["sheet"].fillna(df["35mm"])

    df = df.melt(
        id_vars=[
            "film_id",
            "film",
            "developer_id",
            "developer",
            "iso",
            "dilution",
            "temp",
            "notes",
        ],
        value_vars=["35mm", "120", "sheet"],
        var_name="format",
        value_name="dev_time",
    )
    df["format_id"] = df.apply(
        lambda row: get_catalog_id(row, format_df, "format", "id"), axis=1
    )
    df = df.dropna(subset=["dev_time"])

    audited = add_audit_information(df)
    columns = [col for col in GOLD_COLUMNS if col in audited.columns]
    result = audited[columns].reset_index(drop=True).sort_values(by="id")
    logger.info("Gold developing times count: %s", len(result))
    return result
