import logging
from pathlib import Path
from typing import Any

import pyarrow.parquet as pq

import config
from film_core.manifest import PipelineManifest
from film_core.paths import get_data_paths

logger = logging.getLogger(__name__)


def _parquet_stats(path: str) -> dict[str, Any]:
    file_path = Path(path)
    if not file_path.exists():
        return {"exists": False}
    df = pq.read_table(file_path).to_pandas()
    return {"exists": True, "record_count": len(df), "columns": list(df.columns)}


def _collect_transform_outputs() -> dict[str, Any]:
    return {
        "formats": _parquet_stats(config.FORMAT_OUT),
        "developers": _parquet_stats(config.DEVELOPERS_OUT),
        "films": _parquet_stats(config.FILMS_OUT),
        "developing_times": _parquet_stats(config.DEVELOPING_TIMES_OUT),
    }


def run_pipeline(*, run_scrape: bool = True, run_transform: bool = True) -> PipelineManifest:
    """
    Execute pipeline stages and persist a run manifest under data/manifests/.

    Args:
        run_scrape: When True, run the DigitalTruth scraper stage.
        run_transform: When True, run the transformer stage.

    Returns:
        Completed PipelineManifest for the run.
    """
    from digitaltruth_scrapper.digitaltruth_scrapper_job import run_scrapper
    from digitaltruth_transformer.digitaltruth_transformer_job import run_transformer

    paths = get_data_paths()
    paths.ensure_all()

    manifest = PipelineManifest.start()
    logger.info("Pipeline run %s started (data_path=%s)", manifest.run_id, paths.base)

    try:
        if run_scrape:
            manifest.begin_stage("scrape")
            try:
                run_scrapper()
                manifest.finish_stage("scrape", status="success")
            except Exception as exc:
                manifest.finish_stage("scrape", status="failed", error=str(exc))
                raise

        if run_transform:
            manifest.begin_stage("transform")
            try:
                run_transformer()
                outputs = _collect_transform_outputs()
                manifest.finish_stage("transform", status="success", outputs=outputs)
            except Exception as exc:
                manifest.finish_stage("transform", status="failed", error=str(exc))
                raise

        manifest.finish("success")
    except Exception as exc:
        manifest.finish("failed", error=str(exc))
        logger.exception("Pipeline run %s failed", manifest.run_id)
        raise
    finally:
        manifest.save()

    logger.info("Pipeline run %s finished with status=%s", manifest.run_id, manifest.status)
    return manifest
