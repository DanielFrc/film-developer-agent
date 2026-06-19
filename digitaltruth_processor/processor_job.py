import logging

import config
from digitaltruth_processor.processors.developer_processor import (
    process_developers_silver,
)
from digitaltruth_processor.processors.developing_times_processor import (
    process_developing_times_silver,
)
from digitaltruth_processor.processors.film_processor import process_films_silver
from digitaltruth_processor.processors.format_processor import process_formats_silver
from digitaltruth_processor.processors.read_catalogs import read_catalogs
from digitaltruth_transformer.utils.save_data import save_to_parquet
from logger.logger_config import setup_logging


def run_processor():
    """Silver stage: bronze JSON -> typed parquet under data/processed/."""
    setup_logging(config.LOG_CONFIG, config.LOG_PATH, config.PROCESSOR_LOG)
    logger = logging.getLogger(__name__)
    logger.info("Starting silver processor.")

    developing_times, film_format, developers, films = read_catalogs()

    films_df = process_films_silver(films["df"])
    developers_df = process_developers_silver(developers["df"])
    formats_df = process_formats_silver(film_format["df"])
    times_df = process_developing_times_silver(developing_times["df"])

    logger.info("Saving silver parquet outputs.")
    save_to_parquet(formats_df, film_format["metadata"], config.FORMAT_OUT)
    save_to_parquet(developers_df, developers["metadata"], config.DEVELOPERS_OUT)
    save_to_parquet(films_df, films["metadata"], config.FILMS_OUT)
    save_to_parquet(
        times_df, developing_times["metadata"], config.DEVELOPING_TIMES_OUT
    )
    logger.info("Silver processor complete.")


if __name__ == "__main__":
    run_processor()
