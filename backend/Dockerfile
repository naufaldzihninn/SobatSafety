# Menggunakan base image Python 3.10 slim yang ringan
FROM python:3.10-slim

# Mencegah Python menulis file .pyc ke disk
ENV PYTHONDONTWRITEBYTECODE=1
# Mencegah Python melakukan buffering pada stdout dan stderr
ENV PYTHONUNBUFFERED=1
# Set timezone ke WIB (Asia/Jakarta)
ENV TZ=Asia/Jakarta

# Install system dependencies untuk OpenCV dan YOLO
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory di dalam container
WORKDIR /app

# Copy requirements dan install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode backend ke dalam container
COPY . .

# Buat folder uploads jika belum ada dan beri akses write (untuk SQLite dan cache YOLO)
RUN mkdir -p uploads && chmod -R 777 /app

# Expose port yang digunakan oleh Hugging Face Spaces (7860)
EXPOSE 7860

# Jalankan Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
