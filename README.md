# Film Developer Agent — Data Engineering Stage

ETL pipeline that scrapes film development data from [DigitalTruth](https://www.digitaltruth.com/devchart.php), stores raw JSON, and produces normalized Parquet tables for films, developers, formats, and developing times.

For architecture details, data model, and design decisions, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).  
For the product roadmap and phased plan, see [docs/ROADMAP.md](docs/ROADMAP.md).  
For open-source and DigitalTruth legal considerations, see [docs/LEGAL.md](docs/LEGAL.md).

---

## What It Does

1. **Scrape** — Fetches film/developer catalogs and per-film development time tables from DigitalTruth.
2. **Process (silver)** — Cleans and types bronze JSON into wide Parquet under `data/processed/`.
3. **Normalize (gold)** — Builds star-schema Parquet with FKs under `data/normalized/` for API/CLI use.

---

## Output Tables

**Silver** (`data/processed/`) — wide developing-times table (`35mm`, `120`, `sheet` columns).

**Gold** (`data/normalized/`) — API-ready star schema:

| Parquet file | Description |
|--------------|-------------|
| `digitaltruth_films.parquet.gz` | Film stocks (dimension) |
| `digitaltruth_developers.parquet.gz` | Developers (dimension) |
| `digitaltruth_formats.parquet.gz` | Film formats (dimension) |
| `digitaltruth_film_data.parquet.gz` | Developing times — long fact table with FKs |

---

## Project Structure

```
film-developer-agent/
├── entrypoint.py                 # Runs full pipeline + manifest
├── config.py                     # Paths, URLs, scrape tuning
├── catalogs/                     # Curated seed catalogs (film formats)
├── data/                         # Local pipeline output (gitignored)
├── digitaltruth_scrapper/        # Stage 1: bronze scrape
├── digitaltruth_processor/       # Stage 2: silver parquet
├── digitaltruth_normalizer/      # Stage 3: gold parquet
├── digitaltruth_transformer/     # Backward-compatible alias (process + normalize)
├── film_agent_cli/               # Typer CLI (`film-agent`)
├── film_agent_api/               # FastAPI (`film-api`)
├── film_llm/                     # Prompt templates, LLM providers, recipe cache
├── film_core/                    # Storage, manifests, pipeline, query layer
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

Output is written under `./data/processed/` and `./data/normalized/`. A run manifest is saved under `./data/manifests/`. Logs go to `./logs/`.

Run stages independently:

```bash
python digitaltruth_scrapper/digitaltruth_scrapper_job.py
python digitaltruth_processor/processor_job.py
python digitaltruth_normalizer/normalizer_job.py
```

### CLI (`film-agent`)

After installing with `pip install -e ".[dev]"`, query gold data without re-running the scraper:

```bash
# Pipeline stages
film-agent scrape
film-agent process
film-agent normalize
film-agent pipeline              # all three stages
film-agent pipeline --skip-scrape  # process + normalize only

# Fuzzy search (rapidfuzz over gold dimensions)
film-agent films search "hp5"
film-agent developers search "rodinal"

# Developing time lookup (gold fact table)
film-agent times lookup \
  --film "Ilford HP5 Plus" \
  --developer "Rodinal" \
  --format 120 \
  --iso 400

# JSON output for scripting
film-agent times lookup --film "hp5" --developer "rodinal" --format 120 --iso 400 --json

# Recipe generation (LLM + SQLite cache)
film-agent recipe \
  --film "Ilford HP5 Plus" \
  --developer "Rodinal" \
  --format 120 \
  --iso 400 \
  --dilution "1+50" \
  --extra-context "stand development, grainy look" \
  --output recipe.md

film-agent recipe ... --force   # bypass cache
```

Names are normalized to lowercase in gold data; the CLI accepts mixed case. Run `process` + `normalize` (or `pipeline --skip-scrape`) at least once so `data/normalized/` exists.

### API (`film-api`)

```bash
film-api
# or: uvicorn film_agent_api.main:app --reload

curl http://localhost:8000/health
curl "http://localhost:8000/films?q=hp5"
curl -X POST http://localhost:8000/recipes \
  -H "Content-Type: application/json" \
  -d '{"film":"Ilford HP5 Plus","developer":"Rodinal","format":"120","iso":"400","dilution":"1+50"}'
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_PATH` | `data/` | Base directory for raw/processed data |
| `LLM_PROVIDER` | `ollama` | `ollama`, `openai`, or `mock` (tests) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API base URL |
| `OLLAMA_MODEL` | `llama3.1:8b` | Ollama model name |
| `OPENAI_API_KEY` | *(empty)* | Required when `LLM_PROVIDER=openai` |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |
| `PROMPT_VERSION` | `2` | Bump to invalidate recipe cache |
| `MAX_EXTRA_CONTEXT_LENGTH` | `500` | Max chars for photographer preferences |
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
├── raw/           # Bronze — scraper JSON (DigitalTruth)
├── processed/     # Silver — wide parquet
├── normalized/    # Gold — star-schema parquet (API/CLI reads this)
├── historical/    # Rotated parquet on overwrite
├── manifests/     # Pipeline run manifests
└── cache/         # Recipe cache (Phase 4)
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
duckdb
rapidfuzz
typer
fastapi
uvicorn
jinja2
httpx
openai
```

---

## Next Steps

Phases 1–4 are complete. Next up:

- Phase 5: React web UI

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full plan.

## Data source & legal

This tool reads publicly available data from [DigitalTruth](https://www.digitaltruth.com/devchart.php). It is **not affiliated** with Digitaltruth Photo Ltd. Users run the scraper themselves; see [docs/LEGAL.md](docs/LEGAL.md) before open-source release.
