import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class DataPaths:
    """Resolved filesystem locations for pipeline data layers."""

    base: Path
    raw: Path
    processed: Path
    historical: Path
    manifests: Path
    normalized: Path
    cache: Path

    @classmethod
    def from_base(cls, base: str | Path) -> "DataPaths":
        root = Path(base).expanduser().resolve()
        return cls(
            base=root,
            raw=root / "raw",
            processed=root / "processed",
            historical=root / "historical",
            manifests=root / "manifests",
            normalized=root / "normalized",
            cache=root / "cache",
        )

    def ensure_all(self) -> None:
        for path in (
            self.raw,
            self.processed,
            self.historical,
            self.manifests,
            self.normalized,
            self.cache,
        ):
            path.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_data_paths() -> DataPaths:
    base = os.getenv("DATA_PATH", "data/")
    return DataPaths.from_base(base)
