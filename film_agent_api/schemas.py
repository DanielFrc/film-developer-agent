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
    schema_version: str = "1"
    pipeline_run_id: str | None = None
    pipeline_started_at: str | None = None
    pipeline_finished_at: str | None = None
    pipeline_status: str | None = None


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
    language: str | None = None


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
    language: str = "en"


class SessionSummaryRequest(BaseModel):
    film: str
    developer: str
    format: str
    iso: str
    dilution: str | None = None
    chart_time: str
    working_time: str | None = None
    temperature: str | None = None
    output_goal: str | None = None
    developer_prep: str | None = None
    stop_bath: str | None = None
    agitation: str | None = None
    presoak: str | None = None
    chart_notes: str | None = None
    journal_context: str | None = None
    language: str | None = None


class SessionSummaryResponse(BaseModel):
    summary: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    disclaimer: str
    language: str = "en"


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
