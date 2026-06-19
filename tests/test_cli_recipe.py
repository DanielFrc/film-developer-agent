from typer.testing import CliRunner

from film_agent_cli.main import app
from film_llm.providers import MockLLMProvider
from film_llm.recipe_cache import RecipeCacheService
from film_llm.service import RecipeService

runner = CliRunner()


def test_cli_recipe_command(gold_dataset, tmp_path, monkeypatch):
    cache = RecipeCacheService(db_path=tmp_path / "cli_recipes.db")
    service = RecipeService(cache=cache, llm_provider=MockLLMProvider())

    monkeypatch.setattr(
        "film_agent_cli.main._build_recipe_service",
        lambda: service,
    )

    result = runner.invoke(
        app,
        [
            "recipe",
            "--film",
            "Ilford HP5 Plus",
            "--developer",
            "Rodinal",
            "--format",
            "120",
            "--iso",
            "400",
            "--dilution",
            "1+50",
        ],
    )
    assert result.exit_code == 0
    assert "Materials" in result.stdout
