FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /service

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy the application
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /service/logs && \
    chown -R 1000:1000 /service && \
    chmod 755 /service/logs

EXPOSE 8000

# Default command
CMD ["gunicorn", "service.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]