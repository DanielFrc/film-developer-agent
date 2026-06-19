import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from film_core.paths import get_data_paths


class LocalStorage:
    """Filesystem storage rooted at DATA_PATH."""

    def __init__(self, base_path: Path | None = None) -> None:
        self._base = (base_path or get_data_paths().base).resolve()

    @property
    def base_path(self) -> Path:
        return self._base

    def resolve(self, relative_path: str) -> Path:
        return (self._base / relative_path).resolve()

    def exists(self, relative_path: str) -> bool:
        return self.resolve(relative_path).exists()

    def ensure_dir(self, relative_path: str) -> Path:
        path = self.resolve(relative_path)
        if path.suffix:
            path.parent.mkdir(parents=True, exist_ok=True)
        else:
            path.mkdir(parents=True, exist_ok=True)
        return path

    def read_text(self, relative_path: str) -> str:
        return self.resolve(relative_path).read_text(encoding="utf-8")

    def write_text(self, relative_path: str, content: str) -> Path:
        path = self.resolve(relative_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        return path

    def read_json(self, relative_path: str) -> Any:
        return json.loads(self.read_text(relative_path))

    def write_json(self, relative_path: str, data: Any, *, indent: int = 2) -> Path:
        content = json.dumps(data, ensure_ascii=False, indent=indent)
        return self.write_text(relative_path, content)


@lru_cache
def get_storage() -> LocalStorage:
    return LocalStorage()
