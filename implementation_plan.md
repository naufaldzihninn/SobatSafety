# SafeWatch AI — Implementation Plan
## Fokus: Submission Proposal 30 April 2026

> **Strategi: LOCAL-FIRST**
> Build lokal dulu sampai 100% jalan. Deploy hanya di hari-H (30 April) kalau masih ada waktu.
> Jangan buang waktu setup cloud sebelum core feature beres.

---

## 🎯 Apa Yang Harus Ada Tanggal 30 April?

Berdasarkan ketentuan Dicoding Challenge 971 (Fase 1: Registration & Call for Proposals, deadline 30 April 2026), yang harus di-submit adalah:

### Yang Wajib Di-submit:
1. **Proposal Document** — menggunakan [Template Draft Dicoding](https://docs.google.com/document/d/1n9yC9aJ-tdcAM5jwx1ng3RhtoN0R33HPeKbmSlshhfw/copy) (link publik, isi dengan konten dari PRD kita)
2. **Link Deployed Project** — prototype yang sudah bisa diakses secara online (minimal bisa dibuka dan demo flow utamanya jalan)

### Cara Submit:
- Klik "MASUKAN APLIKASI" di halaman challenge
- Platform: **Portofolio**
- Nama Aplikasi: **SafeWatch AI**
- Link Aplikasi: link deployed project
- Komentar: link proposal document (Google Doc — pastikan public)

---

## 📋 Fitur P0 Yang Harus 100% Jalan (Berdasarkan PRD Section 9.1)

| # | Fitur | Kenapa Wajib |
|---|-------|-------------|
| 1 | Upload gambar → deteksi APD | Core feature, bukti AI jalan |
| 2 | Tampilkan bounding box + label status | Visual output untuk demo/screenshot |
| 3 | Rule engine COMPLIANT/VIOLATION | Logic utama sistem |
| 4 | Auto-save violation log | Bukti sistem mencatat kejadian |
| 5 | Dashboard: 4 stat cards + tabel log | Bukti ada "sistem monitoring" |
| 6 | Pilih area sebelum upload | Konteks logging |

### Fitur Yang Bisa Di-skip (P1/P2):
- ❌ Login/Auth (skip untuk demo, hardcode 1 user)
- ❌ Alert real-time WebSocket (terlalu kompleks, skip)
- ❌ Grafik tren (bisa pakai dummy data)
- ❌ Multi-area CRUD (hardcode 3-4 area dummy)
- ❌ Azure Blob Storage (simpan lokal/base64)

---

## 🛠️ Tech Stack (Local-First)

| Layer | Pilihan | Alasan |
|-------|---------|--------|
| **Frontend** | React.js + Vite | Sesuai PRD, fast dev server |
| **CSS** | Tailwind CSS | Sesuai PRD |
| **Backend** | FastAPI (Python) | Mudah untuk file upload + local inference |
| **Database** | **SQLite** | Zero setup, file lokal |
| **AI Model** | **YOLOv8 (Ultralytics)** | Local training & inference, no API limits |
| **Dataset** | Roboflow Universe | Construction Site Safety (Hardhat, Vest, etc.) |
| **Training** | Google Colab / Local GPU | Cepat dengan GPU untuk menghasilkan `best.pt` |
| **Storage Gambar** | **Local filesystem** | Simpan di `/uploads/` |
| **Auth** | Skip (hardcode 1 user) | Hemat waktu untuk demo |

> **Kenapa SQLite bukan PostgreSQL?**
> Untuk proposal demo, tidak ada bedanya di mata juri. SQLite = zero setup, langsung jalan. PostgreSQL bisa ditambah saat fase implementasi (Mei-Juni).

> **Kenapa bukan Azure/Vercel dulu?**
> Setup cloud butuh waktu 2-4 jam (akun, konfigurasi, debugging). Waktu itu lebih baik dipakai build fitur. Deploy cloud dilakukan TERAKHIR di tanggal 30 setelah semua fitur jalan lokal.

---

## 🏗️ Struktur Project

```
dicodingfix/
├── backend/                    # FastAPI
│   ├── main.py                 # Entry point
│   ├── database.py             # SQLite setup (SQLAlchemy)
│   ├── models.py               # ORM models
│   ├── schemas.py              # Pydantic schemas
│   ├── routers/
│   │   ├── detect.py           # POST /detect (core feature)
│   │   ├── dashboard.py        # GET /dashboard/stats, /trend, /heatmap
│   │   ├── violations.py       # GET/PATCH violations
│   │   └── areas.py            # GET /areas
│   ├── services/
│   │   ├── yolo_service.py     # Local inference using ultralytics (best.pt)
│   │   ├── annotation.py       # Helper for drawing (if not using YOLO built-in)
│   │   └── rule_engine.py      # COMPLIANT/VIOLATION logic based on detections
│   ├── uploads/                # Local image storage
│   ├── safewatch.db            # SQLite database file
│   └── requirements.txt
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPanel.jsx     # Drag & drop upload
│   │   │   ├── DetectionResult.jsx # Gambar anotasi + summary panel
│   │   │   ├── Dashboard.jsx       # Stat cards + log table
│   │   │   ├── StatCard.jsx
│   │   │   ├── ViolationTable.jsx
│   │   │   └── AreaSelector.jsx    # Dropdown pilih area
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx      # Halaman utama deteksi
│   │   │   └── DashboardPage.jsx   # Halaman dashboard
│   │   ├── api/
│   │   │   └── client.js           # Axios/fetch calls ke backend
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── prd.md
├── implementation_plan.md
└── README.md
```

---

## 📅 Timeline Eksekusi (28-30 April)

### ✅ Hari 1 — 28 April (SEKARANG/MALAM INI)
**Target: Dataset Ready & Training Started**

- [ ] Setup project structure (folder backend/ dan frontend/)
- [ ] Buat Python venv + install dependencies (`ultralytics`, `roboflow`, `fastapi`, dll)
- [ ] **Download Dataset:** Gunakan script download dari Roboflow (Construction Site Safety)
- [ ] **Start Training:** Jalankan training YOLOv8n di Google Colab / Local GPU
- [ ] Init Vite React project di frontend/
- [ ] Buat `database.py` + `models.py` (SQLite)
- [ ] Seed 4 area dummy

**Checkpoint Hari 1:** Training sedang berjalan dan struktur folder siap ✅

---

### 🔨 Hari 2 — 29 April
**Target: Fitur core end-to-end jalan (upload → deteksi → tampil hasil)**

**Morning (Backend):**
- [ ] Siapkan file `best.pt` hasil training ke folder `backend/weights/`
- [ ] Buat `yolo_service.py` — Load model & fungsi inference
- [ ] Buat `rule_engine.py` — logika COMPLIANT/VIOLATION per person
- [ ] Buat `annotation.py` — gambar bounding box di gambar (return base64 PNG)
- [ ] Buat endpoint `POST /api/v1/detect`:
  - Terima: multipart/form-data (image, area_id)
  - Proses: call Roboflow → rule engine → annotate gambar → simpan ke DB → return JSON
- [ ] Buat endpoint `GET /api/v1/detect/logs` (with pagination)
- [ ] Buat endpoint `GET /api/v1/dashboard/stats`
- [ ] Test semua endpoint di Postman/curl

**Afternoon (Frontend):**
- [ ] Setup React Router (2 halaman: /upload, /dashboard)
- [ ] Build `UploadPage.jsx`:
  - Drag & drop area
  - Dropdown pilih area (fetch dari GET /areas)
  - Tombol "Analisis Sekarang"
  - Tampilkan gambar anotasi (base64 img) + panel summary kanan
- [ ] Build `DashboardPage.jsx`:
  - 4 stat cards (Total Pemeriksaan, Compliant, Violation, Compliance Rate)
  - Tabel 10 log terbaru

**Evening:**
- [ ] Integrasi frontend ↔ backend (atur CORS di FastAPI)
- [ ] Test flow lengkap: upload → hasil muncul → cek DB ada record
- [ ] Fix bug yang ditemukan

**Checkpoint Hari 2:** Upload foto → bounding box muncul di UI → log tercatat di DB ✅

---

### 🚀 Hari 3 — 30 April
**Target: Polish, deploy, submit sebelum 23:59**

**Morning:**
- [ ] Polish UI (warna dari PRD color system, typography Inter)
- [ ] Responsive check (minimal 1280px)
- [ ] Error handling (file terlalu besar, format salah, API Roboflow error)
- [ ] Siapkan mock/fallback response Roboflow (jaga-jaga API down saat demo)
- [ ] Screenshot/recording demo untuk proposal doc

**Afternoon:**
- [ ] Daftar/login Vercel → deploy frontend
- [ ] Daftar/login Railway/Render → deploy backend
- [ ] Update `VITE_API_URL` di frontend ke URL backend production
- [ ] Test end-to-end di URL production
- [ ] Fill proposal document (Google Doc dari template Dicoding)

**Evening (sebelum 23:59 WIB):**
- [ ] Pastikan Google Doc proposal sudah public (Anyone with link can view)
- [ ] Submit di Dicoding Challenge:
  - Platform: Portofolio
  - Nama: SafeWatch AI
  - Link Aplikasi: [URL Vercel]
  - Komentar: [Link Google Doc proposal]

---

## 🔑 Setup Yang Perlu Dilakukan SEBELUM Coding

Ini yang paling sering bikin stuck kalau belum disiapkan:

### 1. Roboflow Account + API Key ← PALING PENTING
```
Daftar: https://app.roboflow.com/
→ Cari model PPE yang sudah ada: https://universe.roboflow.com/search?q=ppe+hardhat
  Rekomendasi: cari yang punya class: person, helmet/hard-hat, safety-vest
→ Dapatkan: API_KEY dan MODEL_ENDPOINT (ada di tab "Deploy" > "Roboflow Inference")
→ Test call:
  curl -X POST "https://detect.roboflow.com/{MODEL_ID}/{VERSION}?api_key={KEY}" \
    -F "file=@foto_test.jpg"
```

### 2. Python Virtual Environment
```bash
cd /home/nopall/myproject/dicodingfix
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy python-multipart httpx pillow python-dotenv aiofiles
```

### 3. Frontend Setup
```bash
cd /home/nopall/myproject/dicodingfix
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite axios react-router-dom recharts lucide-react
```

### 4. File `.env` di `backend/`
```env
ROBOFLOW_API_KEY=your_api_key_here
ROBOFLOW_MODEL_ENDPOINT=https://detect.roboflow.com/ppe-detection-xxxx/1
CONFIDENCE_THRESHOLD=0.5
DATABASE_URL=sqlite:///./safewatch.db
UPLOAD_DIR=./uploads
```

### 5. Akun untuk Deploy (buat sekarang, setup nanti)
- Vercel: https://vercel.com (daftar pakai GitHub)
- Railway: https://railway.app (daftar pakai GitHub)

---

## ⚡ Critical Path

```
[BLOCKING] Training best.pt (Colab/GPU)
       ↓
  Backend /detect endpoint (Ultralytics)
       ↓
  Rule Engine (COMPLIANT/VIOLATION)
       ↓
  Frontend: Upload → tampil hasil
       ↓
  Dashboard: stats dari DB
       ↓
  DEMO READY ✅
       ↓
  Deploy → Submit Proposal
```

> Kalau Roboflow gagal → langsung pakai **mock response** (JSON hardcoded), jangan stuck.

---

## 🧪 Mock Response Fallback (simpan di `backend/services/mock_response.py`)

Untuk jaga-jaga kalau API Roboflow down saat demo:

```python
MOCK_ROBOFLOW_RESPONSE = {
    "predictions": [
        {"x": 150, "y": 200, "width": 100, "height": 250, "class": "person", "confidence": 0.92},
        {"x": 145, "y": 100, "width": 80,  "height": 60,  "class": "helmet", "confidence": 0.87},
        {"x": 140, "y": 180, "width": 95,  "height": 120, "class": "safety vest", "confidence": 0.79}
    ]
}

USE_MOCK = False  # Set True kalau mau pakai mock
```

---

## 📊 Database Schema (SQLite)

```sql
CREATE TABLE areas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    required_ppe TEXT,       -- JSON array: '["helmet", "vest"]'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detection_logs (
    id TEXT PRIMARY KEY,
    area_id TEXT REFERENCES areas(id),
    image_path TEXT,         -- path lokal di /uploads/
    total_persons INTEGER DEFAULT 0,
    compliant_count INTEGER DEFAULT 0,
    violation_count INTEGER DEFAULT 0,
    violation_details TEXT,  -- JSON
    confidence_score REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE violations (
    id TEXT PRIMARY KEY,
    detection_log_id TEXT REFERENCES detection_logs(id),
    missing_ppe TEXT,        -- "helmet, vest"
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Seed Data Areas (4 dummy areas):
```python
SEED_AREAS = [
    {"name": "Area Produksi A", "description": "Lantai produksi utama", "required_ppe": ["helmet", "vest", "mask"]},
    {"name": "Area Gudang B",   "description": "Gudang bahan baku",     "required_ppe": ["helmet", "vest"]},
    {"name": "Area Packing C",  "description": "Area pengemasan produk", "required_ppe": ["helmet", "vest", "gloves"]},
    {"name": "Area QC Lab D",   "description": "Laboratorium QC",       "required_ppe": ["mask", "gloves"]},
]
```

---

## 📝 Isi Proposal Document (Google Doc Template Dicoding)

Ambil dari PRD, isi field-field berikut:

| Field | Isi |
|-------|-----|
| Nama Tim | SafeWatch AI |
| Anggota Tim | [nama anggota] |
| Tema | No. 8 - Monitoring Keselamatan Kerja (Pharma/Health) |
| Problem Statement | Monitoring APD manual tidak efisien, 98rb kecelakaan/tahun |
| Solusi | Computer Vision + AI deteksi APD otomatis dari gambar/video |
| AI yang digunakan | Roboflow PPE Detection Model (Computer Vision) |
| Layanan Azure | Azure Blob Storage (disebutkan sebagai komponen arsitektur) |
| Link Project | [diisi saat deploy] |
| Screenshot | Screenshot dari prototype yang sudah jalan |

---

## ✅ Final Checklist Sebelum Submit (30 April)

- [ ] Upload gambar → bounding box → COMPLIANT/VIOLATION jalan
- [ ] Dashboard stat cards tampil angka yang benar
- [ ] Tabel log menampilkan deteksi terbaru
- [ ] Dropdown area berfungsi saat upload
- [ ] Tidak ada error fatal (500/CORS/etc) saat demo
- [ ] App live di URL publik (Vercel + Railway)
- [ ] Proposal Google Doc lengkap + link public
- [ ] **Submit di Dicoding SEBELUM 23:59 WIB**

---

*Last updated: 28 April 2026 | SafeWatch AI*
