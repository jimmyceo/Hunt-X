FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create uploads directory for SQLite and file storage
RUN mkdir -p /app/uploads/pdfs && chmod -R 777 /app/uploads

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY backend/ .

# Railway sets PORT dynamically - must listen on it
# Use shell form so $PORT is expanded at runtime
ENV PYTHONUNBUFFERED=1

# Make start.sh executable and use it (handles DB init + dynamic PORT)
RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
