import logging
from pathlib import Path

import config
from digitaltruth_processor.utils.read_data import read_data_from_file, read_raw_json


def read_silver_tables():
    """Read silver parquet tables from data/processed/."""
    logger = logging.getLogger(__name__)
    logger.info("Reading silver parquet inputs.")

    developing_times = {
        "df": read_data_from_file(config.DEVELOPING_TIMES_OUT, "parquet"),
        "metadata": read_raw_json(config.DEVELOPING_TIMES_METADATA_PATH),
    }
    film_format = {
        "df": read_data_from_file(config.FORMAT_OUT, "parquet"),
        "metadata": read_raw_json(config.FORMAT_METADATA_PATH),
    }
    developers = {
        "df": read_data_from_file(config.DEVELOPERS_OUT, "parquet"),
        "metadata": read_raw_json(config.DEVELOPERS_METADATA_PATH),
    }
    films = {
        "df": read_data_from_file(config.FILMS_OUT, "parquet"),
        "metadata": read_raw_json(config.FILM_METADATA_PATH),
    }

    for label, payload in [
        ("developing_times", developing_times),
        ("formats", film_format),
        ("developers", developers),
        ("films", films),
    ]:
        path = {
            "developing_times": config.DEVELOPING_TIMES_OUT,
            "formats": config.FORMAT_OUT,
            "developers": config.DEVELOPERS_OUT,
            "films": config.FILMS_OUT,
        }[label]
        if not Path(path).exists():
            raise FileNotFoundError(
                f"Silver table missing for {label}: {path}. Run the processor first."
            )
        logger.debug("Loaded silver %s from %s", label, path)

    logger.info("Silver tables loaded.")
    return developing_times, film_format, developers, films
