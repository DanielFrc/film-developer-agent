from digitaltruth_scrapper.digitaltruth_scrapper_job import run_scrapper
from digitaltruth_transformer.digitaltruth_transformer_job import run_transformer

if __name__ == "__main__":
    run_scrapper()
    run_transformer()
