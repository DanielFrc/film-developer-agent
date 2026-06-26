# Quickstart

Three ways to use Film Developer Agent, from simplest to full browser UI. All paths assume you clone the repo and work from the project root.

**Prerequisites (all paths):** Python 3.13+, Git.

| Path | Also needs | Best for |
|------|------------|----------|
| [1 — CLI only](#path-1--cli-only) | — | Pipeline, lookup, recipes in the terminal |
| [2 — Local dev stack](#path-2--local-dev-stack) | Node.js 20+ | Day-to-day UI development |
| [3 — Docker Compose](#path-3--docker-compose) | Docker | API + web without local Node/Python setup |

Legal note: you run the scraper yourself; see [LEGAL.md](LEGAL.md). Pipeline output stays under `./data/` (gitignored).

---

## First-time setup (every path)

### 1. Clone and install Python package

```bash
git clone <your-fork-or-upstream-url>
cd film-developer-agent

python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum pick an LLM provider (see below)
```

Load env before API/CLI recipe commands:

```bash
set -a && source .env && set +a    # Windows (PowerShell): use your usual dotenv flow
```

### 3. Build gold data (required once)

The API and UI read **gold parquet** under `data/normalized/`. Without it, lookup and stats return errors.

```bash
# Full pipeline: scrape → process → normalize (network; can take a while)
film-agent pipeline

# Or, if you already have bronze JSON under data/raw/:
film-agent pipeline --skip-scrape
```

Verify:

```bash
ls data/normalized/digitaltruth_film_data.parquet.gz
film-agent films search "hp5"
```

---

## LLM provider (recipes only)

Recipes need an LLM. Lookup and search work without one.

### Ollama (local, default)

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3.1:8b

# .env
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT=600    # raise for large models (e.g. 900 for 70B)
```

### OpenAI

```bash
# .env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Restart `film-api` after changing `.env`.

### Recipe language (English / Spanish)

- **Web UI:** Preferences → **Recipe language (LLM)** — applies to full recipes and session executive summaries. UI labels stay in English.
- **API / CLI:** pass `language` (`en` or `es`) on `POST /recipes` and `POST /session-summaries`, or `film-agent recipe --lang es`.
- **Server default:** `RECIPE_LANGUAGE=en` in `.env` when the client omits `language`.

---

## Path 1 — CLI only

No browser, no Node. Good for ETL, scripting, and quick lookups.

```bash
source .venv/bin/activate
set -a && source .env && set +a

# Search & lookup
film-agent films search "hp5"
film-agent developers search "rodinal"
film-agent times lookup \
  --film "Ilford HP5 Plus" \
  --developer "Rodinal" \
  --format 120 \
  --iso 400 \
  --dilution "1+50"

# Generate recipe (uses LLM + SQLite cache under data/cache/)
film-agent recipe \
  --film "Ilford HP5 Plus" \
  --developer "Rodinal" \
  --format 120 \
  --iso 400 \
  --dilution "1+50" \
  --output recipe.md

film-agent recipe ... --force   # bypass cache
```

**Refresh data later:**

```bash
film-agent scrape      # optional — hits DigitalTruth
film-agent process
film-agent normalize
# or: film-agent pipeline [--skip-scrape]
```

---

## Path 2 — Local dev stack

Browser UI at [http://localhost:5173](http://localhost:5173) with hot reload. ETL still runs via CLI (Path 1).

### One command (recommended)

From repo root, with venv activated:

```bash
./scripts/dev.sh
```

This script:

1. Loads `.env`
2. Warns if gold data is missing
3. Starts `film-api` on port **8000** (listens on all interfaces)
4. Starts Vite on port **5173** with `--host 0.0.0.0` (reachable on your LAN)
5. Prints a **LAN URL** for phones/tablets on the same Wi-Fi
6. Runs `npm install` in `apps/web` if needed
7. Stops both on **Ctrl+C**

### Phone / tablet on the same Wi-Fi

After `./scripts/dev.sh`, open the **LAN** URL printed in the terminal (e.g. `http://192.168.1.42:5173`). Keep `apps/web/.env` with `VITE_API_URL=/api` so the browser uses Vite's proxy — do not point mobile browsers at `localhost:8000`.

Requirements: same Wi-Fi (not guest network), macOS firewall allows incoming on port 5173. Library data stays in each browser's localStorage unless you export/import a backup.

### Manual (two terminals)

**Terminal 1 — API**

```bash
source .venv/bin/activate
set -a && source .env && set +a
film-api
```

**Terminal 2 — Web**

```bash
cd apps/web
cp -n .env.example .env    # first time only
npm install
npm run dev -- --host 0.0.0.0
```

Open [http://localhost:5173](http://localhost:5173) (or `http://<your-lan-ip>:5173` from other devices). Vite proxies `/api` → `http://localhost:8000`.

### What you can do in the UI

- Dashboard — dataset stats, freshness, explorer shortcuts
- Library — saved recipes, combinations, favorites, recent searches
- Search — developing time lookup
- Recipe — generate, save, set defaults (personal data in browser `localStorage`)
- Explorer — bronze/silver/gold tables and film/developer catalogs
- Preferences — global and per-film context; library JSON backup

---

## Path 3 — Docker Compose

Runs API + web in containers. **Gold data must exist on the host** under `./data/` (run Path 1 pipeline once, or copy an existing `data/` tree).

```bash
cp .env.example .env
# Edit .env — same LLM vars; DATA_PATH=/data inside containers

docker compose up --build api web
```

| Service | URL |
|---------|-----|
| Web UI | [http://localhost:5173](http://localhost:5173) (or `http://<your-lan-ip>:5173` on the same Wi-Fi) |
| API | [http://localhost:8000](http://localhost:8000) |
| Health | [http://localhost:8000/health](http://localhost:8000/health) |

**ETL in Docker** (optional, separate one-off):

```bash
docker compose run --rm etl
```

**Production-style static UI** (nginx on port 8080):

```bash
docker compose --profile prod up --build api web-prod
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `503 Gold dataset not found` | Run `film-agent pipeline` (or `--skip-scrape`) |
| Recipe `502` / timeout | Ollama slow or down — check `ollama serve`, raise `OLLAMA_TIMEOUT`, or use OpenAI |
| Recipe `403` from Ollama | Wrong `OLLAMA_BASE_URL` or model not pulled |
| Web shows API error | Ensure `film-api` is running; check `curl localhost:8000/health` |
| CORS errors | Add your origin to `CORS_ORIGINS` in `.env` |
| Empty search autocomplete | Gold dimensions missing — re-run normalize |
| Second recipe instant (`cached: true`) | Expected — SQLite cache; use Regenerate in UI or `--force` in CLI |

---

## Development & tests

```bash
pip install -e ".[dev]"
ruff check .
pytest -q
cd apps/web && npm run build
python scripts/export_openapi.py   # after API schema changes
```

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [README.md](../README.md) | Project overview |
| [PORTFOLIO.md](PORTFOLIO.md) | Demo script & interview guide |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Pipeline and data model |
| [ROADMAP.md](ROADMAP.md) | Phased plan |
| [PHASE5_2.md](PHASE5_2.md) | Personal library & preferences |
| [PHASE5_3.md](PHASE5_3.md) | Library IA, personal knowledge & session cards |
| [LEGAL.md](LEGAL.md) | DigitalTruth and OSS |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Contributor guide |
