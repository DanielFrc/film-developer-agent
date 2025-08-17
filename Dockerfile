# Start with a slim Python base image
FROM python:3.13-slim

# Set a non-root user and group for security
RUN groupadd -r appgroup && useradd --no-log-init -r -g appgroup -u 1000 appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies. This is cached as a layer.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create and set permissions for the data directory
RUN mkdir -p /data/raw && chown -R appuser:appgroup /data

# Copy application code and other data
COPY . .

# Set correct ownership for application and data directories
# This must be done after all files are copied
RUN chown -R appuser:appgroup /app
RUN chown -R appuser:appgroup /data

# Switch to the non-root user
USER appuser

# Set environment variables
ENV DATA_PATH=/data
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Run the application
CMD ["python", "entrypoint.py"]
