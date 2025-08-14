import json
import logging

from config import (
    DEVELOPERS_METADATA_PATH,
    DEVELOPERS_PATH,
    DEVELOPING_TIMES_METADATA_PATH,
    DEVELOPING_TIMES_PATH,
    FILM_METADATA_PATH,
    FILM_PATH,
    FORMAT_METADATA_PATH,
    FORMAT_PATH,
)
from digitaltruth_transformer.utils.read_data import read_data_from_file, read_raw_json


def _read_metadata(file_path):
    with open(file_path) as f:
        data = json.load(f)

    return data


def read_catalogs():
    """
    Reads all required data sources and returns them as DataFrames.

    Returns:
        Tuple of DataFrames: (developing_times_df, film_format_df, developers_df, films_df)
    """
    logger = logging.getLogger(__name__)
    logger.info("Reading all catalog data sources.")

    developing_times = {
        "df": read_data_from_file(DEVELOPING_TIMES_PATH),
        "metadata": read_raw_json(DEVELOPING_TIMES_METADATA_PATH),
    }
    logger.debug(f"Loaded developing times data from {DEVELOPING_TIMES_PATH}")

    # Read film format data
    film_format = {
        "df": read_data_from_file(FORMAT_PATH),
        "metadata": read_raw_json(FORMAT_METADATA_PATH),
    }

    logger.debug(f"Loaded film format data from {FORMAT_PATH}")

    # Read developers data
    developers = {
        "df": read_data_from_file(DEVELOPERS_PATH),
        "metadata": read_raw_json(DEVELOPERS_METADATA_PATH),
    }

    logger.debug(f"Loaded developers data from {DEVELOPERS_PATH}")

    # Read films data
    films = {
        "df": read_data_from_file(FILM_PATH),
        "metadata": read_raw_json(FILM_METADATA_PATH),
    }
    logger.debug(f"Loaded films data from {FILM_PATH}")

    logger.info("All catalog data sources loaded successfully.")

    return developing_times, film_format, developers, films
