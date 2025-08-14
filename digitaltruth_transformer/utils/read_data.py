def read_data_from_file(file_path, file_type="json"):
    """
    Reads data from a specified file and returns it as a pandas DataFrame.

    Args:
        file_path (str): The path to the file to be read.
        file_type (str): The type of the file ('json', 'parquet', 'csv').

    Returns:
        pd.DataFrame: The data read from the file.
    """

    switch_case = {
        "json": _read_data_from_json,
        "parquet": _read_data_from_parquet,
        "csv": _read_data_from_csv,
    }

    if file_type in switch_case:
        return switch_case[file_type](file_path)
    else:
        raise ValueError("Unsupported file type. Use 'json', 'parquet', or 'csv'.")


def read_raw_json(file_path):
    import json

    with open(file_path) as f:
        data = json.load(f)

    return data


def _read_data_from_json(file_path):
    """
    Reads data from a JSON file and returns it as a pandas DataFrame.

    Args:
        file_path (str): The path to the JSON file to be read.

    Returns:
        pd.DataFrame: The data read from the file.
    """

    import pandas as pd

    data = read_raw_json(file_path)

    df = pd.DataFrame(data)

    return df


def _read_data_from_parquet(file_path):
    """
    Reads data from a Parquet file and returns it as a pandas DataFrame.

    Args:
        file_path (str): The path to the Parquet file to be read.

    Returns:
        pd.DataFrame: The data read from the file.
    """
    import pandas as pd

    df = pd.read_parquet(file_path, engine="pyarrow")

    return df


def _read_data_from_csv(file_path):
    """
    Reads data from a CSV file and returns it as a pandas DataFrame.

    Args:
        file_path (str): The path to the CSV file to be read.

    Returns:
        pd.DataFrame: The data read from the file.
    """
    import pandas as pd

    df = pd.read_csv(file_path)

    return df
