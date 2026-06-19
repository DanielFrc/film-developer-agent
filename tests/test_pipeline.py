from pathlib import Path
from unittest.mock import patch

from film_core.pipeline import run_pipeline


def test_run_pipeline_transform_only(isolated_data_dir: Path):
    with patch("digitaltruth_scrapper.digitaltruth_scrapper_job.run_scrapper") as mock_scrape:
        manifest = run_pipeline(run_scrape=False, run_transform=True)

    mock_scrape.assert_not_called()
    assert manifest.status == "success"
    assert "transform" in manifest.stages
    assert manifest.stages["transform"].status == "success"

    manifest_path = isolated_data_dir / "manifests" / f"{manifest.run_id}.json"
    assert manifest_path.exists()
