from film_llm import settings


def test_llm_generation_defaults():
    assert settings.LLM_TEMPERATURE == 0.3
    assert settings.LLM_MAX_TOKENS == 1200


def test_llm_generation_env_override(monkeypatch):
    monkeypatch.setenv("LLM_TEMPERATURE", "0.5")
    monkeypatch.setenv("LLM_MAX_TOKENS", "800")

    from importlib import reload

    reload(settings)

    assert settings.LLM_TEMPERATURE == 0.5
    assert settings.LLM_MAX_TOKENS == 800

    reload(settings)
