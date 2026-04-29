#!/bin/bash

# SafeWatch AI - Project Runner Script
# Digunakan untuk menjalankan Backend dan Frontend secara bersamaan.

# Warna untuk output terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       SAFEWATCH AI - STARTING...      ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Fungsi untuk membersihkan proses saat script dihentikan
cleanup() {
    echo -e "\n${RED}Menutup semua layanan...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 1. Menjalankan Backend (FastAPI)
echo -e "${GREEN}[1/2] Menjalankan Backend FastAPI...${NC}"
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo -e "${RED}Error: Virtual environment (.venv) tidak ditemukan!${NC}"
    exit 1
fi

# Jalankan uvicorn di background
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# Tunggu sebentar agar backend siap
sleep 2

# 2. Menjalankan Frontend (Vite)
echo -e "${GREEN}[2/2] Menjalankan Frontend React (Vite)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}Layanan sudah berjalan!${NC}"
echo -e "${BLUE}Backend  : http://localhost:8000${NC}"
echo -e "${BLUE}Frontend : http://localhost:5174${NC}"
echo -e "${BLUE}Tekan CTRL+C untuk menghentikan semua layanan.${NC}"
echo -e "${BLUE}=======================================${NC}"

# Menjaga script tetap berjalan agar bisa menangkap CTRL+C
wait
