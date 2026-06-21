from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from film_agent_api.cors import get_cors_origins
from film_agent_api.schemas import (
    DatasetStatsResponse,
    DevelopingTimeItem,
    ExplorerCatalogResponse,
    ExplorerDataResponse,
    ExplorerSchemaResponse,
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
from film_llm.source_hash import compute_source_hash

app = FastAPI(
    title="Film Developer Agent API",
    description="Query gold developing times and generate LLM recipes.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


def get_recipe_service() -> RecipeService:
    return RecipeService()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse()


@app.get("/stats", response_model=DatasetStatsResponse)
def get_dataset_stats() -> DatasetStatsResponse:
    try:
        with GoldStore() as store:
            films = len(store.fetch_all_films())
            developers = len(store.fetch_all_developers())
            combinations = store.connection.execute(
                "SELECT COUNT(*) FROM developing_times WHERE active = true"
            ).fetchone()[0]
    except GoldDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return DatasetStatsResponse(
        films=films,
        developers=developers,
        developing_time_combinations=combinations,
        source_hash=compute_source_hash(),
    )


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


VALID_EXPLORER_LAYERS = {"bronze", "silver", "gold"}
VALID_EXPLORER_CATALOGS = {"films", "developers"}


@app.get("/explorer/catalog", response_model=ExplorerCatalogResponse)
def get_explorer_catalog(
    catalog: str = Query(..., description="films or developers"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    q: str | None = Query(None),
) -> ExplorerCatalogResponse:
    from film_core.query.catalog import query_catalog
    from film_core.query.explorer import ExplorerDataNotFoundError

    if catalog not in VALID_EXPLORER_CATALOGS:
        raise HTTPException(status_code=400, detail=f"Invalid catalog: {catalog}")

    try:
        payload = query_catalog(catalog, page=page, page_size=page_size, q=q)
    except ExplorerDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ExplorerCatalogResponse(**payload)


@app.get("/explorer/schema", response_model=ExplorerSchemaResponse)
def get_explorer_schema(
    layer: str = Query(..., description="bronze, silver, or gold"),
) -> ExplorerSchemaResponse:
    from film_core.query.explorer import ExplorerDataNotFoundError, get_layer_schema

    if layer not in VALID_EXPLORER_LAYERS:
        raise HTTPException(status_code=400, detail=f"Invalid layer: {layer}")

    try:
        columns = get_layer_schema(layer)
    except ExplorerDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ExplorerSchemaResponse(layer=layer, columns=columns)


@app.get("/explorer/data", response_model=ExplorerDataResponse)
def get_explorer_data(
    layer: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    film: str | None = Query(None),
    developer: str | None = Query(None),
    iso: str | None = Query(None),
    source: str | None = Query(None, description="Filter by source column when present"),
) -> ExplorerDataResponse:
    from film_core.query.explorer import ExplorerDataNotFoundError, query_layer

    if layer not in VALID_EXPLORER_LAYERS:
        raise HTTPException(status_code=400, detail=f"Invalid layer: {layer}")

    try:
        payload = query_layer(
            layer,
            page=page,
            page_size=page_size,
            film=film,
            developer=developer,
            iso=iso,
            source=source,
        )
    except ExplorerDataNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return ExplorerDataResponse(**payload)


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
