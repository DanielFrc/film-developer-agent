import re

import pandas as pd

_FOOTNOTE_REF_PATTERN = re.compile(r"^(\[[^\]]+\]\s*)+$")


def normalize_text(series: pd.Series) -> pd.Series:
    """Lowercase, strip, and ASCII-fold text values."""
    return (
        series.astype(str)
        .str.strip()
        .str.lower()
        .str.encode("ascii", "ignore")
        .str.decode("utf-8")
    )


def normalize_value(value: str) -> str:
    """Normalize a single string value (for CLI/API lookups)."""
    return normalize_text(pd.Series([value])).iloc[0]


def sanitize_notes(notes: str | None) -> str | None:
    """Drop empty values and DigitalTruth footnote reference codes (e.g. `[hcB][a09]`)."""
    if notes is None:
        return None
    text = notes.strip()
    if not text:
        return None
    if _FOOTNOTE_REF_PATTERN.match(text):
        return None
    return text
