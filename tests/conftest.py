import shutil
from pathlib import Path

import pytest

import config

FIXTURES_DIR = Path(__file__).parent / "fixtures"
RAW_FIXTURES = FIXTURES_DIR / "raw"


@pytest.fixture
def isolated_data_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    """Copy minimal raw fixtures into an isolated DATA_PATH and refresh config."""
    data_root = tmp_path / "data"
    raw_dir = data_root / "raw"
    raw_dir.mkdir(parents=True)
    (data_root / "processed").mkdir()
    (data_root / "historical").mkdir()
    (data_root / "manifests").mkdir()

    for path in RAW_FIXTURES.glob("*"):
        shutil.copy(path, raw_dir / path.name)

    monkeypatch.setenv("DATA_PATH", str(data_root))
    config.refresh_from_env()
    yield data_root
    config.refresh_from_env()


@pytest.fixture
def devchart_html() -> str:
    return (FIXTURES_DIR / "devchart_sample.html").read_text(encoding="utf-8")


@pytest.fixture
def film_times_html() -> str:
    return (FIXTURES_DIR / "film_times_sample.html").read_text(encoding="utf-8")
