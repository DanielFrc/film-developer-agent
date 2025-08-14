import logging

from digitaltruth_scrapper.digitaltruth.base import get_digitaltruth_info
from digitaltruth_scrapper.digitaltruth.fetch_developers import parse_developer_list
from digitaltruth_scrapper.digitaltruth.fetch_films import parse_film_list
from digitaltruth_scrapper.digitaltruth.fetch_times import get_film_information


def fetch_films_and_developers():
    """
    Fetches film and developer information from DigitalTruth.

    Returns:
        A tuple containing a list of films and a list of developers.
    """
    logger = logging.getLogger(__name__)

    logger.info("Fetching DigitalTruth information...")
    html_content = get_digitaltruth_info()

    if not html_content:
        logger.error("Failed to fetch DigitalTruth page.")
        return [], []

    films = parse_film_list(html_content)
    developers = parse_developer_list(html_content)

    logger.info(f"Parsed {len(films)} films and {len(developers)} developers.")

    return films, developers


def fetch_film_times(film_name: str) -> list[dict]:
    """
    Safely fetches development times for a given film name.

    Args:
        film_name: The name of the film to fetch development times for.

    Returns:
        A list of dictionaries containing development times or None if an error occurs.
    """

    logger = logging.getLogger(__name__)

    try:
        film_info = get_digitaltruth_info(film_name=film_name)

        if film_info:
            return get_film_information(film_info)
        else:
            logger.warning(f"No info found for {film_name}")
            return None

    except Exception as e:
        logger.error(
            f"An error occurred while fetching development times for {film_name}: {e}"
        )
        return None


def retry_fetch_film_times(
    films: list[dict], max_retries: int = 3
) -> list[dict] | None:
    """
    Retries fetching film times with a maximum number of retries.

    Args:
        films: A list of dictionaries containing film information.
        max_retries: Maximum number of retries if fetching fails.

    Returns:
        A list of dictionaries containing development times or None if all retries fail.
    """

    logger = logging.getLogger(__name__)

    results = []
    retry_count = {film.get("film", "unknown"): 0 for film in films}
    queue = films.copy()

    while queue:
        film = queue.pop(0)
        film_name = film.get("film", "unknown")
        film_value = film.get("value", None)

        retry_count[film_name] += 1
        logger.warning(
            f"Retrying failed fetch for {film_name} (attempt {retry_count[film_name]}/{max_retries})..."
        )

        data = fetch_film_times(film_value)

        if data:
            logger.info(
                f"Information fetched successfully for {film_name} after retry."
            )
            results.extend(data)

        elif retry_count[film_name] < max_retries:
            logger.error(
                f"Failed to fetch information for {film_name} after retry {retry_count[film_name]}. Will retry again."
            )
            # time.sleep(random_delay())
            queue.append(film)
        else:
            logger.error(
                f"Failed to fetch information for {film_name} after {max_retries} attempts. Giving up."
            )

    return results
