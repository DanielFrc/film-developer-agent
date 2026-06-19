import logging
import random

import requests

from config import (
    DIGITAL_TRUTH_FILM_URL,
    DIGITALTRUTH_URL,
    RANDOM_HEADERS,
    SCRAPE_DELAY_MAX,
    SCRAPE_DELAY_MIN,
)
from digitaltruth_scrapper.utils.random_delay import random_delay

logger = logging.getLogger(__name__)


def __build_digitaltruth_url(film_name: str | None = None) -> str:
    """Constructs the DigitalTruth URL for a given film name or general search."""
    if film_name:
        return DIGITAL_TRUTH_FILM_URL.replace(
            "<FILM>", film_name.replace(" ", "+").replace("&", "%26")
        )
    return DIGITALTRUTH_URL


def get_digitaltruth_info(
    film_name: str | None = None, timeout: int = 30
) -> str | None:
    """
    Fetches information from DigitalTruth for a specific film or general data.

    Args:
        film_name: The name of the film to search for (optional).
        timeout: Timeout for the HTTP request in seconds (default: 30).

    Returns:
        The response text if successful, otherwise None.
    """

    url = __build_digitaltruth_url(film_name)
    headers = {"User-Agent": random.choice(RANDOM_HEADERS)}

    if film_name:
        logger.info(f"Fetching information for film: {film_name}")
        random_delay(SCRAPE_DELAY_MIN, SCRAPE_DELAY_MAX)
    else:
        logger.info("Fetching general digitaltruth information.")

    try:
        logger.info(f"Requesting URL: {url} with User-Agent: {headers['User-Agent']}")

        response = requests.get(url, headers=headers, timeout=timeout)

        response.raise_for_status()
        return response.text

    except requests.RequestException as e:

        logger.error(f"An error occurred while fetching data: {e}")
        return None

    except Exception as e:
        logger.exception(f"Unexpected error: {e}")
        return None
