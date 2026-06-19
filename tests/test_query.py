from film_core.query import (
    GoldStore,
    lookup_developing_times,
    search_developers,
    search_films,
)


def test_search_films_fuzzy_match(gold_dataset):
    with GoldStore() as store:
        results = search_films(store, "hp5", limit=5)

    assert results
    assert results[0].name == "ilford hp5 plus"
    assert results[0].score >= 80


def test_search_developers_fuzzy_match(gold_dataset):
    with GoldStore() as store:
        results = search_developers(store, "rodinal", limit=5)

    assert results
    assert results[0].name == "rodinal"
    assert results[0].score >= 90


def test_lookup_developing_time(gold_dataset):
    with GoldStore() as store:
        matches = lookup_developing_times(
            store,
            film="Ilford HP5 Plus",
            developer="Rodinal",
            format="120",
            iso="400",
            dilution="1+50",
        )

    assert len(matches) == 1
    match = matches[0]
    assert match.film == "ilford hp5 plus"
    assert match.developer == "rodinal"
    assert match.format == "120"
    assert match.iso == "400"
    assert match.dilution == "1+50"
    assert match.dev_time == "12"
    assert match.temp == "20"
    assert match.notes == "Test note"


def test_lookup_with_dilution_filter(gold_dataset):
    with GoldStore() as store:
        matches = lookup_developing_times(
            store,
            film="ilford hp5 plus",
            developer="rodinal",
            format="120",
            iso="400",
            dilution="1+50",
        )

    assert len(matches) == 1
    assert matches[0].dilution == "1+50"


def test_lookup_no_match_returns_empty(gold_dataset):
    with GoldStore() as store:
        matches = lookup_developing_times(
            store,
            film="ilford hp5 plus",
            developer="rodinal",
            format="120",
            iso="800",
        )

    assert matches == []
