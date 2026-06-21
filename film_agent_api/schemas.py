from typing import Any

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"


class DatasetStatsResponse(BaseModel):
    films: int
    developers: int
    developing_time_combinations: int
    source: str = "DigitalTruth"
    source_hash: str | None = None


class SearchResultItem(BaseModel):
    name: str
    value: str | None = None
    score: float


class FormatItem(BaseModel):
    format: str
    description: str | None = None


class DevelopingTimeItem(BaseModel):
    film: str
    developer: str
    format: str
    iso: str
    dilution: str | None = None
    dev_time: str
    temp: str | None = None
    notes: str | None = None
    film_id: int | None = None
    developer_id: int | None = None
    format_id: int | None = None


class RecipeLookupItem(BaseModel):
    film: str
    developer: str
    format: str
    iso: str
    dilution: str
    base_time: str
    temperature: str | None = None
    notes: str | None = None


class RecipeRequest(BaseModel):
    film: str
    developer: str
    format: str
    iso: str
    dilution: str | None = None
    extra_context: str | None = None
    force_regenerate: bool = False


class RecipeResponse(BaseModel):
    recipe: str
    cached: bool
    cache_key: str
    source: str
    source_hash: str
    disclaimer: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    lookup: RecipeLookupItem
    extra_context: str | None = None


class ErrorResponse(BaseModel):
    detail: str


class ExplorerColumnSchema(BaseModel):
    name: str
    type: str


class ExplorerSchemaResponse(BaseModel):
    layer: str
    columns: list[ExplorerColumnSchema]


class ExplorerDataResponse(BaseModel):
    layer: str
    rows: list[dict[str, Any]]
    total: int
    page: int
    page_size: int
    columns: list[str]
    source_filter_applied: bool = False


class ExplorerCatalogResponse(BaseModel):
    catalog: str
    rows: list[dict[str, Any]]
    total: int
    page: int
    page_size: int
    columns: list[str]
