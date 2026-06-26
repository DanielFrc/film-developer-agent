from film_llm.prompt import PromptContext, render_recipe_prompt


def test_render_recipe_prompt_includes_lookup_values():
    prompt = render_recipe_prompt(
        PromptContext(
            film="ilford hp5 plus",
            developer="rodinal",
            format="120",
            iso="400",
            base_time="12",
            temperature="20",
            dilution="1+50",
            notes="Test note",
        )
    )

    assert "ilford hp5 plus" in prompt
    assert "rodinal" in prompt
    assert "12 minutes" in prompt
    assert "1+50" in prompt
    assert "Test note" in prompt
    assert "1.  Materials:" in prompt
    assert "10. General Precautions" in prompt


def test_render_recipe_prompt_includes_extra_context():
    prompt = render_recipe_prompt(
        PromptContext(
            film="ilford hp5 plus",
            developer="rodinal",
            format="120",
            iso="400",
            base_time="12",
            temperature="20",
            dilution="1+50",
            extra_context="stand development and grainy look",
        )
    )

    assert "Photographer preferences" in prompt
    assert "stand development and grainy look" in prompt
    assert "do not change base time" in prompt.lower()


def test_render_recipe_prompt_includes_language_instruction():
    prompt = render_recipe_prompt(
        PromptContext(
            film="ilford hp5 plus",
            developer="rodinal",
            format="120",
            iso="400",
            base_time="12",
            temperature="20",
            dilution="1+50",
            language="es",
        )
    )

    assert "Spanish" in prompt
    assert "revelador" in prompt


def test_normalize_extra_context_trims_and_lowercases():
    from film_llm.prompt import normalize_extra_context

    assert normalize_extra_context("  Stand Development  ") == "stand development"
    assert normalize_extra_context("   ") is None
    assert normalize_extra_context(None) is None
