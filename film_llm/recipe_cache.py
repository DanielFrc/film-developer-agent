import hashlib
import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path

from film_core.paths import get_data_paths

SCHEMA = """
CREATE TABLE IF NOT EXISTS recipe_cache (
    cache_key       TEXT PRIMARY KEY,
    film            TEXT NOT NULL,
    developer       TEXT NOT NULL,
    format          TEXT NOT NULL,
    iso             TEXT NOT NULL,
    dilution        TEXT NOT NULL,
    temperature     TEXT,
    base_time       TEXT NOT NULL,
    recipe_markdown TEXT NOT NULL,
    source_hash     TEXT NOT NULL,
    prompt_version  TEXT NOT NULL,
    llm_provider    TEXT NOT NULL,
    llm_model       TEXT NOT NULL,
    language        TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    last_used_at    TEXT,
    use_count       INTEGER DEFAULT 1
);
"""


@dataclass(frozen=True)
class CachedRecipe:
    cache_key: str
    recipe_markdown: str
    source_hash: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    created_at: str
    use_count: int


@dataclass(frozen=True)
class CacheLookupParams:
    film: str
    developer: str
    format: str
    iso: str
    dilution: str
    temperature: str | None
    base_time: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    language: str
    extra_context: str = ""


def build_cache_key(params: CacheLookupParams) -> str:
    payload = "|".join(
        [
            params.film,
            params.developer,
            params.format,
            params.iso,
            params.dilution,
            params.temperature or "",
            params.base_time,
            params.extra_context,
            params.prompt_version,
            params.llm_provider,
            params.llm_model,
            params.language,
        ]
    )
    return hashlib.sha256(payload.encode()).hexdigest()[:32]


class RecipeCacheService:
    def __init__(self, db_path: Path | None = None) -> None:
        paths = get_data_paths()
        paths.cache.mkdir(parents=True, exist_ok=True)
        self._db_path = db_path or (paths.cache / "recipes.db")
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(SCHEMA)

    def get(self, cache_key: str, *, current_source_hash: str) -> CachedRecipe | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM recipe_cache WHERE cache_key = ?",
                (cache_key,),
            ).fetchone()

        if row is None:
            return None
        if row["source_hash"] != current_source_hash:
            return None

        self._touch(cache_key)
        return CachedRecipe(
            cache_key=row["cache_key"],
            recipe_markdown=row["recipe_markdown"],
            source_hash=row["source_hash"],
            prompt_version=row["prompt_version"],
            llm_provider=row["llm_provider"],
            llm_model=row["llm_model"],
            created_at=row["created_at"],
            use_count=row["use_count"] + 1,
        )

    def _touch(self, cache_key: str) -> None:
        now = datetime.now(UTC).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE recipe_cache
                SET last_used_at = ?, use_count = use_count + 1
                WHERE cache_key = ?
                """,
                (now, cache_key),
            )

    def store(
        self,
        *,
        cache_key: str,
        params: CacheLookupParams,
        recipe_markdown: str,
        source_hash: str,
    ) -> None:
        now = datetime.now(UTC).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO recipe_cache (
                    cache_key, film, developer, format, iso, dilution, temperature,
                    base_time, recipe_markdown, source_hash, prompt_version,
                    llm_provider, llm_model, language, created_at, last_used_at, use_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(cache_key) DO UPDATE SET
                    recipe_markdown = excluded.recipe_markdown,
                    source_hash = excluded.source_hash,
                    prompt_version = excluded.prompt_version,
                    llm_provider = excluded.llm_provider,
                    llm_model = excluded.llm_model,
                    language = excluded.language,
                    last_used_at = excluded.last_used_at,
                    use_count = recipe_cache.use_count + 1
                """,
                (
                    cache_key,
                    params.film,
                    params.developer,
                    params.format,
                    params.iso,
                    params.dilution,
                    params.temperature,
                    params.base_time,
                    recipe_markdown,
                    source_hash,
                    params.prompt_version,
                    params.llm_provider,
                    params.llm_model,
                    params.language,
                    now,
                    now,
                ),
            )
