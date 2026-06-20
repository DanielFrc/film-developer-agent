#!/usr/bin/env python3
"""Export OpenAPI schema from the FastAPI app to openapi.json."""

import json
from pathlib import Path

from film_agent_api.main import app

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "openapi.json"


def main() -> None:
    schema = app.openapi()
    OUTPUT.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
