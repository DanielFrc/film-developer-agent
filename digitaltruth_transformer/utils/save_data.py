import logging
import os
import shutil
from datetime import datetime

import pyarrow as pa
import pyarrow.parquet as pq

from config import HISTORICAL_PATH


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

        existing_meta = table.schema.metadata or {}

        new_meta = {
            "source_url": metadata["source_url"],
            "scrape_date": metadata["scrape_date"],
            "site_version": metadata["site_version"],
            "scrapper_version": metadata["scrapper_version"],
            "source_hash": metadata["data_hash"],
            "record_count": len(df),
        }

        merged_meta = {**existing_meta, **new_meta}
        merged_meta = {k: str(v).encode() for k, v in merged_meta.items()}

        table = table.replace_schema_metadata(merged_meta)
        pq.write_table(table, path)

        logger.info(f"Saved DataFrame to {path}")

    except Exception as e:
        logger.error(f"Failed to save {path}: {e}")


def move_to_historical(filepath, historical_dir=HISTORICAL_PATH):
    """
    Moves the current output file to a historical directory with a timestamp before overwriting.

    Args:
        filepath (str): Path to the file to be moved.
        historical_dir (str): Directory for historical files.
    """
    logger = logging.getLogger(__name__)
    if os.path.exists(filepath):
        # Ensure historical directory exists
        os.makedirs(historical_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = os.path.basename(filepath)
        hist_path = os.path.join(historical_dir, f"{timestamp}_{filename}")
        shutil.move(filepath, hist_path)
        logger.info(f"Moved {filepath} to {hist_path}")
