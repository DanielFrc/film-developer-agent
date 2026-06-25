from film_llm.prompt import SessionSummaryContext, render_session_summary_prompt
from film_llm.providers import MockLLMProvider
from film_llm.session_summary import SessionSummaryService


def test_render_session_summary_prompt_includes_journal():
    prompt = render_session_summary_prompt(
        SessionSummaryContext(
            film="Ilford HP5 Plus",
            developer="D-76",
            format="120",
            iso="400",
            chart_time="9.5",
            dilution="stock",
            journal_context="Recent results: density dense, grain heavy",
        )
    )
    assert "Ilford HP5 Plus" in prompt
    assert "9.5 minutes" in prompt
    assert "density dense" in prompt
    assert "step-by-step development recipe" in prompt.lower()


def test_session_summary_prompt_spanish():
    from film_llm.prompt import SessionSummaryContext, render_session_summary_prompt

    prompt = render_session_summary_prompt(
        SessionSummaryContext(
            film="Ilford HP5 Plus",
            developer="D-76",
            format="120",
            iso="400",
            chart_time="9.5",
            dilution="stock",
            language="es",
        )
    )
    assert "Spanish" in prompt


def test_session_summary_service_returns_markdown():
    service = SessionSummaryService(llm_provider=MockLLMProvider())
    result = service.generate(
        context=SessionSummaryContext(
            film="Ilford HP5 Plus",
            developer="D-76",
            format="120",
            iso="400",
            chart_time="9.5",
            dilution="stock",
        )
    )
    assert "Session at a glance" in result.summary
    assert result.prompt_version == "2"
    assert result.llm_provider == "mock"
