import os
from pathlib import Path

RANDOM_HEADERS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "AppleWebKit/537.36 (KHTML, like Gecko)",
    "Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
]

DIGITALTRUTH_URL = "https://www.digitaltruth.com/devchart.php"
DIGITALTRUTH_BASE_VARS = "&Developer=&mdc=Search&TempUnits=C&TimeUnits=D"
DIGITAL_TRUTH_FILM_URL = f"https://www.digitaltruth.com/chart/search_text.php?Film=<FILM>{DIGITALTRUTH_BASE_VARS}"

SEARCHBOX_VALUE = "searchbox"
EMPTY_VALUE = ""

MAX_WORKERS = 50


# Base directories
BASE_PATH = os.path.abspath(os.getenv("DATA_PATH", "data/"))
RAW_PATH = Path(os.path.join(BASE_PATH, "raw"))
PROCESSED_PATH = os.path.join(BASE_PATH, "processed")
HISTORICAL_PATH = os.path.join(BASE_PATH, "historical")

# FILE NAMES
FORMATS_FILE = "chatgpt_film_formats.json"
FORMATS_METADATA = "chatgpt_film_formats.meta.json"

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

# Input files
FORMAT_PATH = os.path.join(RAW_PATH, FORMATS_FILE)
FILM_PATH = os.path.join(RAW_PATH, FILMS_FILE)
DEVELOPERS_PATH = os.path.join(RAW_PATH, DEVELOPERS_FILE)
DEVELOPING_TIMES_PATH = os.path.join(RAW_PATH, DEVELOPING_TIMES_FILE)

# Input METADATA
FORMAT_METADATA_PATH = os.path.join(RAW_PATH, FORMATS_METADATA)
FILM_METADATA_PATH = os.path.join(RAW_PATH, FILMS_METADATA)
DEVELOPERS_METADATA_PATH = os.path.join(RAW_PATH, DEVELOPERS_METADATA)
DEVELOPING_TIMES_METADATA_PATH = os.path.join(RAW_PATH, DEVELOPING_TIMES_METADATA)

# Output files
FORMAT_OUT = os.path.join(PROCESSED_PATH, FORMAT_PARQUET)
DEVELOPERS_OUT = os.path.join(PROCESSED_PATH, DEVELOPERS_PARQUET)
FILMS_OUT = os.path.join(PROCESSED_PATH, FILMS_PARQUET)
DEVELOPING_TIMES_OUT = os.path.join(PROCESSED_PATH, DEVELOPING_TIMES_PARQUET)

# LOG CONFIGURATION
LOG_CONFIG = os.path.abspath("logger/logging_config.ini")
LOG_PATH = os.path.abspath("logs/")
SCRAPPER_LOG = "digitaltruthscrapper.log"
TRANSFORMER_LOG = "digitaltruthtransformer.log"
