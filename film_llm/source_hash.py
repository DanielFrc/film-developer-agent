import hashlib
from pathlib import Path

import config


def compute_source_hash(paths: list[Path] | None = None) -> str:
    """Hash gold parquet files to detect dataset changes after pipeline runs."""
    if paths is None:
        paths = [
            Path(config.GOLD_DEVELOPING_TIMES_OUT),
            Path(config.GOLD_FILMS_OUT),
            Path(config.GOLD_DEVELOPERS_OUT),
            Path(config.GOLD_FORMAT_OUT),
        ]

    digest = hashlib.sha256()
    for path in sorted(paths, key=lambda item: item.name):
        if not path.exists():
            continue
        digest.update(path.name.encode())
        digest.update(path.read_bytes())

    if digest.digest() == hashlib.sha256().digest():
        return "no-gold-data"

    return digest.hexdigest()[:16]
