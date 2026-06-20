from openai import OpenAI

from film_llm.providers.base import LLMResponse
from film_llm.settings import OPENAI_API_KEY, OPENAI_MODEL


class OpenAIProvider:
    provider_name = "openai"
    model_name: str

    def __init__(self, *, api_key: str = OPENAI_API_KEY, model: str = OPENAI_MODEL) -> None:
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai.")
        self._client = OpenAI(api_key=api_key)
        self.model_name = model

    def generate(self, *, system_message: str, user_prompt: str) -> LLMResponse:
        try:
            response = self._client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
            )
        except Exception as exc:
            raise RuntimeError(
                f"OpenAI request failed. Check OPENAI_API_KEY and OPENAI_MODEL ({self.model_name})."
            ) from exc

        content = (response.choices[0].message.content or "").strip()
        if not content:
            raise RuntimeError("OpenAI returned an empty recipe response.")

        return LLMResponse(text=content, provider=self.provider_name, model=self.model_name)
