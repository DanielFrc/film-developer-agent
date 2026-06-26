import json
from pathlib import Path
from typing import Annotated

import typer

from digitaltruth_normalizer.normalizer_job import run_normalizer
from digitaltruth_processor.processor_job import run_processor
from digitaltruth_scrapper.digitaltruth_scrapper_job import run_scrapper
from film_core.pipeline import run_pipeline
from film_core.query import (
    GoldStore,
    lookup_developing_times,
    search_developers,
    search_films,
)
from film_core.query.gold_store import GoldDataNotFoundError
from film_llm.providers import get_llm_provider
from film_llm.service import RecipeAmbiguousError, RecipeLookupError, RecipeService

app = typer.Typer(
    name="film-agent",
    help="Film development data pipeline and query tool.",
    no_args_is_help=True,
)
films_app = typer.Typer(help="Search film stocks in the gold dataset.")
developers_app = typer.Typer(help="Search developers in the gold dataset.")
times_app = typer.Typer(help="Look up developing times from the gold dataset.")
app.add_typer(films_app, name="films")
app.add_typer(developers_app, name="developers")
app.add_typer(times_app, name="times")


def _print_json(data: object) -> None:
    typer.echo(json.dumps(data, indent=2, default=str))


@app.command()
def scrape() -> None:
    """Run the DigitalTruth scraper (bronze JSON)."""
    run_scrapper()
    typer.echo("Scrape complete.")


@app.command()
def process() -> None:
    """Run the silver processor (bronze JSON -> processed parquet)."""
    run_processor()
    typer.echo("Process complete.")


@app.command()
def normalize() -> None:
    """Run the gold normalizer (silver -> normalized parquet)."""
    run_normalizer()
    typer.echo("Normalize complete.")


@app.command()
def pipeline(
    skip_scrape: Annotated[
        bool, typer.Option("--skip-scrape", help="Skip scraper stage.")
    ] = False,
) -> None:
    """Run scrape -> process -> normalize with a pipeline manifest."""
    run_pipeline(
        run_scrape=not skip_scrape,
        run_process=True,
        run_normalize=True,
    )
    typer.echo("Pipeline complete.")


@films_app.command("search")
def films_search(
    query: Annotated[str, typer.Argument(help="Film name to search for.")],
    limit: Annotated[int, typer.Option("--limit", "-n")] = 10,
    as_json: Annotated[bool, typer.Option("--json")] = False,
) -> None:
    """Fuzzy-search films in the gold dataset."""
    try:
        with GoldStore() as store:
            results = search_films(store, query, limit=limit)
    except GoldDataNotFoundError as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc

    if as_json:
        _print_json([result.__dict__ for result in results])
        return

    if not results:
        typer.echo("No matches found.")
        raise typer.Exit(code=1)

    for result in results:
        value = f" ({result.value})" if result.value else ""
        typer.echo(f"{result.score:5.1f}  {result.name}{value}")


@developers_app.command("search")
def developers_search(
    query: Annotated[str, typer.Argument(help="Developer name to search for.")],
    limit: Annotated[int, typer.Option("--limit", "-n")] = 10,
    as_json: Annotated[bool, typer.Option("--json")] = False,
) -> None:
    """Fuzzy-search developers in the gold dataset."""
    try:
        with GoldStore() as store:
            results = search_developers(store, query, limit=limit)
    except GoldDataNotFoundError as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc

    if as_json:
        _print_json([result.__dict__ for result in results])
        return

    if not results:
        typer.echo("No matches found.")
        raise typer.Exit(code=1)

    for result in results:
        value = f" ({result.value})" if result.value else ""
        typer.echo(f"{result.score:5.1f}  {result.name}{value}")


@times_app.command("lookup")
def times_lookup(
    film: Annotated[str, typer.Option("--film", "-f", help="Film name.")],
    developer: Annotated[str, typer.Option("--developer", "-d", help="Developer.")],
    format: Annotated[str, typer.Option("--format", "-m", help="Format (35mm, 120, sheet).")],
    iso: Annotated[str, typer.Option("--iso", "-i", help="ISO / EI rating.")],
    dilution: Annotated[
        str | None, typer.Option("--dilution", help="Optional dilution filter.")
    ] = None,
    as_json: Annotated[bool, typer.Option("--json")] = False,
) -> None:
    """Look up developing time(s) for a film/developer/format/iso combination."""
    try:
        with GoldStore() as store:
            matches = lookup_developing_times(
                store,
                film=film,
                developer=developer,
                format=format,
                iso=iso,
                dilution=dilution,
            )
    except GoldDataNotFoundError as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc

    if not matches:
        typer.echo("No developing time found for that combination.", err=True)
        raise typer.Exit(code=1)

    if as_json:
        _print_json([match.to_dict() for match in matches])
        return

    for match in matches:
        dilution_text = match.dilution or "n/a"
        temp_text = match.temp or "n/a"
        typer.echo(
            f"{match.film} + {match.developer} | {match.format} | ISO {match.iso} | "
            f"dilution {dilution_text} | {match.dev_time} min @ {temp_text}C"
        )
        if match.notes:
            typer.echo(f"  notes: {match.notes}")


def _build_recipe_service() -> RecipeService:
    return RecipeService(llm_provider=get_llm_provider())


@app.command("recipe")
def recipe(
    film: Annotated[str, typer.Option("--film", "-f", help="Film name.")],
    developer: Annotated[str, typer.Option("--developer", "-d", help="Developer.")],
    format: Annotated[str, typer.Option("--format", "-m", help="Format (35mm, 120, sheet).")],
    iso: Annotated[str, typer.Option("--iso", "-i", help="ISO / EI rating.")],
    dilution: Annotated[
        str | None, typer.Option("--dilution", help="Optional dilution filter.")
    ] = None,
    extra_context: Annotated[
        str | None,
        typer.Option(
            "--extra-context",
            "-e",
            help="Photographer preferences (e.g. stand development, grainy look, push film).",
        ),
    ] = None,
    force: Annotated[
        bool, typer.Option("--force", help="Bypass recipe cache and call the LLM.")
    ] = False,
    language: Annotated[
        str | None,
        typer.Option(
            "--language",
            "--lang",
            "-l",
            help="Recipe language code (en, es). Defaults to RECIPE_LANGUAGE env.",
        ),
    ] = None,
    output: Annotated[
        Path | None, typer.Option("--output", "-o", help="Write recipe markdown to file.")
    ] = None,
    as_json: Annotated[bool, typer.Option("--json")] = False,
) -> None:
    """Generate a development recipe from gold lookup data and an LLM."""
    service = _build_recipe_service()
    try:
        result = service.generate(
            film=film,
            developer=developer,
            format=format,
            iso=iso,
            dilution=dilution,
            extra_context=extra_context,
            language=language,
            force_regenerate=force,
        )
    except (RecipeLookupError, RecipeAmbiguousError, ValueError, RuntimeError) as exc:
        typer.echo(str(exc), err=True)
        raise typer.Exit(code=1) from exc

    if as_json:
        _print_json(result.to_dict())
        return

    if output:
        output.write_text(result.recipe, encoding="utf-8")
        typer.echo(f"Recipe written to {output} (cached={result.cached}).")
        return

    typer.echo(result.recipe)
    typer.echo(f"\n[cached={result.cached} | source={result.source} | key={result.cache_key}]")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
