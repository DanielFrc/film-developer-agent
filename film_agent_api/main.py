from fastapi import Depends, FastAPI, HTTPException, Query

from film_agent_api.schemas import (
    DevelopingTimeItem,
    FormatItem,
    HealthResponse,
    RecipeLookupItem,
    RecipeRequest,
    RecipeResponse,
    SearchResultItem,
)
from film_core.query import (
    GoldStore,
    lookup_developing_times,
    search_developers,
    search_films,
)
from film_core.query.gold_store import GoldDataNotFoundError
from film_llm.service import RecipeAmbiguousError, RecipeLookupError, RecipeService

app = FastAPI(
    title="Film Developer Agent API",
    description="Query gold developing times and generate LLM recipes.",
    version="0.1.0",
)


def get_recipe_service() -> RecipeService:
    return RecipeService()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.get("/films", response_model=list[SearchResultItem])
def list_films(
    q: str = Query(..., min_length=1, description="Film search query."),
    limit: int = Query(10, ge=1, le=50),
) -> list[SearchResultItem]:
    try:
        with GoldStore() as store:
            results = search_films(store, q, limit=limit)
    except GoldDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return [
        SearchResultItem(name=result.name, value=result.value, score=result.score)
        for result in results
    ]


@app.get("/developers", response_model=list[SearchResultItem])
def list_developers(
    q: str = Query(..., min_length=1, description="Developer search query."),
    limit: int = Query(10, ge=1, le=50),
) -> list[SearchResultItem]:
    try:
        with GoldStore() as store:
            results = search_developers(store, q, limit=limit)
    except GoldDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return [
        SearchResultItem(name=result.name, value=result.value, score=result.score)
        for result in results
    ]


@app.get("/formats", response_model=list[FormatItem])
def list_formats() -> list[FormatItem]:
    try:
        with GoldStore() as store:
            rows = store.fetch_all_formats()
    except GoldDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return [FormatItem(format=name, description=description) for name, description in rows]


@app.get("/developing-times", response_model=list[DevelopingTimeItem])
def get_developing_times(
    film: str = Query(...),
    developer: str = Query(...),
    format: str = Query(...),
    iso: str = Query(...),
    dilution: str | None = Query(None),
) -> list[DevelopingTimeItem]:
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
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if not matches:
        raise HTTPException(
            status_code=404,
            detail="No developing time found for that combination.",
        )

    return [DevelopingTimeItem(**match.to_dict()) for match in matches]


@app.post("/recipes", response_model=RecipeResponse)
def create_recipe(
    request: RecipeRequest,
    service: RecipeService = Depends(get_recipe_service),
) -> RecipeResponse:
    try:
        result = service.generate(
            film=request.film,
            developer=request.developer,
            format=request.format,
            iso=request.iso,
            dilution=request.dilution,
            extra_context=request.extra_context,
            force_regenerate=request.force_regenerate,
        )
    except RecipeLookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except RecipeAmbiguousError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return RecipeResponse(
        recipe=result.recipe,
        cached=result.cached,
        cache_key=result.cache_key,
        source=result.source,
        source_hash=result.source_hash,
        disclaimer=result.disclaimer,
        prompt_version=result.prompt_version,
        llm_provider=result.llm_provider,
        llm_model=result.llm_model,
        lookup=RecipeLookupItem(**result.lookup.__dict__),
        extra_context=result.extra_context,
    )


def run() -> None:
    import uvicorn

    uvicorn.run("film_agent_api.main:app", host="0.0.0.0", port=8000, reload=False)
