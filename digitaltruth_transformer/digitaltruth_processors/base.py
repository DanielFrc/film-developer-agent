import logging

import pandas as pd


def add_audit_information(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds audit columns to a DataFrame:
    - id: Sequential identifier starting from 1
    - created_at: Timestamp when the row was processed
    - updated_at: Timestamp when the row was processed
    - active: Boolean flag for row activity

    Args:
        df (pd.DataFrame): Input DataFrame.

    Returns:
        pd.DataFrame: DataFrame with audit columns added.
    """
    now = pd.Timestamp.now()

    df = df.copy()
    df["id"] = range(1, len(df) + 1)

    df["created_at"] = now
    df["updated_at"] = now
    df["active"] = True

    return df


def get_catalog_id(row, df, desc_column, id_column):
    """
    Helper function to get the catalog ID for a given description value.

    Args:
        row (pd.Series): Row from the DataFrame.
        df (pd.DataFrame): Catalog DataFrame.
        desc_column (str): Column name to match.
        id_column (str): Column name for the ID.

    Returns:
        The matched ID or None if not found.
    """
    match = df[df[desc_column] == row[desc_column]]
    if not match.empty:
        return match.iloc[0][id_column]
    logging.getLogger(__name__).warning(
        f"No value for {desc_column}: {row[desc_column]}"
    )
    return None
