import hashlib
import json
import logging
from datetime import datetime

from film_core.storage import get_storage

logger = logging.getLogger(__name__)


def _get_safe_file_name(file_name: str) -> str:
    return file_name.replace(" ", "_").replace(".", "_").replace("/", "_").lower()


def _generate_json_metadata(
    data: list[dict],
    source_url: str = "",
    site_version: str = "unknown",
    scrapper_version: str = "v1.0.0",
) -> dict:
    scrape_date = datetime.now().strftime("%Y%m%d_%H%M%S")
    data_hash = hashlib.sha256(
        json.dumps(data, sort_keys=True).encode("utf-8")
    ).hexdigest()

    return {
        "source_url": source_url,
        "scrape_date": scrape_date,
        "site_version": site_version,
        "scrapper_version": scrapper_version,
        "data_hash": data_hash,
        "record_count": len(data),
        "estimated_file_size_bytes": len(json.dumps(data).encode("utf-8")),
    }


def save_data_to_json(
    data: list[dict],
    file_name: str,
    source_url: str = "",
    site_version: str = "unknown",
    scrapper_version: str = "v1.0.0",
) -> None:
    """Save scraped records and metadata JSON under data/raw/."""
    if not data:
        logger.warning("No data provided to save.")
        return

    storage = get_storage()
    safe_file_name = _get_safe_file_name(file_name)
    data_key = f"raw/{safe_file_name}.json"
    meta_key = f"raw/{safe_file_name}.meta.json"

    metadata = _generate_json_metadata(data, source_url, site_version, scrapper_version)

    try:
        storage.write_json(data_key, data, indent=4)
        storage.write_json(meta_key, metadata, indent=4)
        logger.info("Data saved to %s", storage.resolve(data_key))
        logger.info("Metadata saved to %s", storage.resolve(meta_key))
    except OSError as exc:
        logger.error("Failed to save data to %s: %s", data_key, exc)
