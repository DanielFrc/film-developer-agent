import logging

import pandas as pd

from film_core.audit import add_audit_information
from film_core.normalize import normalize_text

SILVER_COLUMNS = [
    "id",
    "film",
    "developer",
    "iso",
    "dilution",
    "35mm",
    "120",
    "sheet",
    "temp",
    "notes",
    "created_at",
    "updated_at",
    "active",
]


def process_developing_times_silver(times_df: pd.DataFrame) -> pd.DataFrame:
    """
    Silver layer: cleaned wide-format developing times (no melt, no foreign keys).
    """
    logger = logging.getLogger(__name__)
    logger.info("Processing silver developing times.")

    df = times_df.copy()
    df["film"] = normalize_text(df["film"])
    df["developer"] = normalize_text(df["developer"])
    df = df.query('developer != "*see notes*"').drop_duplicates()

    audited = add_audit_information(df)
    columns = [col for col in SILVER_COLUMNS if col in audited.columns]
    result = audited[columns].reset_index(drop=True).sort_values(by="id")
    logger.info("Silver developing times count: %s", len(result))
    return result
