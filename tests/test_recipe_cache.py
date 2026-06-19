from film_llm.recipe_cache import (
    CacheLookupParams,
    RecipeCacheService,
    build_cache_key,
)


def test_build_cache_key_is_stable():
    params = CacheLookupParams(
        film="ilford hp5 plus",
        developer="rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        temperature="20",
        base_time="12",
        prompt_version="1",
        llm_provider="mock",
        llm_model="mock-recipe-v1",
        language="en",
    )
    assert build_cache_key(params) == build_cache_key(params)


def test_recipe_cache_store_and_hit(tmp_path):
    cache = RecipeCacheService(db_path=tmp_path / "recipes.db")
    params = CacheLookupParams(
        film="ilford hp5 plus",
        developer="rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        temperature="20",
        base_time="12",
        prompt_version="1",
        llm_provider="mock",
        llm_model="mock-recipe-v1",
        language="en",
    )
    cache_key = build_cache_key(params)
    cache.store(
        cache_key=cache_key,
        params=params,
        recipe_markdown="1. Materials: tank",
        source_hash="abc123",
    )

    hit = cache.get(cache_key, current_source_hash="abc123")
    assert hit is not None
    assert hit.recipe_markdown == "1. Materials: tank"
    assert hit.use_count == 2


def test_recipe_cache_miss_on_source_hash_change(tmp_path):
    cache = RecipeCacheService(db_path=tmp_path / "recipes.db")
    params = CacheLookupParams(
        film="ilford hp5 plus",
        developer="rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        temperature="20",
        base_time="12",
        prompt_version="1",
        llm_provider="mock",
        llm_model="mock-recipe-v1",
        language="en",
    )
    cache_key = build_cache_key(params)
    cache.store(
        cache_key=cache_key,
        params=params,
        recipe_markdown="cached recipe",
        source_hash="old-hash",
    )

    assert cache.get(cache_key, current_source_hash="new-hash") is None


def test_build_cache_key_differs_with_extra_context():
    base = CacheLookupParams(
        film="ilford hp5 plus",
        developer="rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        temperature="20",
        base_time="12",
        prompt_version="2",
        llm_provider="mock",
        llm_model="mock-recipe-v1",
        language="en",
        extra_context="",
    )
    with_context = CacheLookupParams(
        film="ilford hp5 plus",
        developer="rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        temperature="20",
        base_time="12",
        prompt_version="2",
        llm_provider="mock",
        llm_model="mock-recipe-v1",
        language="en",
        extra_context="stand development",
    )

    assert build_cache_key(base) != build_cache_key(with_context)
