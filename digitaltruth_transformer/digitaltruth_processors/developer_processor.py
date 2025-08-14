import logging

import pandas as pd

from digitaltruth_transformer.digitaltruth_processors.base import add_audit_information

COLUMNS_ORDER = [
    "id",
    "developer",
    "created_at",
    "updated_at",
    "active",
]


def process_developers_data(
    developers_df: pd.DataFrame, full_developers_list
) -> pd.DataFrame:
    """
    Normalizes and enriches a list of developer names by matching against a catalog,
    then adds audit information.

    Args:
        developers_df (pd.DataFrame): Reference developer catalog.
        full_developers_list (array-like): Raw list of developer names.

    Returns:
        pd
    """

    logger = logging.getLogger(__name__)
    logger.info("Starting developer data processing.")

    # Normalize raw developer names
    full_df = pd.DataFrame(full_developers_list, columns=["developer"])
    full_df["developer"] = (
        full_df["developer"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )
    logger.debug(f"Normalized raw developer names: {full_df['developer'].unique()}")

    # Remove unwanted entries and duplicates
    full_df = full_df.query('developer != "*see notes*"').drop_duplicates()
    logger.info(f"Filtered and deduplicated developer list, count: {len(full_df)}")

    # Normalize the catalog
    developers_df = developers_df.copy()
    developers_df["developer"] = (
        developers_df["developer"]
        .astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )

    logger.debug("Normalized developer catalog.")

    # Merge with catalog on matched name
    merged_df = pd.merge(
        full_df,
        developers_df,
        left_on="developer",
        right_on="developer",
        how="left",
        suffixes=("_raw", ""),
    )
    logger.info(f"Merged developer data, count: {len(merged_df)}")

    # Audit info
    audited_df = add_audit_information(merged_df)
    logger.info("Added audit information.")

    # Select columns
    final_columns = [col for col in COLUMNS_ORDER if col in audited_df.columns]

    result_df = (
        audited_df[final_columns]
        .sort_values(by="id", na_position="last")
        .reset_index(drop=True)
    )

    logger.info("Developer data processing complete.")

    return result_df
