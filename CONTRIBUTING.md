# Contributing

Thanks for your interest in Film Developer Agent. This project is designed as a **local-first, open-source data engineering learning repo** — contributions that improve clarity, tests, or architecture are welcome.

## Before you start

1. Read [docs/QUICKSTART.md](docs/QUICKSTART.md) to run the stack locally.
2. Read [docs/LEGAL.md](docs/LEGAL.md) — especially data and AI usage rules below.

## Development setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
make check          # ruff + pytest + web build
```

Or use individual targets from the [Makefile](Makefile): `make test`, `make lint`, `make web-build`.

## Pull requests

1. Fork and create a feature branch from `main`.
2. Keep changes focused — one concern per PR when possible.
3. Run `make check` before opening the PR.
4. Update docs if you change API contracts (`python scripts/export_openapi.py` + web types if needed).
5. Describe **why** in the PR, not only **what**.

## Code style

- Python: [Ruff](https://docs.astral.sh/ruff/) (`ruff check .`), target Python 3.13.
- TypeScript/React: match existing patterns in `apps/web/`.
- Prefer readable, modular code over abstraction for its own sake.

## Tests

```bash
pytest -q                    # Python (59+ tests, mocked LLM in API tests)
cd apps/web && npm run build # TypeScript compile + Vite production build
```

CI runs the same checks on push/PR (see [.github/workflows/ci.yml](.github/workflows/ci.yml)).

## Data & DigitalTruth policy

**Do not commit scraped datasets.**

| Allowed in git | Not allowed in git |
|--------------|-------------------|
| Code, docs, test fixtures (`tests/fixtures/`) | Full `data/raw/` scrape output |
| Curated seed catalog (`catalogs/`) | Full gold/silver parquet from live scrapes |
| Empty `.gitkeep` under `data/` | Bulk JSON/parquet exports of DigitalTruth |

Users run `film-agent pipeline` locally to build their own index.

### AI / training policy

DigitalTruth publishes `Content-Signal: ai-train=no` in [robots.txt](https://www.digitaltruth.com/robots.txt).

Contributors must **not**:

- Use DigitalTruth exports to train or fine-tune models.
- Add datasets intended for model training derived from scraped chart data.

Allowed: using lookup values as **prompt context** (RAG-style recipe generation) — how the app already works.

## Questions

Open a [GitHub issue](https://github.com/DanielFrc/film-developer-agent/issues) for bugs or design questions.
