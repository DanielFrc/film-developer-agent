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


def test_cors_allows_vite_origin(api_client):
    response = api_client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_stats(api_client):
    response = api_client.get("/stats")
    assert response.status_code == 200
    payload = response.json()
    assert payload["films"] >= 1
    assert payload["developers"] >= 1
    assert payload["developing_time_combinations"] >= 1
    assert payload["source"] == "DigitalTruth"
    assert payload["schema_version"] == "1"
    assert payload["source_hash"]


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


def test_explorer_schema_gold(api_client):
    response = api_client.get("/explorer/schema", params={"layer": "gold"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["layer"] == "gold"
    column_names = {column["name"] for column in payload["columns"]}
    assert {"film", "developer", "iso", "dev_time"}.issubset(column_names)


def test_explorer_data_gold_filtered(api_client):
    response = api_client.get(
        "/explorer/data",
        params={
            "layer": "gold",
            "page": 1,
            "page_size": 10,
            "film": "hp5",
            "iso": "400",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["layer"] == "gold"
    assert payload["page"] == 1
    assert payload["page_size"] == 10
    assert payload["total"] >= 1
    assert payload["rows"]
    assert "film" in payload["columns"]


def test_explorer_invalid_layer(api_client):
    response = api_client.get("/explorer/schema", params={"layer": "platinum"})
    assert response.status_code == 400
    assert "Invalid layer" in response.json()["detail"]


class FailingLLMProvider:
    provider_name = "failing"
    model_name = "failing-v1"

    def generate(self, *, system_message: str, user_prompt: str):
        raise RuntimeError("Ollama request failed (403). Check OLLAMA_BASE_URL.")


def test_create_recipe_llm_failure_returns_502(api_client, gold_dataset, tmp_path):
    cache = RecipeCacheService(db_path=tmp_path / "api_recipes_fail.db")
    service = RecipeService(cache=cache, llm_provider=FailingLLMProvider())
    app.dependency_overrides[get_recipe_service] = lambda: service
    client = TestClient(app)

    body = {
        "film": "Ilford HP5 Plus",
        "developer": "Rodinal",
        "format": "120",
        "iso": "400",
        "dilution": "1+50",
    }
    response = client.post("/recipes", json=body)

    app.dependency_overrides.clear()

    assert response.status_code == 502
    assert "Ollama request failed" in response.json()["detail"]


def test_developers_search(api_client):
    response = api_client.get("/developers", params={"q": "rod"})
    assert response.status_code == 200
    payload = response.json()
    assert payload[0]["name"] == "rodinal"


def test_formats_list(api_client):
    response = api_client.get("/formats")
    assert response.status_code == 200
    formats = {item["format"] for item in response.json()}
    assert {"35mm", "120", "sheet"}.issubset(formats)


def test_developing_times_not_found(api_client):
    response = api_client.get(
        "/developing-times",
        params={
            "film": "Ilford HP5 Plus",
            "developer": "Rodinal",
            "format": "120",
            "iso": "99999",
        },
    )
    assert response.status_code == 404
    assert "No developing time" in response.json()["detail"]


def test_compare_developers(api_client):
    response = api_client.get(
        "/compare",
        params={
            "film": "Ilford HP5 Plus",
            "format": "120",
            "iso": "400",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 2
    developers = {item["developer"] for item in payload}
    assert "rodinal" in developers
    assert all(item["film"] == "ilford hp5 plus" for item in payload)
    assert all(item["format"] == "120" for item in payload)
    assert all(item["iso"] == "400" for item in payload)


def test_compare_developers_not_found(api_client):
    response = api_client.get(
        "/compare",
        params={
            "film": "Ilford HP5 Plus",
            "format": "120",
            "iso": "99999",
        },
    )
    assert response.status_code == 404
    assert "No developing times" in response.json()["detail"]


def test_create_recipe_ambiguous_returns_409(api_client):
    body = {
        "film": "Ilford HP5 Plus",
        "developer": "Rodinal",
        "format": "120",
        "iso": "400",
    }
    response = api_client.post("/recipes", json=body)
    assert response.status_code == 409
    assert "dilution" in response.json()["detail"].lower()


def test_stats_missing_gold_returns_503(tmp_path, monkeypatch):
    import config

    empty = tmp_path / "empty"
    for sub in ("raw", "processed", "normalized", "historical", "manifests"):
        (empty / sub).mkdir(parents=True)

    monkeypatch.setenv("DATA_PATH", str(empty))
    config.refresh_from_env()
    try:
        client = TestClient(app)
        response = client.get("/stats")
        assert response.status_code == 503
        assert "Gold dataset not found" in response.json()["detail"]
    finally:
        config.refresh_from_env()


def test_explorer_data_bronze(api_client):
    response = api_client.get(
        "/explorer/data",
        params={"layer": "bronze", "page": 1, "page_size": 5},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["layer"] == "bronze"
    assert payload["total"] >= 1


def test_explorer_data_silver(api_client):
    response = api_client.get(
        "/explorer/data",
        params={"layer": "silver", "page": 1, "page_size": 5},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["layer"] == "silver"
    assert payload["total"] >= 1


def test_explorer_catalog_films(api_client):
    response = api_client.get(
        "/explorer/catalog",
        params={"catalog": "films", "page": 1, "page_size": 10, "q": "hp5"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["catalog"] == "films"
    assert payload["total"] >= 1
    assert payload["rows"]
    assert "film" in payload["columns"]


def test_explorer_catalog_developers(api_client):
    response = api_client.get(
        "/explorer/catalog",
        params={"catalog": "developers", "page": 1, "page_size": 10},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["catalog"] == "developers"
    assert payload["total"] >= 1
    assert "developer" in payload["columns"]


def test_explorer_catalog_invalid(api_client):
    response = api_client.get("/explorer/catalog", params={"catalog": "formats"})
    assert response.status_code == 400
    assert "Invalid catalog" in response.json()["detail"]


def test_explorer_source_filter_without_column(api_client):
    response = api_client.get(
        "/explorer/data",
        params={"layer": "gold", "source": "digitaltruth"},
    )
    assert response.status_code == 200
    assert response.json()["source_filter_applied"] is False
