# Film Developer Agent — Data Engineering Stage

ETL pipeline that scrapes film development data from [DigitalTruth](https://www.digitaltruth.com/devchart.php), stores raw JSON, and produces normalized Parquet tables for films, developers, formats, and developing times.

For architecture details, data model, and design decisions, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).  
For the product roadmap and phased plan, see [docs/ROADMAP.md](docs/ROADMAP.md).  
For open-source and DigitalTruth legal considerations, see [docs/LEGAL.md](docs/LEGAL.md).

---

## What It Does

1. **Scrape** — Fetches film/developer catalogs and per-film development time tables from DigitalTruth.
2. **Transform** — Normalizes data into four related tables (star-schema-like).
3. **Load** — Writes gzipped Parquet files with embedded scrape metadata.

---

## Output Tables

| Parquet file | Description |
|--------------|-------------|
| `digitaltruth_films.parquet.gz` | Film stocks (dimension) |
| `digitaltruth_developers.parquet.gz` | Developers (dimension) |
| `digitaltruth_formats.parquet.gz` | Film formats — 35mm, 120, sheet, etc. (dimension) |
| `digitaltruth_film_data.parquet.gz` | Developing times — fact table with FKs |

---

## Project Structure

```
film-developer-agent/
├── entrypoint.py                 # Runs full pipeline + manifest
├── config.py                     # Paths, URLs, scrape tuning
├── film_core/                    # Storage, manifests, pipeline orchestration
├── catalogs/                     # Curated seed catalogs (film formats)
├── data/                         # Local pipeline output (gitignored)
├── digitaltruth_scrapper/        # Stage 1: web scraping
├── digitaltruth_transformer/     # Stage 2: ETL / normalization
├── tests/                        # Pytest suite + HTML/JSON fixtures
├── logger/                       # Logging configuration
├── docs/
├── Dockerfile
├── compose.yml
├── pyproject.toml
└── requirements.txt
```

---

## Quickstart

### Prerequisites

- Python 3.13+
- Docker & Docker Compose (optional)

### Run locally

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
python entrypoint.py
```

Output is written under `./data/processed/`. A run manifest is saved under `./data/manifests/`. Logs go to `./logs/`.

Run stages independently:

```bash
python digitaltruth_scrapper/digitaltruth_scrapper_job.py
python digitaltruth_transformer/digitaltruth_transformer_job.py
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_PATH` | `data/` | Base directory for raw/processed data |
| `MAX_WORKERS` | `10` | Parallel film fetches during scrape |
| `SCRAPE_DELAY_MIN` | `0.5` | Min delay (seconds) between per-film requests |
| `SCRAPE_DELAY_MAX` | `1.5` | Max delay (seconds) between per-film requests |
| `SCRAPE_MAX_RETRIES` | `3` | Retries for failed film fetches |

### Run with Docker

```bash
docker build -t film-dev-agent .
docker run --rm -v "$(pwd)/data:/data" film-dev-agent
```

### Run with Docker Compose

```bash
docker compose up --build
```

### Development

```bash
pip install -e ".[dev]"
ruff check .
pytest -q
```

---

## Data Layout

Pipeline output is **local only** and gitignored. After running the pipeline:

```
data/
├── raw/           # Scraper JSON (DigitalTruth)
├── processed/     # Transformer Parquet (silver, today)
├── normalized/    # Gold layer (Phase 2)
├── historical/    # Rotated Parquet on overwrite
└── manifests/     # Pipeline run manifests
```

Curated seed catalog (committed):

```
catalogs/
└── film_formats.json    # Format dimension (not from DigitalTruth)
```

To populate data, run `python entrypoint.py` or the individual stage jobs.  
Tests use fixtures under `tests/fixtures/` — no committed scrape data.

---

## Dependencies

```
beautifulsoup4
requests
pandas
pyarrow
```

---

## Next Steps

Phase 1 (stabilize & test) is in place. Planned extensions:

- Phase 2: Silver / gold data layer split
- CLI + API + LLM recipe generation
- React web UI

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan.

## Data source & legal

This tool reads publicly available data from [DigitalTruth](https://www.digitaltruth.com/devchart.php). It is **not affiliated** with Digitaltruth Photo Ltd. Users run the scraper themselves; see [docs/LEGAL.md](docs/LEGAL.md) before open-source release.
