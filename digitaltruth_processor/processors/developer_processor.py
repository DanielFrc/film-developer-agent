import logging

import pandas as pd

from film_core.audit import add_audit_information
from film_core.normalize import normalize_text

COLUMNS_ORDER = ["id", "developer", "value", "created_at", "updated_at", "active"]


def process_developers_silver(developers_df: pd.DataFrame) -> pd.DataFrame:
    """Silver layer: typed developer dropdown catalog from bronze JSON."""
    logger = logging.getLogger(__name__)
    logger.info("Processing silver developer catalog.")

    df = developers_df.copy()
    if "developer" in df.columns:
        df["developer"] = normalize_text(df["developer"])

    audited = add_audit_information(df)
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].reset_index(drop=True)
