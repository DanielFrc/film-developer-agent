from film_llm.providers.base import LLMProvider, LLMResponse
from film_llm.providers.ollama import OllamaProvider
from film_llm.providers.openai_provider import OpenAIProvider
from film_llm.settings import LLM_PROVIDER


class MockLLMProvider:
    """Deterministic provider for tests."""

    provider_name = "mock"
    model_name = "mock-recipe-v1"

    def __init__(self, recipe_text: str | None = None) -> None:
        self._recipe_text = recipe_text or (
            "1. Materials: Developer, tank, thermometer.\n"
            "2. Prerequisites: Mix chemicals at 20C.\n"
            "10. General Precautions & Advice: Verify times independently."
        )

    def generate(self, *, system_message: str, user_prompt: str) -> LLMResponse:
        return LLMResponse(
            text=self._recipe_text,
            provider=self.provider_name,
            model=self.model_name,
        )


def get_llm_provider(provider: str | None = None) -> LLMProvider:
    selected = (provider or LLM_PROVIDER).lower()
    if selected == "ollama":
        return OllamaProvider()
    if selected == "openai":
        return OpenAIProvider()
    if selected == "mock":
        return MockLLMProvider()
    raise ValueError(f"Unsupported LLM provider: {selected}")
