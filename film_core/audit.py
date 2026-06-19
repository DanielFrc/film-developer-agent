import pandas as pd


def add_audit_information(df: pd.DataFrame) -> pd.DataFrame:
    """Add id, created_at, updated_at, and active columns."""
    now = pd.Timestamp.now()
    df = df.copy()
    df["id"] = range(1, len(df) + 1)
    df["created_at"] = now
    df["updated_at"] = now
    df["active"] = True
    return df
