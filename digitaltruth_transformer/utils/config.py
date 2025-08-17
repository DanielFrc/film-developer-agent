import os

# Base directories
BASE_PATH = os.path.abspath("../digitaltruth_scrapper/data")
RAW_PATH = os.path.join(BASE_PATH, "raw")
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


FORMAT_PARQUET = "digitaltruth_films.parquet.gz"
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
