import logging

import pandas as pd

from film_core.audit import add_audit_information

COLUMNS_ORDER = ["id", "film", "value", "created_at", "updated_at", "active"]


def process_films_gold(
    films_df: pd.DataFrame, full_film_list
) -> pd.DataFrame:
    """Gold layer: film dimension built from fact-table uniqueness merged with silver catalog."""
    logger = logging.getLogger(__name__)
    logger.info("Processing gold film dimension.")

    full_df = pd.DataFrame(full_film_list, columns=["film"]).drop_duplicates()
    merged = pd.merge(
        full_df,
        films_df,
        on="film",
        how="left",
        suffixes=("_fact", ""),
    )
    audited = add_audit_information(merged)
    columns = [col for col in COLUMNS_ORDER if col in audited.columns]
    return audited[columns].sort_values(by="id").reset_index(drop=True)
