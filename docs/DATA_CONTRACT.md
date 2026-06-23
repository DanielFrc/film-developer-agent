# Gold data contract

Version **1** — stable interface between the **ETL pipeline** (data plane) and the **Film Developer Agent** application (CLI, API, web UI).

A future split into two repositories should preserve this contract: the app reads compatible gold parquet + manifests; the pipeline produces them.

---

## Schema version

| Field | Value |
|-------|--------|
| `schema_version` | `"1"` (constant `film_core.contract.GOLD_SCHEMA_VERSION`) |
| Written to | Pipeline manifest JSON (`data/manifests/{run_id}.json`) |
| Exposed via | `GET /stats` → `schema_version` |

Bump the version when gold table columns or semantics change incompatibly. The app should reject or warn on unknown major versions.

---

## Layout

All paths are relative to `DATA_PATH` (default `data/`).

```
data/
├── normalized/                          # Gold — required by the app
│   ├── digitaltruth_films.parquet.gz
│   ├── digitaltruth_developers.parquet.gz
│   ├── digitaltruth_formats.parquet.gz
│   └── digitaltruth_film_data.parquet.gz
└── manifests/
    └── {run_id}.json                    # Pipeline run metadata
```

The application **does not** read bronze or silver at runtime. ETL may also write `data/processed/` and `data/raw/`; those are out of scope for this contract.

---

## Gold tables

### `digitaltruth_films.parquet.gz` (dimension)

| Column | Type | Notes |
|--------|------|--------|
| `id` | int | Surrogate key |
| `film` | string | Canonical lowercase name |
| `value` | string | Display / source label |
| `created_at` | timestamp | Audit |
| `updated_at` | timestamp | Audit |
| `active` | bool | `true` for queryable rows |

### `digitaltruth_developers.parquet.gz` (dimension)

Same shape as films (`developer` instead of `film`).

### `digitaltruth_formats.parquet.gz` (dimension)

| Column | Type | Notes |
|--------|------|--------|
| `id` | int | Surrogate key |
| `format` | string | `35mm`, `120`, `sheet` |
| `description` | string | Optional |
| `created_at`, `updated_at`, `active` | | Audit |

### `digitaltruth_film_data.parquet.gz` (fact — developing times)

| Column | Type | Notes |
|--------|------|--------|
| `id` | int | Surrogate key |
| `film_id`, `developer_id`, `format_id` | int | FKs to dimensions |
| `film`, `developer`, `format` | string | Denormalized for queries |
| `iso` | string | EI / ISO as in source |
| `dilution` | string | e.g. `1+50`, `stock` |
| `dev_time` | string | Minutes (source format) |
| `temp` | string | Celsius in gold |
| `notes` | string | Sanitized footnote codes or empty |
| `created_at`, `updated_at`, `active` | | Audit |

**Query convention:** API and CLI filter `active = true`.

---

## Pipeline manifest

File: `data/manifests/{run_id}.json`

| Field | Type | Description |
|-------|------|-------------|
| `run_id` | string | `YYYYMMDD_HHMMSS` |
| `started_at` | ISO 8601 UTC | Run start |
| `finished_at` | ISO 8601 UTC | Run end |
| `status` | string | `success` \| `failed` \| `running` |
| `data_path` | string | Absolute base path |
| `schema_version` | string | Gold contract version (`"1"`) |
| `stages` | object | `scrape`, `process`, `normalize` stage records |
| `error` | string | Top-level error if failed |

The app uses the latest successful manifest (by `finished_at`) for dataset freshness in `GET /stats`.

---

## Dataset fingerprint

`source_hash` — SHA-256 (truncated to 16 hex chars) over the four gold parquet files (name + bytes). Used to:

- Display freshness on the dashboard
- Invalidate SQLite recipe cache when gold changes (`film_llm.recipe_cache`)

Algorithm: `film_llm.source_hash.compute_source_hash()`.

---

## Producer responsibilities (ETL)

1. Write all four gold parquet files under `data/normalized/`.
2. Set `active = true` on published rows.
3. Save a manifest with `schema_version` and `status: success`.
4. Do not require the app to run scrape/process/normalize.

## Consumer responsibilities (app)

1. Read only gold parquet via `GoldStore` / DuckDB.
2. Surface `source_hash` and manifest timestamps in `/stats`.
3. Never import `digitaltruth_scrapper` or processor modules from the API layer.
4. Treat missing gold as `503` with a clear message to run `film-agent pipeline`.

---

## Compatibility checklist (future split)

When extracting ETL to its own repo:

- [ ] Pipeline package publishes gold matching this document
- [ ] App package documents minimum `schema_version`
- [ ] Integration test: fixture gold → API `/stats` + lookup + recipe
- [ ] Shared contract published as markdown or OpenAPI-style JSON Schema (optional)

---

## Related

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Pipeline stages |
| [LEGAL.md](LEGAL.md) | Do not redistribute full scraped data |
| [QUICKSTART.md](QUICKSTART.md) | Build gold data locally |
