import logging

import config
from digitaltruth_transformer.utils.read_data import read_data_from_file, read_raw_json


def read_catalogs():
    """
    Reads all required data sources and returns them as DataFrames.

    Returns:
        Tuple of DataFrames: (developing_times_df, film_format_df, developers_df, films_df)
    """
    logger = logging.getLogger(__name__)
    logger.info("Reading all catalog data sources.")

    developing_times = {
        "df": read_data_from_file(config.DEVELOPING_TIMES_PATH),
        "metadata": read_raw_json(config.DEVELOPING_TIMES_METADATA_PATH),
    }
    logger.debug(f"Loaded developing times data from {config.DEVELOPING_TIMES_PATH}")

    film_format = {
        "df": read_data_from_file(config.FORMAT_PATH),
        "metadata": read_raw_json(config.FORMAT_METADATA_PATH),
    }

    logger.debug(f"Loaded film format data from {config.FORMAT_PATH}")

    developers = {
        "df": read_data_from_file(config.DEVELOPERS_PATH),
        "metadata": read_raw_json(config.DEVELOPERS_METADATA_PATH),
    }

    logger.debug(f"Loaded developers data from {config.DEVELOPERS_PATH}")

    films = {
        "df": read_data_from_file(config.FILM_PATH),
        "metadata": read_raw_json(config.FILM_METADATA_PATH),
    }
    logger.debug(f"Loaded films data from {config.FILM_PATH}")

    logger.info("All catalog data sources loaded successfully.")

    return developing_times, film_format, developers, films
