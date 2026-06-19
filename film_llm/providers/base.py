from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class LLMResponse:
    text: str
    provider: str
    model: str


class LLMProvider(Protocol):
    provider_name: str
    model_name: str

    def generate(self, *, system_message: str, user_prompt: str) -> LLMResponse: ...
