import os
from pathlib import Path

PROMPT_VERSION = os.getenv("PROMPT_VERSION", "2")
RECIPE_LANGUAGE = os.getenv("RECIPE_LANGUAGE", "en")
DISCLAIMER = "Verify all times independently before developing film."
DATA_SOURCE = "DigitalTruth"
MAX_EXTRA_CONTEXT_LENGTH = int(os.getenv("MAX_EXTRA_CONTEXT_LENGTH", "500"))

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1:8b")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"
PROMPT_TEMPLATE = "recipe_prompt.j2"

SYSTEM_MESSAGE = (
    "You are a black-and-white film development assistant. "
    "Use only the developing time and parameters provided in the user prompt. "
    "Never invent or change the base developing time. "
    "If the user requests push/pull or a different ISO, explain implications but do not "
    "calculate a new time — recommend looking up the correct combination instead. "
    "Photographer preferences may change agitation, stand-development advice, and tone, "
    "but not the base developing time. "
    "Prioritize lab safety in every step."
)
