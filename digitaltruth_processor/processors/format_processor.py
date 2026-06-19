import logging

import pandas as pd

from film_core.audit import add_audit_information

COLUMNS_ORDER = ["id", "format", "description", "created_at", "updated_at", "active"]


def process_formats_silver(formats_df: pd.DataFrame) -> pd.DataFrame:
    """Silver layer: curated format catalog with audit columns."""
    logger = logging.getLogger(__name__)
    logger.info("Processing silver format catalog.")

    audited = add_audit_information(formats_df.copy())
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].reset_index(drop=True)
