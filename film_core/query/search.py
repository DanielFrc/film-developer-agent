from dataclasses import dataclass

from rapidfuzz import fuzz, process

from film_core.query.gold_store import GoldStore


@dataclass(frozen=True)
class SearchResult:
    name: str
    value: str | None
    score: float


def search_films(store: GoldStore, query: str, *, limit: int = 10) -> list[SearchResult]:
    films = store.fetch_all_films()
    if not films:
        return []

    choices = {film: film for film, _ in films}
    matches = process.extract(
        query,
        choices,
        scorer=fuzz.WRatio,
        limit=limit,
    )

    value_by_film = dict(films)
    return [
        SearchResult(
            name=match[0],
            value=value_by_film.get(match[0]),
            score=round(float(match[1]), 2),
        )
        for match in matches
        if match[1] > 0
    ]


def search_developers(
    store: GoldStore, query: str, *, limit: int = 10
) -> list[SearchResult]:
    developers = store.fetch_all_developers()
    if not developers:
        return []

    choices = {developer: developer for developer, _ in developers}
    matches = process.extract(
        query,
        choices,
        scorer=fuzz.WRatio,
        limit=limit,
    )

    value_by_developer = dict(developers)
    return [
        SearchResult(
            name=match[0],
            value=value_by_developer.get(match[0]),
            score=round(float(match[1]), 2),
        )
        for match in matches
        if match[1] > 0
    ]
