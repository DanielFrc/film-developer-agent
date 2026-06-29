# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.3.0] - 2026-06-26

Midori-aligned personal workflow: roll codes and a minimal developed-rolls registry — not a digital journal.

### Added

- **Roll code** on session card — suggested `YYMMDD-FILM-DEV` code with copy + print on the session slip
- **Log roll** — saves a minimal registry entry (date, combo, optional notebook ref, recipe link); increments workbook roll counter
- **Developed rolls table** on Library — sortable log with links to session and saved recipe
- **Library backup v4** — includes `developedRolls`; imports v1–v3 still supported
- **docs/WORKFLOW.md** — notebook + scan filename convention; Pi LAN deploy note

### Changed

- Workbook UI labeled **Combo tweaks** (working time / presoak per combo, not a daily journal)
- Session card copy emphasizes chart times + volumes; narrative notes stay on paper

## [0.2.1] - 2026-06-24

Photographer workflow polish: journal fields, style tags, session LLM brief, LAN dev, and bilingual LLM output.

### Added

- **Recipe style tags** — chip picker on Search and Recipe (cinematic, fine grain, flat for scanning, etc.) merged into LLM `extra_context`
- **Development journal** — contrast and scan outcome fields; workbook renamed; results on session card
- **Session executive summary** — `POST /session-summaries` and **Executive summary (LLM)** on session card (brief from notes, not a full recipe); persisted per combo in workbook and library backup
- **LLM language** — Preferences **Recipe language** (`en` / `es`); recipes and session summaries honor `language` on API requests; CLI `--language` / `--lang`
- **LAN dev access** — `./scripts/dev.sh` binds Vite on `0.0.0.0` and prints a Wi-Fi URL for phones/tablets

### Changed

- **LLM tuning** — `LLM_TEMPERATURE` (default `0.3`), `LLM_MAX_TOKENS` (default `1200`), `SESSION_SUMMARY_MAX_TOKENS` (default `500`); recipe `PROMPT_VERSION` 3

### Fixed

- **`pyproject.toml`** — dependencies under `[project]`; removed deprecated MIT license classifier (PEP 639)
- **GitHub Actions** — Node 24–compatible action versions; CI install on current setuptools

## [0.2.0] - 2026-06-23

Personal workflow release: Library IA, session cards, developer compare, PWA, and per-combo workbook log.

### Added

- **Session card (Tier 1)** — sink-ready checklist after lookup: dilution volumes, stop bath, agitation, pre-soak, chart vs working time; save without LLM recipe
- **Workbook log** — rolls developed counter (+1 on session card), outcome density/grain tags, outcome notes per combo
- **Darkroom preferences** — tank volume (ml), stop bath recipe, default pre-soak on global profile
- **Library session links** — saved combinations open `/session` card; workbook `presoakOverride` per combo
- **Phase 5.5 polish** — `/compare` developer times table; print summary card; PWA install with offline access to saved/default recipes
- **Phase 5.4 personal knowledge** — film enrichment on Library; Search pre-fills nominal ISO; combination workbook on Recipe sidebar; **Regenerate with notes**
- **Phase 5.3 IA** — `/library` route; slim data-focused Dashboard; nav split (workflow vs data/settings)
- **API** — `GET /compare` for side-by-side chart times (same film, format, ISO)
- **Library backup v2/v3** — film enrichment, workbook, darkroom prefs; backward-compatible import from v1

### Fixed

- **Preferred developers** — comma-separated input no longer strips commas/spaces while typing; wired into LLM `extra_context`

### Changed

- Saved combinations renamed **Saved sessions** in Library UI
- README and docs updated for dual-audience quick start

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

[0.3.0]: https://github.com/DanielFrc/film-developer-agent/releases/tag/v0.3.0
[0.2.1]: https://github.com/DanielFrc/film-developer-agent/releases/tag/v0.2.1
[0.2.0]: https://github.com/DanielFrc/film-developer-agent/releases/tag/v0.2.0
[0.1.0]: https://github.com/DanielFrc/film-developer-agent/releases/tag/v0.1.0
