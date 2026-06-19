import json
import logging
from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from film_core.paths import get_data_paths
from film_core.storage import get_storage

logger = logging.getLogger(__name__)


def _utc_now() -> datetime:
    return datetime.now(UTC)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


@dataclass
class StageRecord:
    name: str
    status: str = "pending"
    started_at: str | None = None
    finished_at: str | None = None
    duration_seconds: float | None = None
    error: str | None = None
    outputs: dict[str, Any] = field(default_factory=dict)


@dataclass
class PipelineManifest:
    run_id: str
    started_at: str
    finished_at: str | None = None
    status: str = "running"
    data_path: str = ""
    stages: dict[str, StageRecord] = field(default_factory=dict)
    error: str | None = None

    @classmethod
    def start(cls, run_id: str | None = None) -> "PipelineManifest":
        started = _utc_now()
        rid = run_id or started.strftime("%Y%m%d_%H%M%S")
        paths = get_data_paths()
        paths.ensure_all()
        return cls(
            run_id=rid,
            started_at=_iso(started),
            data_path=str(paths.base),
        )

    def begin_stage(self, name: str) -> StageRecord:
        stage = StageRecord(name=name, status="running", started_at=_iso(_utc_now()))
        self.stages[name] = stage
        return stage

    def finish_stage(
        self,
        name: str,
        *,
        status: str = "success",
        error: str | None = None,
        outputs: dict[str, Any] | None = None,
    ) -> None:
        stage = self.stages[name]
        finished = _utc_now()
        stage.finished_at = _iso(finished)
        stage.status = status
        stage.error = error
        if outputs:
            stage.outputs.update(outputs)
        if stage.started_at:
            started = datetime.fromisoformat(stage.started_at)
            stage.duration_seconds = round((finished - started).total_seconds(), 3)

    def finish(self, status: str, *, error: str | None = None) -> None:
        self.status = status
        self.error = error
        self.finished_at = _iso(_utc_now())

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        payload["stages"] = {
            name: asdict(stage) for name, stage in self.stages.items()
        }
        return payload

    def save(self) -> Path:
        storage = get_storage()
        relative = f"manifests/{self.run_id}.json"
        storage.write_text(relative, json.dumps(self.to_dict(), indent=2))
        path = storage.resolve(relative)
        logger.info("Pipeline manifest saved to %s", path)
        return path
