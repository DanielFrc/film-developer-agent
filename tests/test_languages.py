import pytest

from film_llm.languages import normalize_language, response_language_instruction


def test_normalize_language_accepts_es_and_locale():
    assert normalize_language("es") == "es"
    assert normalize_language("es-MX") == "es"
    assert normalize_language(None) == "en"
    assert normalize_language("") == "en"


def test_normalize_language_rejects_unknown():
    with pytest.raises(ValueError, match="Unsupported language"):
        normalize_language("fr")


def test_response_language_instruction_spanish():
    instruction = response_language_instruction("es")
    assert "Spanish" in instruction
    assert "revelador" in instruction
