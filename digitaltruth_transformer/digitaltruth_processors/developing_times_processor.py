import logging

import pandas as pd

from digitaltruth_transformer.digitaltruth_processors.base import (
    add_audit_information,
    get_catalog_id,
)

COLUMNS_ORDER = [
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


def process_developers_times_data(
    times_df: pd.DataFrame,
    developers_df: pd.DataFrame,
    films_df: pd.DataFrame,
    format_df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Processes the developing times DataFrame by normalizing, enriching, and formatting data.

    Args:
        times_df (pd.DataFrame): The DataFrame containing developing times data.
        developers_df (pd.DataFrame): Developer catalog DataFrame.
        films_df (pd.DataFrame): Film catalog DataFrame.
        format_df (pd.DataFrame): Format catalog DataFrame.

    Returns:
        pd.DataFrame: The processed DataFrame with additional columns.
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting processing of developing times data.")

    # Normalize the table
    times_df = times_df.copy()
    logger.debug("Normalizing 'film' and 'developer' columns.")

    times_df["film"] = (
        times_df["film"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )

    times_df["developer"] = (
        times_df["developer"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )

    # Remove unwanted entries and duplicates
    times_df = times_df.query('developer != "*see notes*"').drop_duplicates()
    logger.info(f"Filtered and deduplicated developing times, count: {len(times_df)}")

    # Get IDs from catalogs
    logger.debug("Assigning film and developer IDs from catalogs.")
    times_df["film_id"] = times_df.apply(
        lambda row: get_catalog_id(row, films_df, "film", "id"), axis=1
    )
    times_df["developer_id"] = times_df.apply(
        lambda row: get_catalog_id(row, developers_df, "developer", "id"), axis=1
    )

    # Fill missing format times from 35mm before reshaping
    logger.debug("Filling missing format times from '35mm'.")
    times_df["120"] = times_df["120"].fillna(times_df["35mm"])
    times_df["sheet"] = times_df["sheet"].fillna(times_df["35mm"])

    # Reshape DataFrame to long format
    logger.debug("Melting DataFrame to long format for 'format' and 'dev_time'.")
    times_df = times_df.melt(
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

    # Assign format IDs
    logger.debug("Assigning format IDs from catalog.")
    times_df["format_id"] = times_df.apply(
        lambda row: get_catalog_id(row, format_df, "format", "id"), axis=1
    )

    # Drop rows with missing development times
    logger.info("Dropping rows with missing development times.")
    times_df = times_df.dropna(subset=["dev_time"])

    # Add audit information
    logger.info("Adding audit information.")
    audited_df = add_audit_information(times_df)

    # Select and order final columns
    final_columns = [col for col in COLUMNS_ORDER if col in audited_df.columns]
    result_df = audited_df[final_columns].reset_index(drop=True).sort_values(by=["id"])

    logger.info("Developing times data processing complete.")
    return result_df
