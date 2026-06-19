from dataclasses import dataclass
from pathlib import Path

import config


class GoldDataNotFoundError(FileNotFoundError):
    """Raised when gold parquet files are missing."""


@dataclass(frozen=True)
class GoldPaths:
    films: Path
    developers: Path
    formats: Path
    developing_times: Path


def get_gold_paths() -> GoldPaths:
    return GoldPaths(
        films=Path(config.GOLD_FILMS_OUT),
        developers=Path(config.GOLD_DEVELOPERS_OUT),
        formats=Path(config.GOLD_FORMAT_OUT),
        developing_times=Path(config.GOLD_DEVELOPING_TIMES_OUT),
    )


def ensure_gold_data() -> GoldPaths:
    paths = get_gold_paths()
    missing = [
        str(path)
        for path in (
            paths.films,
            paths.developers,
            paths.formats,
            paths.developing_times,
        )
        if not path.exists()
    ]
    if missing:
        msg = (
            "Gold dataset not found. Run `film-agent process` and "
            "`film-agent normalize` (or `film-agent pipeline`) first.\n"
            f"Missing: {', '.join(missing)}"
        )
        raise GoldDataNotFoundError(msg)
    return paths


class GoldStore:
    """In-process DuckDB views over gold parquet files."""

    def __init__(self, paths: GoldPaths | None = None) -> None:
        import duckdb

        self._paths = paths or ensure_gold_data()
        self._conn = duckdb.connect()

        self._register_view("films", self._paths.films)
        self._register_view("developers", self._paths.developers)
        self._register_view("formats", self._paths.formats)
        self._register_view("developing_times", self._paths.developing_times)

    def _register_view(self, name: str, path: Path) -> None:
        escaped = str(path).replace("'", "''")
        self._conn.execute(
            f"CREATE OR REPLACE VIEW {name} AS "
            f"SELECT * FROM read_parquet('{escaped}')"
        )

    @property
    def connection(self):
        return self._conn

    def fetch_all_films(self) -> list[tuple[str, str | None]]:
        rows = self._conn.execute(
            "SELECT film, value FROM films WHERE active = true ORDER BY film"
        ).fetchall()
        return [(row[0], row[1]) for row in rows]

    def fetch_all_developers(self) -> list[tuple[str, str | None]]:
        rows = self._conn.execute(
            "SELECT developer, value FROM developers WHERE active = true ORDER BY developer"
        ).fetchall()
        return [(row[0], row[1]) for row in rows]

    def fetch_all_formats(self) -> list[tuple[str, str | None]]:
        rows = self._conn.execute(
            "SELECT format, description FROM formats WHERE active = true ORDER BY format"
        ).fetchall()
        return [(row[0], row[1]) for row in rows]

    def close(self) -> None:
        self._conn.close()

    def __enter__(self) -> "GoldStore":
        return self

    def __exit__(self, *args) -> None:
        self.close()
