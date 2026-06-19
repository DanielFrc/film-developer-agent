"""DuckDB query layer over gold parquet tables."""

from film_core.query.gold_store import GoldStore
from film_core.query.lookup import DevelopingTimeMatch, lookup_developing_times
from film_core.query.search import SearchResult, search_developers, search_films

__all__ = [
    "DevelopingTimeMatch",
    "GoldStore",
    "SearchResult",
    "lookup_developing_times",
    "search_developers",
    "search_films",
]
