import pandas as pd


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
