import httpx

from film_llm.providers.base import LLMResponse
from film_llm.settings import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT


class OllamaProvider:
    provider_name = "ollama"
    model_name: str

    def __init__(
        self,
        *,
        base_url: str = OLLAMA_BASE_URL,
        model: str = OLLAMA_MODEL,
        timeout: float = OLLAMA_TIMEOUT,
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
        timeout = httpx.Timeout(self._timeout, connect=10.0)
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.post(f"{self._base_url}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException as exc:
            raise RuntimeError(
                f"Ollama request timed out after {self._timeout:g}s. "
                f"Large models like {self.model_name} may need a higher OLLAMA_TIMEOUT."
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise RuntimeError(
                f"Ollama request failed ({exc.response.status_code}). "
                f"Check OLLAMA_BASE_URL ({self._base_url}) and OLLAMA_MODEL ({self.model_name})."
            ) from exc
        except httpx.RequestError as exc:
            raise RuntimeError(
                f"Cannot reach Ollama at {self._base_url}. "
                "Ensure Ollama is running and reachable from the API host."
            ) from exc

        content = data.get("message", {}).get("content", "").strip()
        if not content:
            raise RuntimeError("Ollama returned an empty recipe response.")

        return LLMResponse(text=content, provider=self.provider_name, model=self.model_name)
