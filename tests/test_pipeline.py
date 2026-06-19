from pathlib import Path
from unittest.mock import patch

from film_core.pipeline import run_pipeline


def test_run_pipeline_process_and_normalize_only(isolated_data_dir: Path):
    with patch("digitaltruth_scrapper.digitaltruth_scrapper_job.run_scrapper") as mock_scrape:
        manifest = run_pipeline(
            run_scrape=False, run_process=True, run_normalize=True
        )

    mock_scrape.assert_not_called()
    assert manifest.status == "success"
    assert manifest.stages["process"].status == "success"
    assert manifest.stages["normalize"].status == "success"

    assert (isolated_data_dir / "processed").exists()
    assert (isolated_data_dir / "normalized").exists()
    assert (isolated_data_dir / "manifests" / f"{manifest.run_id}.json").exists()
