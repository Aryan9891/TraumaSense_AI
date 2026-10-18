FROM python:3.11-slim

# Prevent Python from writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system audio, DSP, and compilation dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code into container
COPY . .

# Ensure upload directory for audio persists safely
RUN mkdir -p /app/uploads/audio

# Expose FastAPI backend port
EXPOSE 8000

# Container Healthcheck targeting FastAPI health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=4)" || exit 1

# Initialize tables, seed default demo data, and launch FastAPI server
CMD ["sh", "-c", "python -m app.init_db && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
