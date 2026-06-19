from dataclasses import dataclass
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from film_llm.settings import MAX_EXTRA_CONTEXT_LENGTH, PROMPT_TEMPLATE, TEMPLATES_DIR


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


def render_recipe_prompt(context: PromptContext) -> str:
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(enabled_extensions=()),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = env.get_template(PROMPT_TEMPLATE)
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
    )


def prompt_template_path() -> Path:
    return TEMPLATES_DIR / PROMPT_TEMPLATE
