import logging

import config
from digitaltruth_processor.utils.read_data import read_data_from_file, read_raw_json


def read_catalogs():
    """Read bronze JSON sources for the silver processor."""
    logger = logging.getLogger(__name__)
    logger.info("Reading bronze catalog sources.")

    developing_times = {
        "df": read_data_from_file(config.DEVELOPING_TIMES_PATH),
        "metadata": read_raw_json(config.DEVELOPING_TIMES_METADATA_PATH),
    }
    film_format = {
        "df": read_data_from_file(config.FORMAT_PATH),
        "metadata": read_raw_json(config.FORMAT_METADATA_PATH),
    }
    developers = {
        "df": read_data_from_file(config.DEVELOPERS_PATH),
        "metadata": read_raw_json(config.DEVELOPERS_METADATA_PATH),
    }
    films = {
        "df": read_data_from_file(config.FILM_PATH),
        "metadata": read_raw_json(config.FILM_METADATA_PATH),
    }

    logger.info("Bronze catalog sources loaded.")
    return developing_times, film_format, developers, films
