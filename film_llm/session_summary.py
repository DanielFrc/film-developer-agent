from dataclasses import dataclass

from film_llm.languages import normalize_language
from film_llm.prompt import SessionSummaryContext, render_session_summary_prompt
from film_llm.providers import LLMProvider, get_llm_provider
from film_llm.settings import (
    DISCLAIMER,
    RECIPE_LANGUAGE,
    SESSION_SUMMARY_MAX_TOKENS,
    SESSION_SUMMARY_PROMPT_VERSION,
    SESSION_SUMMARY_SYSTEM_MESSAGE,
)


@dataclass(frozen=True)
class SessionSummaryResult:
    summary: str
    prompt_version: str
    llm_provider: str
    llm_model: str
    disclaimer: str
    language: str


class SessionSummaryService:
    def __init__(self, *, llm_provider: LLMProvider | None = None) -> None:
        self._llm = llm_provider or get_llm_provider()

    def generate(
        self,
        *,
        context: SessionSummaryContext,
        language: str | None = None,
    ) -> SessionSummaryResult:
        resolved_language = normalize_language(language or context.language, default=RECIPE_LANGUAGE)
        prompt_context = SessionSummaryContext(
            film=context.film,
            developer=context.developer,
            format=context.format,
            iso=context.iso,
            chart_time=context.chart_time,
            dilution=context.dilution,
            working_time=context.working_time,
            temperature=context.temperature,
            output_goal=context.output_goal,
            developer_prep=context.developer_prep,
            stop_bath=context.stop_bath,
            agitation=context.agitation,
            presoak=context.presoak,
            chart_notes=context.chart_notes,
            journal_context=context.journal_context,
            language=resolved_language,
        )
        prompt = render_session_summary_prompt(prompt_context)
        llm_response = self._llm.generate(
            system_message=SESSION_SUMMARY_SYSTEM_MESSAGE,
            user_prompt=prompt,
            max_tokens=SESSION_SUMMARY_MAX_TOKENS,
        )
        summary = llm_response.text.strip()
        if not summary:
            raise RuntimeError("LLM returned an empty session summary.")

        return SessionSummaryResult(
            summary=summary,
            prompt_version=SESSION_SUMMARY_PROMPT_VERSION,
            llm_provider=llm_response.provider,
            llm_model=llm_response.model,
            disclaimer=DISCLAIMER,
            language=resolved_language,
        )
