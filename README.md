# 🛡️ SobatSafety - AI Workplace Safety Monitoring

![SobatSafety Banner](https://img.shields.io/badge/SobatSafety-AI_Vision-0ea5e9?style=for-the-badge&logo=dependabot) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Azure](https://img.shields.io/badge/Microsoft_Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white) ![YOLOv8](https://img.shields.io/badge/YOLOv8-FF1493?style=for-the-badge&logo=yolo)

**SobatSafety** adalah sistem deteksi cerdas berbasis Artificial Intelligence (Computer Vision) yang dirancang untuk meningkatkan keselamatan dan kepatuhan penggunaan Alat Pelindung Diri (APD) seperti Helm (Hardhat) dan Rompi Keselamatan (Vest) di area kerja berisiko tinggi.

Proyek ini mengusung pendekatan modern dengan implementasi penuh dari *Machine Learning*, integrasi *Cloud Services*, dan *Modern Web UI* untuk menciptakan lingkungan kerja yang lebih aman.

---

## ✨ Fitur Unggulan

1. **🤖 Real-time PPE Detection (YOLOv8)**
   Sistem mampu mendeteksi keberadaan pekerja dan mengevaluasi kelengkapan APD (Helm & Rompi) dalam hitungan milidetik, baik dari unggahan foto maupun *video stream*.

2. **📹 CCTV Alert Mode (Smart Logging)**
   Saat menganalisis video, sistem bertindak seperti CCTV pintar. Jika terjadi pelanggaran, sistem akan otomatis mengambil *screenshot* saat kejadian dan membuat log peringatan baru setiap 5 detik.

3. **☁️ Cloud Evidence Storage (Microsoft Azure)**
   Seluruh bukti foto pelanggaran (evidence) tidak disimpan di memori lokal, melainkan otomatis diunggah ke **Azure Blob Storage**. Memastikan data aman, terpusat, dan dapat diakses dari mana saja.

4. **📊 Interactive Dashboard & Analytics**
   Dashboard admin menampilkan statistik kepatuhan (Compliance Rate) secara *real-time*, tren pelanggaran selama 7 hari terakhir (menggunakan grafik interaktif), dan log kejadian terbaru.

5. **🔒 Secure Access & Reporting**
   Dilengkapi dengan sistem autentikasi (Login) untuk Supervisor, manajemen riwayat deteksi, dan fitur **Export CSV** untuk kebutuhan pelaporan mingguan ke manajemen.

---

## ⚙️ Cara Kerja & Alur Sistem (System Flow)

Sistem ini dirancang bukan sekadar untuk mendeteksi gambar, tetapi untuk bertindak sebagai *Virtual Safety Inspector* yang akurat. Berikut adalah alur kerjanya:

1. **Input & Inference**: Kamera menangkap gambar/video pekerja dan mengirimkannya ke Backend (FastAPI).
2. **Multi-Object Detection**: Model AI (YOLOv8) memindai frame dan mendeteksi beberapa objek sekaligus: **Person**, **Helmet**, dan **Vest**.
3. **Spatial Logic & Validation (IoU)**: 
   Sistem menggunakan kalkulasi **Intersection over Union (IoU)**. Helm yang tergeletak di meja di sebelah pekerja *tidak akan dihitung*. Helm/Rompi hanya dianggap "Dipakai" jika koordinat batas (*bounding box*) APD tersebut secara fisik tumpang-tindih (berpotongan) dengan koordinat tubuh sang pekerja (*Person*).
4. **CCTV Cooldown Mechanism**: 
   Jika seorang pekerja terdeteksi melanggar (misal: tidak memakai rompi), sistem memicu **Alert**. Agar database tidak meledak karena mencatat setiap frame (spam), sistem menerapkan *cooldown* **5 detik**. Pelanggaran baru hanya dicatat setelah masa jeda.
5. **Cloud Persistence**: 
   Setiap kali *Alert* dipicu, sistem mengambil *Screenshot* kejadian tersebut dan secara otomatis mengunggahnya ke server **Microsoft Azure Blob Storage**. URL dari Azure tersebut kemudian disimpan ke Database bersama riwayat waktu dan jenis pelanggaran untuk keperluan audit di Dashboard.

---

## 🛠️ Tech Stack

**Frontend (Client):**
*   **React + Vite**: Framework utama untuk performa tinggi.
*   **Tailwind CSS**: Styling modern dan responsif.
*   **Framer Motion**: Animasi UI yang mulus (*micro-interactions*).
*   **Recharts**: Visualisasi data grafik tren.
*   **Lucide React**: Ikon SVG berkualitas tinggi.

**Backend (Server & AI):**
*   **FastAPI**: Framework Python yang sangat cepat untuk REST API.
*   **Ultralytics YOLOv8**: Model *state-of-the-art* untuk deteksi objek.
*   **OpenCV**: Manipulasi dan pemrosesan frame video.
*   **SQLAlchemy + SQLite**: Manajemen database relasional untuk menyimpan riwayat.
*   **Azure Storage Blob**: SDK Python untuk integrasi cloud storage.

---

## 🚀 Cara Menjalankan Project (Local Setup)

### Prasyarat
*   Python 3.9+
*   Node.js 18+
*   Akun Microsoft Azure (Untuk Blob Storage)

### 1. Clone Repository
```bash
git clone https://github.com/USERNAME/safewatch-ai.git
cd safewatch-ai
```

### 2. Setup Backend (Python)
Buka terminal dan jalankan perintah berikut:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Untuk Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Buat file `.env` di dalam folder `backend/` dan isi dengan kredensial Azure Anda:
```env
AZURE_STORAGE_CONNECTION_STRING="Endpoint=..."
AZURE_CONTAINER_NAME="evidences"
DATABASE_URL="sqlite:///./safewatch.db"
UPLOAD_DIR="./uploads"
```

### 3. Setup Frontend (React)
Buka tab terminal baru:
```bash
cd frontend
npm install
```

### 4. Jalankan Aplikasi
Terdapat *script* otomatis untuk menjalankan Frontend dan Backend secara bersamaan (khusus Linux/Mac/WSL):
```bash
./run_project.sh
```
*Atau jalankan secara manual:*
*   **Backend**: `cd backend && uvicorn main:app --reload --port 8000`
*   **Frontend**: `cd frontend && npm run dev`

---

## 🖥️ Panduan Penggunaan (Usage)

1. Buka browser dan akses `http://localhost:5174` (atau port yang diberikan oleh Vite).
2. Login menggunakan kredensial default:
   *   **Username**: `admincihuyy`
   *   **Password**: `admin123`
3. Masuk ke halaman **Deteksi APD**.
4. Unggah foto atau video pekerja.
5. Sistem akan menganalisis dan menampilkan hasilnya. Jika menggunakan video, silakan cek halaman **Riwayat** untuk melihat *CCTV Alerts* yang otomatis dibuat beserta link gambar dari Azure.
6. Klik tombol **Export CSV** di halaman Riwayat untuk mengunduh laporan.

---

## ☁️ Azure Cloud Integration Note
Pastikan *Container* pada Azure Blob Storage Anda disetel ke level akses **Blob (anonymous read access)** agar gambar dapat di-render dengan benar pada antarmuka web tanpa terhalang *CORS* atau otentikasi tambahan.

---
*Prioritize Safety, Automate Compliance.*
