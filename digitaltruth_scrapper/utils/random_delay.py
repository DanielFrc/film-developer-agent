import random
import time


def random_delay(min_seconds=1.5, max_seconds=4.0):
    """
    Introduces a random delay between min_seconds and max_seconds.
    This is useful to avoid overwhelming a server with requests.
    """
    delay = random.uniform(min_seconds, max_seconds)
    time.sleep(delay)
    return delay
