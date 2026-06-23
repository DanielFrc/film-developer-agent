import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from film_core.contract import GOLD_SCHEMA_VERSION
from film_core.paths import get_data_paths
from film_llm.source_hash import compute_source_hash

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DatasetMetadata:
    schema_version: str
    source_hash: str
    pipeline_run_id: str | None = None
    pipeline_started_at: str | None = None
    pipeline_finished_at: str | None = None
    pipeline_status: str | None = None


def _manifest_sort_key(payload: dict[str, Any]) -> str:
    return str(payload.get("finished_at") or payload.get("started_at") or "")


def load_latest_manifest(*, successful_only: bool = False) -> dict[str, Any] | None:
    manifest_dir = get_data_paths().manifests
    if not manifest_dir.exists():
        return None

    candidates: list[dict[str, Any]] = []
    for path in sorted(manifest_dir.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            logger.warning("Skipping unreadable manifest %s: %s", path, exc)
            continue
        if successful_only and payload.get("status") != "success":
            continue
        candidates.append(payload)

    if not candidates:
        return None

    return max(candidates, key=_manifest_sort_key)


def get_dataset_metadata() -> DatasetMetadata:
    manifest = load_latest_manifest(successful_only=True) or load_latest_manifest()
    return DatasetMetadata(
        schema_version=str(manifest.get("schema_version", GOLD_SCHEMA_VERSION))
        if manifest
        else GOLD_SCHEMA_VERSION,
        source_hash=compute_source_hash(),
        pipeline_run_id=manifest.get("run_id") if manifest else None,
        pipeline_started_at=manifest.get("started_at") if manifest else None,
        pipeline_finished_at=manifest.get("finished_at") if manifest else None,
        pipeline_status=manifest.get("status") if manifest else None,
    )


def gold_table_paths() -> list[Path]:
    import config

    return [
        Path(config.GOLD_FILMS_OUT),
        Path(config.GOLD_DEVELOPERS_OUT),
        Path(config.GOLD_FORMAT_OUT),
        Path(config.GOLD_DEVELOPING_TIMES_OUT),
    ]
