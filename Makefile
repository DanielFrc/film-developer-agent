.PHONY: install test lint web-build openapi check dev pipeline

install:
	pip install -e ".[dev]"

test:
	pytest -q

lint:
	ruff check .

web-build:
	cd apps/web && npm run build

openapi:
	python scripts/export_openapi.py

check: lint test web-build

dev:
	./scripts/dev.sh

pipeline:
	film-agent pipeline
