import logging

import pandas as pd

from film_core.audit import add_audit_information

COLUMNS_ORDER = ["id", "format", "description", "created_at", "updated_at", "active"]


def process_formats_gold(formats_df: pd.DataFrame) -> pd.DataFrame:
    """Gold layer: format dimension with stable audit columns."""
    logger = logging.getLogger(__name__)
    logger.info("Processing gold format dimension.")

    audited = add_audit_information(formats_df.copy())
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].sort_values(by="id").reset_index(drop=True)
