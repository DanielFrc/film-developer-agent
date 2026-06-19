import pytest

from film_llm.providers import MockLLMProvider
from film_llm.recipe_cache import RecipeCacheService
from film_llm.service import RecipeAmbiguousError, RecipeService


@pytest.fixture
def recipe_service(gold_dataset, tmp_path):
    cache = RecipeCacheService(db_path=tmp_path / "recipes.db")
    llm = MockLLMProvider(recipe_text="1. Materials: Developer, tank.\n10. Safety first.")
    return RecipeService(cache=cache, llm_provider=llm)


def test_recipe_service_generates_from_lookup(recipe_service):
    result = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
    )

    assert result.cached is False
    assert "Materials" in result.recipe
    assert result.lookup.base_time == "12"
    assert result.lookup.film == "ilford hp5 plus"
    assert "Verify all times independently" in result.recipe


def test_recipe_service_cache_hit_skips_llm(recipe_service):
    first = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
    )
    second = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
    )

    assert first.cached is False
    assert second.cached is True
    assert second.recipe == first.recipe


def test_recipe_service_force_regenerate_bypasses_cache(recipe_service):
    recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
    )
    forced = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        force_regenerate=True,
    )

    assert forced.cached is False


def test_recipe_service_requires_dilution_when_ambiguous(recipe_service):
    with pytest.raises(RecipeAmbiguousError):
        recipe_service.generate(
            film="Ilford HP5 Plus",
            developer="Rodinal",
            format="120",
            iso="400",
        )


def test_recipe_service_extra_context_changes_cache_key(recipe_service):
    base = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
    )
    with_context = recipe_service.generate(
        film="Ilford HP5 Plus",
        developer="Rodinal",
        format="120",
        iso="400",
        dilution="1+50",
        extra_context="stand development",
    )

    assert base.cache_key != with_context.cache_key
    assert with_context.extra_context == "stand development"
    assert with_context.cached is False
