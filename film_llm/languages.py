SUPPORTED_LANGUAGES = ("en", "es")

LANGUAGE_LABELS: dict[str, str] = {
    "en": "English",
    "es": "Español",
}

_RESPONSE_INSTRUCTIONS: dict[str, str] = {
    "en": "Write the entire response in English.",
    "es": (
        "Write the entire response in Spanish (es). "
        "Use common darkroom terms (revelador, baño de paro, fijador, negativo)."
    ),
}


def normalize_language(value: str | None, *, default: str = "en") -> str:
    if value is None or not str(value).strip():
        return default if default in SUPPORTED_LANGUAGES else "en"

    code = str(value).strip().lower().replace("_", "-").split("-")[0]
    if code not in SUPPORTED_LANGUAGES:
        supported = ", ".join(SUPPORTED_LANGUAGES)
        raise ValueError(f"Unsupported language '{value}'. Supported: {supported}")
    return code


def response_language_instruction(language: str) -> str:
    code = normalize_language(language)
    return _RESPONSE_INSTRUCTIONS[code]
