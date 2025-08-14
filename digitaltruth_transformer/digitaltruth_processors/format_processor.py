import logging

import pandas as pd

from digitaltruth_transformer.digitaltruth_processors.base import add_audit_information

COLUMNS_ORDER = [
    "id",
    "format",
    "description",
    "created_at",
    "updated_at",
    "active",
]


def process_format_data(formats_df: pd.DataFrame) -> pd.DataFrame:
    """
    Processes the format DataFrame by adding audit columns and selecting relevant fields.

    Args:
        formats_df (pd.DataFrame): The DataFrame containing format data.

    Returns:
        pd.DataFrame: The processed DataFrame with audit columns.
    """
    logger = logging.getLogger(__name__)
    logger.info("Starting format data processing.")

    # Add audit information to the DataFrame
    audited_df = add_audit_information(formats_df)
    logger.info("Added audit information to format data.")

    # Select and order final columns
    final_columns = [col for col in COLUMNS_ORDER if col in audited_df.columns]
    result_df = (
        audited_df[final_columns]
        .sort_values(by="id", na_position="last")
        .reset_index(drop=True)
    )
    logger.info("Format data processing complete.")

    return result_df
