import httpx
import pytest

from film_llm.providers.ollama import OllamaProvider


class TimeoutClient:
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def post(self, *_args, **_kwargs):
        raise httpx.ReadTimeout("timed out")


def test_ollama_timeout_error_message(monkeypatch):
    monkeypatch.setattr(httpx, "Client", lambda **_kwargs: TimeoutClient())

    provider = OllamaProvider(base_url="http://ollama:11434", model="llama3.3:70b", timeout=120)

    with pytest.raises(RuntimeError, match="timed out after 120s"):
        provider.generate(system_message="sys", user_prompt="user")
