import json

from typer.testing import CliRunner

from film_agent_cli.main import app

runner = CliRunner()


def test_cli_films_search(gold_dataset):
    result = runner.invoke(app, ["films", "search", "hp5", "--json"])
    assert result.exit_code == 0

    payload = json.loads(result.stdout)
    assert payload[0]["name"] == "ilford hp5 plus"


def test_cli_developers_search(gold_dataset):
    result = runner.invoke(app, ["developers", "search", "rodinal", "--json"])
    assert result.exit_code == 0

    payload = json.loads(result.stdout)
    assert payload[0]["name"] == "rodinal"


def test_cli_times_lookup(gold_dataset):
    result = runner.invoke(
        app,
        [
            "times",
            "lookup",
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
            "--json",
        ],
    )
    assert result.exit_code == 0

    payload = json.loads(result.stdout)
    assert len(payload) == 1
    assert payload[0]["dev_time"] == "12"
    assert payload[0]["dilution"] == "1+50"


def test_cli_times_lookup_no_match(gold_dataset):
    result = runner.invoke(
        app,
        [
            "times",
            "lookup",
            "--film",
            "ilford hp5 plus",
            "--developer",
            "rodinal",
            "--format",
            "120",
            "--iso",
            "800",
        ],
    )
    assert result.exit_code == 1
    assert "No developing time found" in result.stderr


def test_cli_missing_gold_data(isolated_data_dir):
    result = runner.invoke(app, ["films", "search", "hp5"])
    assert result.exit_code == 1
    assert "Gold dataset not found" in result.stderr
