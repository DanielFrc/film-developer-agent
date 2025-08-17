import logging
from typing import Any

from config import EMPTY_VALUE, SEARCHBOX_VALUE
from digitaltruth_scrapper.digitaltruth.parser_helpers import get_input_from_content

logger = logging.getLogger(__name__)


def parse_developer_list(html_content: str | None) -> list[dict[str, Any]]:
    """
    Fetches and parses the developer list from the DigitalTruth page.

    Returns:
        A list of dictionaries with developer names and their values.
    """

    if not html_content:
        logger.error("Failed to fetch DigitalTruth information.")
        return []

    logger.info("Parsing developer list from HTML content.")
    select_input = get_input_from_content(html_content, "select", "Developer", "option")
    if not select_input:
        logger.warning("No developer <select> input found on the page.")
        return []

    logger.info("Extracting developers from the select input.")

    developer_list = [
        {"developer": option.get_text(strip=True), "value": option.get("value")}
        for option in select_input
        if (
            (option.get_text(strip=True) and option.get("value"))
            and (option.get("value") not in {SEARCHBOX_VALUE, EMPTY_VALUE})
        )
    ]

    if not developer_list:
        logger.info("No developers found in the select input.")

    return developer_list
