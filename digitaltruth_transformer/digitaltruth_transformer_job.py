
from digitaltruth_normalizer.normalizer_job import run_normalizer
from digitaltruth_processor.processor_job import run_processor


def run_transformer():
    """Backward-compatible alias: silver process + gold normalize."""
    run_processor()
    run_normalizer()


if __name__ == "__main__":
    run_transformer()
