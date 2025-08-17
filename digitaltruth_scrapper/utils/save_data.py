import hashlib
import json
import logging
from datetime import datetime

from config import RAW_PATH

logger = logging.getLogger(__name__)
scrape_date = datetime.now().strftime("%Y%m%d_%H%M%S")


def _get_safe_file_name(file_name: str) -> str:
    """Sanitize and format the file name for saving."""
    return file_name.replace(" ", "_").replace(".", "_").replace("/", "_").lower()


def _generate_json_metadata(
    data: list[dict],
    source_url: str = "",
    site_version: str = "unknown",
    scrapper_version: str = "v1.0.0",
) -> dict:
    """
    Generate metadata for a JSON data export.

    Args:
        data: The data to hash and describe.
        source_url: The source URL of the data.
        site_version: The version of the site scraped.
        scrapper_version: The version of the scrapper.

    Returns:
        A dictionary containing metadata.
    """
    logger.info("Generating metadata for json")

    data_hash = hashlib.sha256(
        json.dumps(data, sort_keys=True).encode("utf-8")
    ).hexdigest()

    record_count = len(data)
    estimated_file_size_bytes = len(json.dumps(data).encode("utf-8"))

    metadata = {
        "source_url": source_url,
        "scrape_date": scrape_date,
        "site_version": site_version,
        "scrapper_version": scrapper_version,
        "data_hash": data_hash,
        "record_count": record_count,
        "estimated_file_size_bytes": estimated_file_size_bytes,
    }

    logger.debug(f"Data hash: {metadata['data_hash']}")

    return metadata


def save_data_to_json(
    data: list[dict],
    file_name: str,
    source_url: str = "",
    site_version: str = "unknown",
    scrapper_version: str = "v1.0.0",
) -> None:
    """
    Saves a sequence of dictionaries to a JSON file.

    Args:
        data: Sequence of dictionaries to save.
        file_name: Name of the file (without extension/path).
    """
    if not data:
        logger.warning("No data provided to save.")
        return

    safe_file_name = _get_safe_file_name(file_name)
    full_name = f"{RAW_PATH
}/{safe_file_name}.json"
    metadata_name = f"{RAW_PATH
}/{safe_file_name}.meta.json"

    metadata = _generate_json_metadata(data, source_url, site_version, scrapper_version)

    try:
        RAW_PATH.mkdir(parents=True, exist_ok=True)

        with open(full_name, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        logger.info(f"Data saved to {full_name} successfully.")

        with open(metadata_name, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=4)
        logger.info(f"metadata saved to {metadata_name} successfully.")

    except Exception as e:
        logger.error(f"Failed to save data to {full_name}: {e}")
