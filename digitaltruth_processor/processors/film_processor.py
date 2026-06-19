import logging

import pandas as pd

from film_core.audit import add_audit_information
from film_core.normalize import normalize_text

COLUMNS_ORDER = ["id", "film", "value", "created_at", "updated_at", "active"]


def process_films_silver(films_df: pd.DataFrame) -> pd.DataFrame:
    """Silver layer: typed film dropdown catalog from bronze JSON."""
    logger = logging.getLogger(__name__)
    logger.info("Processing silver film catalog.")

    df = films_df.copy()
    if "film" in df.columns:
        df["film"] = normalize_text(df["film"])

    audited = add_audit_information(df)
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].reset_index(drop=True)
