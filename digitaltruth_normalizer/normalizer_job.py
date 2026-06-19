import logging

import config
from digitaltruth_normalizer.processors.developer_processor import (
    process_developers_gold,
)
from digitaltruth_normalizer.processors.developing_times_processor import (
    process_developing_times_gold,
)
from digitaltruth_normalizer.processors.film_processor import process_films_gold
from digitaltruth_normalizer.processors.format_processor import process_formats_gold
from digitaltruth_normalizer.processors.read_silver import read_silver_tables
from digitaltruth_transformer.utils.save_data import save_to_parquet
from logger.logger_config import setup_logging


def run_normalizer():
    """Gold stage: silver parquet -> normalized parquet under data/normalized/."""
    setup_logging(config.LOG_CONFIG, config.LOG_PATH, config.NORMALIZER_LOG)
    logger = logging.getLogger(__name__)
    logger.info("Starting gold normalizer.")

    developing_times, film_format, developers, films = read_silver_tables()

    full_developers_list = developing_times["df"]["developer"].unique()
    full_film_list = developing_times["df"]["film"].unique()

    developers_df = process_developers_gold(developers["df"], full_developers_list)
    formats_df = process_formats_gold(film_format["df"])
    films_df = process_films_gold(films["df"], full_film_list)
    times_df = process_developing_times_gold(
        developing_times["df"],
        developers_df,
        films_df,
        formats_df,
    )

    logger.info("Saving gold parquet outputs.")
    save_to_parquet(formats_df, film_format["metadata"], config.GOLD_FORMAT_OUT)
    save_to_parquet(developers_df, developers["metadata"], config.GOLD_DEVELOPERS_OUT)
    save_to_parquet(films_df, films["metadata"], config.GOLD_FILMS_OUT)
    save_to_parquet(
        times_df, developing_times["metadata"], config.GOLD_DEVELOPING_TIMES_OUT
    )
    logger.info("Gold normalizer complete.")


if __name__ == "__main__":
    run_normalizer()
