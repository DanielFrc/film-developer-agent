from pathlib import Path
from typing import Any, Protocol


class StorageBackend(Protocol):
    """Abstract storage for pipeline artifacts (local disk today, S3 in Phase 6)."""

    @property
    def base_path(self) -> Path:
        """Root path for this backend."""

    def resolve(self, relative_path: str) -> Path:
        """Return absolute path for a relative key."""

    def exists(self, relative_path: str) -> bool:
        """Return True when the relative path exists."""

    def ensure_dir(self, relative_path: str) -> Path:
        """Create parent directories for a relative file or directory path."""

    def read_text(self, relative_path: str) -> str:
        """Read a UTF-8 text file."""

    def write_text(self, relative_path: str, content: str) -> Path:
        """Write a UTF-8 text file."""

    def read_json(self, relative_path: str) -> Any:
        """Read and parse a JSON file."""

    def write_json(self, relative_path: str, data: Any, *, indent: int = 2) -> Path:
        """Serialize data to a JSON file."""
