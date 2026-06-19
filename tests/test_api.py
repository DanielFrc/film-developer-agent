import pytest
from fastapi.testclient import TestClient

from film_agent_api.main import app, get_recipe_service
from film_llm.providers import MockLLMProvider
from film_llm.recipe_cache import RecipeCacheService
from film_llm.service import RecipeService


@pytest.fixture
def api_client(gold_dataset, tmp_path):
    cache = RecipeCacheService(db_path=tmp_path / "api_recipes.db")
    service = RecipeService(cache=cache, llm_provider=MockLLMProvider())
    app.dependency_overrides[get_recipe_service] = lambda: service
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health(api_client):
    response = api_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_films_search(api_client):
    response = api_client.get("/films", params={"q": "hp5"})
    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["name"] == "ilford hp5 plus"


def test_developing_times_lookup(api_client):
    response = api_client.get(
        "/developing-times",
        params={
            "film": "Ilford HP5 Plus",
            "developer": "Rodinal",
            "format": "120",
            "iso": "400",
            "dilution": "1+50",
        },
    )
    assert response.status_code == 200
    assert response.json()[0]["dev_time"] == "12"


def test_create_recipe_and_cache(api_client):
    body = {
        "film": "Ilford HP5 Plus",
        "developer": "Rodinal",
        "format": "120",
        "iso": "400",
        "dilution": "1+50",
    }
    first = api_client.post("/recipes", json=body)
    second = api_client.post("/recipes", json=body)

    assert first.status_code == 200
    assert first.json()["cached"] is False
    assert first.json()["source"] == "DigitalTruth"
    assert "Materials" in first.json()["recipe"]

    assert second.status_code == 200
    assert second.json()["cached"] is True


def test_create_recipe_with_extra_context(api_client):
    body = {
        "film": "Ilford HP5 Plus",
        "developer": "Rodinal",
        "format": "120",
        "iso": "400",
        "dilution": "1+50",
        "extra_context": "Stand development, grainy look",
    }
    response = api_client.post("/recipes", json=body)

    assert response.status_code == 200
    assert response.json()["extra_context"] == "stand development, grainy look"
    assert response.json()["cached"] is False
