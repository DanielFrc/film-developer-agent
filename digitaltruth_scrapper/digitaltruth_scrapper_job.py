import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from config import (
    DIGITAL_TRUTH_FILM_URL,
    DIGITALTRUTH_URL,
    LOG_CONFIG,
    LOG_PATH,
    MAX_WORKERS,
    SCRAPE_MAX_RETRIES,
    SCRAPPER_LOG,
)
from digitaltruth_scrapper.processors.fetch_film_information import (
    fetch_film_times,
    fetch_films_and_developers,
    retry_fetch_film_times,
)
from digitaltruth_scrapper.utils.save_data import save_data_to_json
from logger.logger_config import setup_logging


def run_scrapper():
    setup_logging(LOG_CONFIG, LOG_PATH, SCRAPPER_LOG)
    logger = logging.getLogger(__name__)

    films, developers = fetch_films_and_developers()

    save_data_to_json(films, "digitaltruth_films", source_url=DIGITALTRUTH_URL)
    save_data_to_json(developers, "digitaltruth_developers", source_url=DIGITALTRUTH_URL)

    logger.info("Fetching film development times in parallel...")
    film_results = []
    failed_films = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {
            executor.submit(fetch_film_times, film["value"]): film for film in films
        }
        for future in as_completed(futures):
            film = futures[future]
            film_name = film.get("film", "unknown")
            try:
                data = future.result()
                if data:
                    film_results.extend(data)
                    logger.info(f"Information fetched successfully for {film_name}.")
                else:
                    logger.warning(f"No data returned for {film_name}.")
                    failed_films.append(film)
            except Exception as e:
                logger.error(f"Exception for {film_name}: {e}")
                failed_films.append(film)

    if failed_films:
        logger.info("Retrying failed film fetches...")
        retry_results = retry_fetch_film_times(failed_films, max_retries=SCRAPE_MAX_RETRIES)
        film_results.extend(retry_results)

    save_data_to_json(
        film_results,
        "digitaltruth_film_data",
        source_url=DIGITAL_TRUTH_FILM_URL.replace("<FILM>", "{film}"),
    )

    logger.info("All tasks completed.")


if __name__ == "__main__":
    run_scrapper()
