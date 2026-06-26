from dataclasses import dataclass
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from film_llm.languages import response_language_instruction
from film_llm.settings import (
    MAX_EXTRA_CONTEXT_LENGTH,
    PROMPT_TEMPLATE,
    SESSION_SUMMARY_TEMPLATE,
    TEMPLATES_DIR,
)


def normalize_extra_context(value: str | None) -> str | None:
    """Normalize optional photographer preferences for prompt and cache keys."""
    if value is None:
        return None

    normalized = " ".join(value.strip().split()).lower()
    if not normalized:
        return None
    if len(normalized) > MAX_EXTRA_CONTEXT_LENGTH:
        raise ValueError(
            f"extra_context exceeds {MAX_EXTRA_CONTEXT_LENGTH} characters."
        )
    return normalized


@dataclass(frozen=True)
class PromptContext:
    film: str
    developer: str
    format: str
    iso: str
    base_time: str
    temperature: str
    dilution: str
    notes: str | None = None
    extra_context: str | None = None
    developer_volume: str = "500ml"
    language: str = "en"


@dataclass(frozen=True)
class SessionSummaryContext:
    film: str
    developer: str
    format: str
    iso: str
    chart_time: str
    dilution: str
    working_time: str | None = None
    temperature: str | None = None
    output_goal: str | None = None
    developer_prep: str | None = None
    stop_bath: str | None = None
    agitation: str | None = None
    presoak: str | None = None
    chart_notes: str | None = None
    journal_context: str | None = None
    language: str = "en"


def _jinja_env() -> Environment:
    return Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(enabled_extensions=()),
        trim_blocks=True,
        lstrip_blocks=True,
    )


def render_recipe_prompt(context: PromptContext) -> str:
    template = _jinja_env().get_template(PROMPT_TEMPLATE)
    return template.render(
        film=context.film,
        developer=context.developer,
        format=context.format,
        iso=context.iso,
        base_time=context.base_time,
        temperature=context.temperature or "20",
        dilution=context.dilution or "stock",
        notes=context.notes,
        extra_context=context.extra_context,
        developer_volume=context.developer_volume,
        response_language_instruction=response_language_instruction(context.language),
    )


def render_session_summary_prompt(context: SessionSummaryContext) -> str:
    template = _jinja_env().get_template(SESSION_SUMMARY_TEMPLATE)
    return template.render(
        film=context.film,
        developer=context.developer,
        format=context.format,
        iso=context.iso,
        chart_time=context.chart_time,
        working_time=context.working_time,
        temperature=context.temperature,
        dilution=context.dilution or "stock",
        output_goal=context.output_goal,
        developer_prep=context.developer_prep,
        stop_bath=context.stop_bath,
        agitation=context.agitation,
        presoak=context.presoak,
        chart_notes=context.chart_notes,
        journal_context=context.journal_context,
        response_language_instruction=response_language_instruction(context.language),
    )


def prompt_template_path() -> Path:
    return TEMPLATES_DIR / PROMPT_TEMPLATE
