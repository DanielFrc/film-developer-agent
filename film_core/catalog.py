import logging

import pandas as pd


def get_catalog_id(row: pd.Series, df: pd.DataFrame, desc_column: str, id_column: str):
    """Return the catalog id for a matching description value."""
    match = df[df[desc_column] == row[desc_column]]
    if not match.empty:
        return match.iloc[0][id_column]
    logging.getLogger(__name__).warning(
        "No value for %s: %s", desc_column, row[desc_column]
    )
    return None
