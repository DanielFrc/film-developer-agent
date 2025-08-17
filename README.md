# Film developer agent - Data Engineering stage

This project implements the data ingestion and transformation pipeline for the Film Developer Agent. Its goal is to collect, clean, and normalize data from DigitalTruth, creating a structured dataset ready for downstream tasks such as model training or recipe generation.

---

## Features

* Scraper Stage
  * Built with BeautifulSoup4
  * Extracts film and developer data from DigitalTruth’s development chart.

* ETL Process
  * Extract: Parses raw scraped HTML into structured records.
  * Transform: Cleans, validates, and normalizes the extracted data.
  * Load: Saves to a Parquet dataset with a normalized schema.

* Normalized Data Model
  * Four tables are generated:

1. Films – Metadata about film stocks.
2. Developers – Information about film developers.
3. Film Formats – Supported formats (e.g., 35mm, 120, sheet film).
4. Developing Times (Fact Table) – Relationships between films, developers, formats, ISO ratings, and development times.

* Containerization
  * Ready to run in Docker or orchestrated with Docker Compose.
  * Volumes configured for local data persistence.

---

## Project Structure

```graphql
film_developer_agent/
├── data/                       # Sample data
├── digitaltruth_scrapper       # Extraction logic
├── digitaltruth_transformer    # Transformation logic
├── logger                      # Logger configuration
├── compose.yml                 # Multi-container setup (if needed)
├── config.py                   # ETL Configuration properties
├── entry.py                    # Wrapper for one-step execution
├── Dockerfile                  # Container for ETL pipeline
├── requirements.txt            # Python Documentation
└── README.md                   # Project documentation

```

---

## Quickstart

### Prequisites

* Python 3.13+
* Docker & Docker compose (optional)

### Run Locally

```bash

# Install dependencies
pip install -r requirements.txt

# Run ETL pipeline
python entrypoint.py

```

Output will be saved as Parquet under `./data/`

### Run with Docker

```bash

# Build image
docker build -t film-dev-agent .

# Run container
docker run --rm -v $(pwd)/data:/data film-dev-agent

```

### Run with Docker Compose

```bash
# Build image
docker build -t film-dev-agent .

# Run container
docker run --rm -v $(pwd)/data:/data film-dev-agent

```

---

## Next Steps

This repository currently covers only the Data Engineering stage. Future components may include:

* API layer for querying normalized data.
* Integration with local or cloud LLMs to generate development recipes.
* Additional scrapers for complementary sources.
