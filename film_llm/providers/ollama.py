import httpx

from film_llm.providers.base import LLMResponse
from film_llm.settings import OLLAMA_BASE_URL, OLLAMA_MODEL


class OllamaProvider:
    provider_name = "ollama"
    model_name: str

    def __init__(
        self,
        *,
        base_url: str = OLLAMA_BASE_URL,
        model: str = OLLAMA_MODEL,
        timeout: float = 120.0,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self.model_name = model
        self._timeout = timeout

    def generate(self, *, system_message: str, user_prompt: str) -> LLMResponse:
        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
        }
        with httpx.Client(timeout=self._timeout) as client:
            response = client.post(f"{self._base_url}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()

        content = data.get("message", {}).get("content", "").strip()
        if not content:
            raise RuntimeError("Ollama returned an empty recipe response.")

        return LLMResponse(text=content, provider=self.provider_name, model=self.model_name)
