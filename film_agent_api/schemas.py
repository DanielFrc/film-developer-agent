from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"


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
