import logging
from typing import Any

from config import EMPTY_VALUE, SEARCHBOX_VALUE
from digitaltruth_scrapper.digitaltruth.parser_helpers import get_input_from_content

logger = logging.getLogger(__name__)


def parse_film_list(html_content: str | None) -> list[dict[str, Any]]:
    """
    Parses the film list from the DigitalTruth page HTML content.

    Args:
        html_content: The HTML content of the DigitalTruth page.

    Returns:
        A list of dictionaries with film names and their values.
    """
    if not html_content:
        logger.error("Failed to fetch DigitalTruth information.")
        return []

    logger.info("Parsing film list from HTML content.")
    select_input = get_input_from_content(html_content, "select", "Film", "option")
    if not select_input:
        logger.warning("No film <select> input found on the page.")
        return []

    logger.info("Extracting films from the select input.")

    film_list = [
        {"film": option.get_text(strip=True), "value": option.get("value")}
        for option in select_input
        if (
            (option.get_text(strip=True) and option.get("value"))
            and (option.get("value") not in {SEARCHBOX_VALUE, EMPTY_VALUE})
        )
    ]

    if not film_list:
        logger.info("No films found in the select input.")

    return film_list
