import logging

from config import (
    DEVELOPERS_OUT,
    DEVELOPING_TIMES_OUT,
    FILMS_OUT,
    FORMAT_OUT,
    LOG_CONFIG,
    LOG_PATH,
    TRANSFORMER_LOG,
)
from digitaltruth_transformer.digitaltruth_processors.developer_processor import (
    process_developers_data,
)
from digitaltruth_transformer.digitaltruth_processors.developing_times_processor import (
    process_developers_times_data,
)
from digitaltruth_transformer.digitaltruth_processors.film_processor import (
    process_films_data,
)
from digitaltruth_transformer.digitaltruth_processors.format_processor import (
    process_format_data,
)
from digitaltruth_transformer.digitaltruth_processors.read_catalogs import read_catalogs
from digitaltruth_transformer.utils.save_data import save_to_parquet
from logger.logger_config import setup_logging


def run_transformer():
    setup_logging(LOG_CONFIG, LOG_PATH, TRANSFORMER_LOG)
    setup_logging("logger/logging_config.ini", "logs/", "digitaltruthtransformer.log")
    logger = logging.getLogger(__name__)

    logger.info("Starting data processing pipeline.")

    logger.info("Reading digitaltruth raw data from source")
    developing_times, film_format, developers, films = read_catalogs()

    logger.info("Getting complementary catalogs")
    full_developers_list = developing_times["df"]["developer"].unique()
    full_film_list = developing_times["df"]["film"].unique()

    logger.info("Executing transformers")

    developers_df = process_developers_data(developers["df"], full_developers_list)
    film_format_df = process_format_data(film_format["df"])
    films_df = process_films_data(films["df"], full_film_list)

    developing_times_df = process_developers_times_data(
        developing_times["df"],
        developers_df,
        films_df,
        film_format_df,
    )

    logger.info("Saving final output to parquets")

    save_to_parquet(film_format_df, film_format["metadata"], FORMAT_OUT)
    save_to_parquet(developers_df, developers["metadata"], DEVELOPERS_OUT)
    save_to_parquet(films_df, films["metadata"], FILMS_OUT)
    save_to_parquet(
        developing_times_df, developing_times["metadata"], DEVELOPING_TIMES_OUT
    )


if __name__ == "__main__":
    run_transformer()
