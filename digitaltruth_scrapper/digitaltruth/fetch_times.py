import logging
from typing import Any

from digitaltruth_scrapper.digitaltruth.parser_helpers import get_table_from_content

logger = logging.getLogger(__name__)

COLUMN_NAMES = [
    "film",
    "developer",
    "dilution",
    "iso",
    "35mm",
    "120",
    "sheet",
    "temp",
    "notes",
]


def get_film_information(html_content: str) -> list[dict[str, Any]]:
    """
    Fetches and parses film development information for a given film name.

    Args:
        film_name: The name of the film to fetch information for.

    Returns:
        A list of dictionaries, each containing film development data.
    """

    if not html_content:
        logger.error("Failed to fetch DigitalTruth information.")
        return []

    rows = get_table_from_content(html_content, "table", "mdctable", "tr")
    results = []

    logger.info("Extracting film development data from table rows.")

    for r in rows:
        columns = [
            td.text.strip() if td.text.strip() != "" else None
            for td in r.find_all("td")
        ]

        if len(columns) == len(COLUMN_NAMES):
            results.append(dict(zip(COLUMN_NAMES, columns, strict=False)))
        elif columns:
            logger.warning("Skipping row with unexpected number of columns")

    if not results:
        logger.info("No film development data found in the table.")

    return results
