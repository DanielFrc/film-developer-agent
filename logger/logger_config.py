import logging
import logging.config
import os


def setup_logging(config_file: str, log_file_path: str, log_name: str) -> None:
    """
    Sets up logging configuration from a specified config file.

    Args:
        config_file: Path to the logging configuration file.
    """
    if not os.path.exists(config_file):
        raise FileNotFoundError(f"Logging configuration file not found: {config_file}")

    if not os.path.exists(log_file_path):
        os.makedirs(log_file_path)

    logging.config.fileConfig(
        config_file, defaults={"logfilename": os.path.join(log_file_path, log_name)}
    )

    logger = logging.getLogger(__name__)
    logger.info("Logging is set up successfully.")
