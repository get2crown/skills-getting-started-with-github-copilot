FROM python:3.13-slim

WORKDIR /app

# Create Python virtual environment
RUN python3 -m venv /venv

# Install dependencies in the venv
COPY requirements.txt .
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy source code and config
COPY src/ src/
COPY pytest.ini ./

EXPOSE 8000

# Run FastAPI app using venv's Python
CMD ["/venv/bin/uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "8000"]