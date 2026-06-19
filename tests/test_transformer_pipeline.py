from pathlib import Path

import config
from digitaltruth_transformer.digitaltruth_transformer_job import run_transformer
from film_core.validation import validate_processed_dataset


def test_transformer_writes_valid_parquet(isolated_data_dir: Path):
    run_transformer()

    errors = validate_processed_dataset(
        Path(config.FILMS_OUT),
        Path(config.DEVELOPERS_OUT),
        Path(config.FORMAT_OUT),
        Path(config.DEVELOPING_TIMES_OUT),
    )
    assert errors == []

    times_path = Path(config.DEVELOPING_TIMES_OUT)
    assert times_path.exists()
