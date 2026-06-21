# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
