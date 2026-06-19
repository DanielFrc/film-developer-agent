import logging

import pandas as pd

from film_core.audit import add_audit_information

COLUMNS_ORDER = ["id", "developer", "value", "created_at", "updated_at", "active"]


def process_developers_gold(
    developers_df: pd.DataFrame, full_developers_list
) -> pd.DataFrame:
    """Gold layer: developer dimension from fact-table uniqueness merged with silver catalog."""
    logger = logging.getLogger(__name__)
    logger.info("Processing gold developer dimension.")

    full_df = (
        pd.DataFrame(full_developers_list, columns=["developer"])
        .query('developer != "*see notes*"')
        .drop_duplicates()
    )
    merged = pd.merge(
        full_df,
        developers_df,
        on="developer",
        how="left",
        suffixes=("_fact", ""),
    )
    audited = add_audit_information(merged)
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].sort_values(by="id").reset_index(drop=True)
