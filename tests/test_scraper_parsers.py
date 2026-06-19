from digitaltruth_scrapper.digitaltruth.fetch_developers import parse_developer_list
from digitaltruth_scrapper.digitaltruth.fetch_films import parse_film_list
from digitaltruth_scrapper.digitaltruth.fetch_times import get_film_information


def test_parse_film_list(devchart_html):
    films = parse_film_list(devchart_html)
    assert len(films) == 2
    assert films[0]["film"] == "Ilford HP5 Plus"
    assert films[0]["value"] == "HP5+"


def test_parse_developer_list(devchart_html):
    developers = parse_developer_list(devchart_html)
    assert len(developers) == 2
    assert developers[0]["developer"] == "Rodinal"


def test_get_film_information(film_times_html):
    rows = get_film_information(film_times_html)
    assert len(rows) == 2
    assert rows[0]["film"] == "Ilford HP5 Plus"
    assert rows[0]["35mm"] == "11"
    assert rows[1]["developer"] == "ID-11"
