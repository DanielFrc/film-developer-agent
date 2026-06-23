# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Session card (Tier 1)** — sink-ready checklist after lookup: dilution volumes, stop bath, agitation, pre-soak, chart vs working time; save without LLM recipe
- **Workbook log** — rolls developed counter (+1 on session card), outcome density/grain tags, outcome notes per combo
- **Preferred developers fix** — comma-separated text field (no longer strips commas while typing); wired into LLM context
- **Darkroom preferences** — tank volume (ml), stop bath recipe, default pre-soak on global profile
- **Library session links** — saved combinations open `/session` card; workbook `presoakOverride` per combo
- **Library backup v3** — includes extended preferences; v1–v2 import supported
- **Phase 5.5 polish** — `/compare` developer times table; print summary card; PWA install with offline access to saved/default recipes
- **Phase 5.4 personal knowledge** — film enrichment (box speed, typical EI, notes) on Library; Search pre-fills nominal ISO; combination workbook on Recipe sidebar with chart vs your working time; **Regenerate with notes** merges workbook into LLM context
- **Library backup v2** — export/import includes `filmEnrichment` and `combinationWorkbook`; v1 imports remain supported
- **Phase 5.3 IA** — `/library` route; Dashboard focused on dataset stats and explorer entry points
- **Gold data contract** — [docs/DATA_CONTRACT.md](docs/DATA_CONTRACT.md) and `schema_version` on pipeline manifests
- **`GET /stats` freshness** — pipeline run id, finished time, status, schema version
- **Library backup** — export/import JSON in Preferences (combinations, recipes, defaults, favorites, prefs)
- **Dashboard** — dataset freshness card
- **README** — dual audience sections (data engineers vs darkroom users)

## [0.1.0] - 2026-06-19

First portfolio-ready release: end-to-end local-first film development assistant.

### Added

- **Medallion ETL** — bronze scrape → silver parquet → gold star schema with pipeline manifests.
- **CLI** (`film-agent`) — pipeline, fuzzy search, developing-time lookup, LLM recipe generation.
- **API** (`film-api`) — FastAPI with health, search, lookup, recipes, stats, and data explorer endpoints.
- **LLM layer** — Jinja2 prompts, Ollama + OpenAI providers, SQLite recipe cache with `source_hash` invalidation.
- **Web UI** — React + Vite dashboard, search, recipe view, data explorer, preferences.
- **Personal workflow** — localStorage library (saved combos/recipes, defaults, favorites, per-film prefs).
- **Docker Compose** — `api`, `web`, optional `etl` and production static `web-prod`.
- **Docs** — ARCHITECTURE, ROADMAP, QUICKSTART, LEGAL, PHASE5 interface notes, PORTFOLIO guide.
- **CI** — GitHub Actions: Ruff, pytest, web build.
- **OSS** — MIT LICENSE, NOTICE, CONTRIBUTING, CHANGELOG.

### Security & legal

- Scraped data gitignored; users run the scraper themselves.
- Recipe responses include source attribution and safety disclaimer.
- No LLM provider keys in the browser UI.

[0.1.0]: https://github.com/DanielFrc/film-developer-agent/releases/tag/v0.1.0
