import os
from pathlib import Path

from film_core.paths import get_data_paths
from film_core.storage.local import get_storage

RANDOM_HEADERS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
]

DIGITALTRUTH_URL = "https://www.digitaltruth.com/devchart.php"
DIGITALTRUTH_BASE_VARS = "&Developer=&mdc=Search&TempUnits=C&TimeUnits=D"
DIGITAL_TRUTH_FILM_URL = f"https://www.digitaltruth.com/chart/search_text.php?Film=<FILM>{DIGITALTRUTH_BASE_VARS}"

SEARCHBOX_VALUE = "searchbox"
EMPTY_VALUE = ""

MAX_WORKERS = int(os.getenv("MAX_WORKERS", "10"))
SCRAPE_DELAY_MIN = float(os.getenv("SCRAPE_DELAY_MIN", "0.5"))
SCRAPE_DELAY_MAX = float(os.getenv("SCRAPE_DELAY_MAX", "1.5"))
SCRAPE_MAX_RETRIES = int(os.getenv("SCRAPE_MAX_RETRIES", "3"))

# FILE NAMES (DigitalTruth scrape outputs under data/raw/)
FILMS_FILE = "digitaltruth_films.json"
FILMS_METADATA = "digitaltruth_films.meta.json"

DEVELOPERS_FILE = "digitaltruth_developers.json"
DEVELOPERS_METADATA = "digitaltruth_developers.meta.json"

DEVELOPING_TIMES_FILE = "digitaltruth_film_data.json"
DEVELOPING_TIMES_METADATA = "digitaltruth_film_data.meta.json"

FORMAT_PARQUET = "digitaltruth_formats.parquet.gz"
DEVELOPERS_PARQUET = "digitaltruth_developers.parquet.gz"
FILMS_PARQUET = "digitaltruth_films.parquet.gz"
DEVELOPING_TIMES_PARQUET = "digitaltruth_film_data.parquet.gz"

# LOG CONFIGURATION
LOG_CONFIG = os.path.abspath("logger/logging_config.ini")
LOG_PATH = os.path.abspath("logs/")
SCRAPPER_LOG = "digitaltruthscrapper.log"
PROCESSOR_LOG = "digitaltruthprocessor.log"
NORMALIZER_LOG = "digitaltruthnormalizer.log"
# Backward-compatible alias
TRANSFORMER_LOG = PROCESSOR_LOG

# Curated catalogs (versioned in repo, not scraped)
REPO_ROOT = Path(__file__).resolve().parent
CATALOGS_PATH = REPO_ROOT / "catalogs"
FORMAT_CATALOG_FILE = "film_formats.json"
FORMAT_CATALOG_METADATA = "film_formats.meta.json"

# Paths (refreshed from DATA_PATH via refresh_from_env)
BASE_PATH: str
RAW_PATH: Path
PROCESSED_PATH: str
HISTORICAL_PATH: str
MANIFESTS_PATH: str
NORMALIZED_PATH: str
FORMAT_PATH: str
FILM_PATH: str
DEVELOPERS_PATH: str
DEVELOPING_TIMES_PATH: str
FORMAT_METADATA_PATH: str
FILM_METADATA_PATH: str
DEVELOPERS_METADATA_PATH: str
DEVELOPING_TIMES_METADATA_PATH: str
FORMAT_OUT: str
DEVELOPERS_OUT: str
FILMS_OUT: str
DEVELOPING_TIMES_OUT: str
GOLD_FORMAT_OUT: str
GOLD_DEVELOPERS_OUT: str
GOLD_FILMS_OUT: str
GOLD_DEVELOPING_TIMES_OUT: str


def refresh_from_env() -> None:
    """Re-read DATA_PATH and update all path constants (for tests and runtime)."""
    get_data_paths.cache_clear()
    get_storage.cache_clear()

    paths = get_data_paths()
    paths.ensure_all()

    global BASE_PATH, RAW_PATH, PROCESSED_PATH, HISTORICAL_PATH, MANIFESTS_PATH, NORMALIZED_PATH
    global FORMAT_PATH, FILM_PATH, DEVELOPERS_PATH, DEVELOPING_TIMES_PATH
    global FORMAT_METADATA_PATH, FILM_METADATA_PATH, DEVELOPERS_METADATA_PATH
    global DEVELOPING_TIMES_METADATA_PATH
    global FORMAT_OUT, DEVELOPERS_OUT, FILMS_OUT, DEVELOPING_TIMES_OUT
    global GOLD_FORMAT_OUT, GOLD_DEVELOPERS_OUT, GOLD_FILMS_OUT, GOLD_DEVELOPING_TIMES_OUT

    BASE_PATH = str(paths.base)
    RAW_PATH = paths.raw
    PROCESSED_PATH = str(paths.processed)
    HISTORICAL_PATH = str(paths.historical)
    MANIFESTS_PATH = str(paths.manifests)
    NORMALIZED_PATH = str(paths.normalized)

    FORMAT_PATH = str(CATALOGS_PATH / FORMAT_CATALOG_FILE)
    FORMAT_METADATA_PATH = str(CATALOGS_PATH / FORMAT_CATALOG_METADATA)
    FILM_PATH = str(paths.raw / FILMS_FILE)
    DEVELOPERS_PATH = str(paths.raw / DEVELOPERS_FILE)
    DEVELOPING_TIMES_PATH = str(paths.raw / DEVELOPING_TIMES_FILE)

    FILM_METADATA_PATH = str(paths.raw / FILMS_METADATA)
    DEVELOPERS_METADATA_PATH = str(paths.raw / DEVELOPERS_METADATA)
    DEVELOPING_TIMES_METADATA_PATH = str(paths.raw / DEVELOPING_TIMES_METADATA)

    FORMAT_OUT = str(paths.processed / FORMAT_PARQUET)
    DEVELOPERS_OUT = str(paths.processed / DEVELOPERS_PARQUET)
    FILMS_OUT = str(paths.processed / FILMS_PARQUET)
    DEVELOPING_TIMES_OUT = str(paths.processed / DEVELOPING_TIMES_PARQUET)

    GOLD_FORMAT_OUT = str(paths.normalized / FORMAT_PARQUET)
    GOLD_DEVELOPERS_OUT = str(paths.normalized / DEVELOPERS_PARQUET)
    GOLD_FILMS_OUT = str(paths.normalized / FILMS_PARQUET)
    GOLD_DEVELOPING_TIMES_OUT = str(paths.normalized / DEVELOPING_TIMES_PARQUET)


refresh_from_env()
