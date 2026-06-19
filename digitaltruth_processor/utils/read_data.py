def read_data_from_file(file_path, file_type="json"):
    switch_case = {
        "json": _read_data_from_json,
        "parquet": _read_data_from_parquet,
        "csv": _read_data_from_csv,
    }

    if file_type in switch_case:
        return switch_case[file_type](file_path)
    raise ValueError("Unsupported file type. Use 'json', 'parquet', or 'csv'.")


def read_raw_json(file_path):
    import json

    with open(file_path) as f:
        return json.load(f)


def _read_data_from_json(file_path):
    import pandas as pd

    return pd.DataFrame(read_raw_json(file_path))


def _read_data_from_parquet(file_path):
    import pandas as pd

    return pd.read_parquet(file_path, engine="pyarrow")


def _read_data_from_csv(file_path):
    import pandas as pd

    return pd.read_csv(file_path)
