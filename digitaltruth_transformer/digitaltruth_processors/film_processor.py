import logging

import pandas as pd

from digitaltruth_transformer.digitaltruth_processors.base import add_audit_information

COLUMNS_ORDER = ["id", "film", "created_at", "updated_at", "active"]


def process_films_data(films_df: pd.DataFrame, full_film_list) -> pd.DataFrame:
    """
    Processes the films DataFrame by normalizing, merging with catalog, and adding audit columns.

    Args:
        films_df (pandas.DataFrame): The DataFrame containing film data.
        full_film_list (array-like): Raw list of film names.

    Returns:
        pandas.DataFrame: The processed DataFrame with additional columns.
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting film data processing.")

    # Normalize raw film names
    full_df = pd.DataFrame(full_film_list, columns=["film"])
    full_df["film"] = (
        full_df["film"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )
    full_df = full_df.drop_duplicates()
    logger.debug(
        f"Normalized and deduplicated raw film names: {full_df['film'].unique()}"
    )

    # Normalize the catalog
    films_df = films_df.copy()
    films_df["film"] = (
        films_df["film"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )
    logger.debug("Normalized film catalog.")

    # Merge with catalog on matched name
    merged_df = pd.merge(
        full_df,
        films_df,
        left_on="film",
        right_on="film",
        how="left",
        suffixes=("_raw", ""),
    )
    logger.info(f"Merged film data, count: {len(merged_df)}")

    # Add audit information
    audited_df = add_audit_information(merged_df)
    logger.info("Added audit information.")

    # Select and order final columns
    final_columns = [col for col in COLUMNS_ORDER if col in audited_df.columns]
    result_df = (
        audited_df[final_columns]
        .sort_values(by="id", na_position="last")
        .reset_index(drop=True)
    )
    logger.info("Film data processing complete.")

    return result_df
