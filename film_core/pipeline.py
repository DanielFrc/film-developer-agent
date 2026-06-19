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


def _collect_process_outputs() -> dict[str, Any]:
    return {
        "formats": _parquet_stats(config.FORMAT_OUT),
        "developers": _parquet_stats(config.DEVELOPERS_OUT),
        "films": _parquet_stats(config.FILMS_OUT),
        "developing_times": _parquet_stats(config.DEVELOPING_TIMES_OUT),
    }


def _collect_normalize_outputs() -> dict[str, Any]:
    return {
        "formats": _parquet_stats(config.GOLD_FORMAT_OUT),
        "developers": _parquet_stats(config.GOLD_DEVELOPERS_OUT),
        "films": _parquet_stats(config.GOLD_FILMS_OUT),
        "developing_times": _parquet_stats(config.GOLD_DEVELOPING_TIMES_OUT),
    }


def run_pipeline(
    *,
    run_scrape: bool = True,
    run_process: bool = True,
    run_normalize: bool = True,
) -> PipelineManifest:
    """
    Execute pipeline stages and persist a run manifest under data/manifests/.

    Stages:
        scrape   -> bronze JSON in data/raw/
        process  -> silver parquet in data/processed/
        normalize -> gold parquet in data/normalized/
    """
    from digitaltruth_normalizer.normalizer_job import run_normalizer
    from digitaltruth_processor.processor_job import run_processor
    from digitaltruth_scrapper.digitaltruth_scrapper_job import run_scrapper

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

        if run_process:
            manifest.begin_stage("process")
            try:
                run_processor()
                outputs = _collect_process_outputs()
                manifest.finish_stage("process", status="success", outputs=outputs)
            except Exception as exc:
                manifest.finish_stage("process", status="failed", error=str(exc))
                raise

        if run_normalize:
            manifest.begin_stage("normalize")
            try:
                run_normalizer()
                outputs = _collect_normalize_outputs()
                manifest.finish_stage("normalize", status="success", outputs=outputs)
            except Exception as exc:
                manifest.finish_stage("normalize", status="failed", error=str(exc))
                raise

        manifest.finish("success")
    except Exception as exc:
        manifest.finish("failed", error=str(exc))
        logger.exception("Pipeline run %s failed", manifest.run_id)
        raise
    finally:
        manifest.save()

    logger.info(
        "Pipeline run %s finished with status=%s", manifest.run_id, manifest.status
    )
    return manifest
