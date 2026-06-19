import logging
import os
import shutil
from datetime import datetime

import pyarrow as pa
import pyarrow.parquet as pq

import config


def save_to_parquet(df, metadata, path):
    """
    Saves a DataFrame to a parquet file. If the file exists, moves the old file to the historical directory first.

    Args:
        df (pd.DataFrame): DataFrame to save.
        path (str): Destination file path.
    """
    logger = logging.getLogger(__name__)
    try:
        move_to_historical(path)

        table = pa.Table.from_pandas(df)

        existing_meta = dict(table.schema.metadata or {})

        custom_meta = {
            b"source_url": str(metadata["source_url"]).encode("utf-8"),
            b"scrape_date": str(metadata["scrape_date"]).encode("utf-8"),
            b"site_version": str(metadata["site_version"]).encode("utf-8"),
            b"scrapper_version": str(metadata["scrapper_version"]).encode("utf-8"),
            b"source_hash": str(metadata["data_hash"]).encode("utf-8"),
            b"record_count": str(len(df)).encode("utf-8"),
        }
        existing_meta.update(custom_meta)

        table = table.replace_schema_metadata(existing_meta)
        pq.write_table(table, path)

        logger.info(f"Saved DataFrame to {path}")

    except Exception as e:
        logger.error(f"Failed to save {path}: {e}")


def move_to_historical(filepath, historical_dir=None):
    """
    Moves the current output file to a historical directory with a timestamp before overwriting.

    Args:
        filepath (str): Path to the file to be moved.
        historical_dir (str): Directory for historical files.
    """
    logger = logging.getLogger(__name__)
    historical_dir = historical_dir or config.HISTORICAL_PATH
    if os.path.exists(filepath):
        # Ensure historical directory exists
        os.makedirs(historical_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(filepath)
        hist_path = os.path.join(historical_dir, f"{timestamp}_{filename}")
        shutil.move(filepath, hist_path)
        logger.info(f"Moved {filepath} to {hist_path}")
