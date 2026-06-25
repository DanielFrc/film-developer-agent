#!/usr/bin/env bash
# Start film-api + Vite web dev server from repo root.
# Usage: ./scripts/dev.sh   (activate venv and create .env first — see docs/QUICKSTART.md)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WEB_DIR="$ROOT/apps/web"
API_URL="${DEV_API_URL:-http://localhost:8000}"
WEB_URL="${DEV_WEB_URL:-http://localhost:5173}"
WEB_HOST="${DEV_WEB_HOST:-0.0.0.0}"
WEB_PORT="${DEV_WEB_PORT:-5173}"
DATA_DIR="${DATA_PATH:-data}"

get_lan_ip() {
  if command -v ipconfig >/dev/null 2>&1; then
    local iface ip
    for iface in en0 en1 bridge0; do
      ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
      if [[ -n "$ip" ]]; then
        echo "$ip"
        return 0
      fi
    done
  elif command -v ip >/dev/null 2>&1; then
    ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit }}'
    return 0
  fi
  return 1
}

if [[ ! -f .env ]]; then
  echo "Missing .env — copy the example and adjust LLM settings:"
  echo "  cp .env.example .env"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

DATA_DIR="${DATA_PATH:-data}"
GOLD_FILE="$DATA_DIR/normalized/digitaltruth_film_data.parquet.gz"

if [[ ! -f "$GOLD_FILE" ]]; then
  echo "Warning: gold dataset not found at $GOLD_FILE"
  echo "Run ETL first:  film-agent pipeline"
  echo "  (or film-agent pipeline --skip-scrape if data/raw/ already exists)"
  echo
fi

if ! command -v film-api >/dev/null 2>&1; then
  echo "film-api not on PATH. Install the package in your venv:"
  echo "  pip install -e \".[dev]\""
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js 20+ or use Docker Compose (see docs/QUICKSTART.md)."
  exit 1
fi

if [[ ! -f "$WEB_DIR/.env" ]]; then
  cp "$WEB_DIR/.env.example" "$WEB_DIR/.env"
  echo "Created apps/web/.env from .env.example"
fi

if [[ ! -d "$WEB_DIR/node_modules" ]]; then
  echo "Installing web dependencies..."
  (cd "$WEB_DIR" && npm install)
fi

API_PID=""
WEB_PID=""

cleanup() {
  echo
  echo "Stopping dev servers..."
  if [[ -n "$WEB_PID" ]] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID" 2>/dev/null || true
  fi
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
  fi
  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "Starting film-api → $API_URL"
film-api &
API_PID=$!

echo "Waiting for API health..."
ready=false
for _ in $(seq 1 45); do
  if curl -sf "$API_URL/health" >/dev/null 2>&1; then
    ready=true
    break
  fi
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "film-api exited unexpectedly."
    exit 1
  fi
  sleep 1
done

if [[ "$ready" != true ]]; then
  echo "API did not become healthy within 45s ($API_URL/health)."
  exit 1
fi

echo "Starting web dev server → $WEB_URL (host $WEB_HOST)"
(cd "$WEB_DIR" && npm run dev -- --host "$WEB_HOST" --port "$WEB_PORT") &
WEB_PID=$!

LAN_IP="$(get_lan_ip || true)"

echo
echo "  Local:  $WEB_URL"
if [[ -n "$LAN_IP" ]]; then
  echo "  LAN:    http://${LAN_IP}:${WEB_PORT}  (phones/tablets on same Wi-Fi)"
else
  echo "  LAN:    (could not detect IP — use your machine's Wi-Fi address on port ${WEB_PORT})"
fi
echo "  API:    $API_URL"
echo "  Press Ctrl+C to stop both"
echo

wait "$WEB_PID"
