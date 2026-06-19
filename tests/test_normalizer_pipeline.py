from pathlib import Path

import config
from digitaltruth_normalizer.normalizer_job import run_normalizer
from digitaltruth_processor.processor_job import run_processor
from film_core.validation import validate_gold_dataset


def test_normalizer_writes_valid_gold_parquet(isolated_data_dir: Path):
    run_processor()
    run_normalizer()

    errors = validate_gold_dataset(
        Path(config.GOLD_FILMS_OUT),
        Path(config.GOLD_DEVELOPERS_OUT),
        Path(config.GOLD_FORMAT_OUT),
        Path(config.GOLD_DEVELOPING_TIMES_OUT),
    )
    assert errors == []

    assert Path(config.GOLD_DEVELOPING_TIMES_OUT).exists()
    assert Path(config.FILMS_OUT).exists()
