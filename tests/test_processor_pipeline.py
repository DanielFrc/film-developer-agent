from pathlib import Path

import pyarrow.parquet as pq

import config
from digitaltruth_processor.processor_job import run_processor
from film_core.validation import validate_silver_dataset


def test_processor_writes_valid_silver_parquet(isolated_data_dir: Path):
    run_processor()

    errors = validate_silver_dataset(
        Path(config.FILMS_OUT),
        Path(config.DEVELOPERS_OUT),
        Path(config.FORMAT_OUT),
        Path(config.DEVELOPING_TIMES_OUT),
    )
    assert errors == []

    table = pq.read_table(config.DEVELOPING_TIMES_OUT)
    assert "35mm" in table.column_names
    assert "dev_time" not in table.column_names
