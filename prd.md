**SafeWatch AI**

Real-time APD Compliance Monitoring System

_Product Requirements Document (PRD)_

| **Versi**     | 1.0.0 - Initial Release                                 |
| ------------- | ------------------------------------------------------- |
| **Tanggal**   | 28 April 2026                                           |
| **Tim**       | SafeWatch AI (3 orang)                                  |
| **Status**    | Draft - Tahap Proposal                                  |
| **Hackathon** | AI Impact Challenge - Dicoding x Microsoft Elevate 2026 |
| **Tema**      | No. 8 - Monitoring Keselamatan Kerja (Pharma / Health)  |

# **1\. Overview**

Lingkungan manufaktur farmasi memiliki standar keselamatan yang sangat ketat. Setiap pekerja yang memasuki area produksi diwajibkan menggunakan Alat Pelindung Diri (APD) lengkap - termasuk helm safety, rompi/vest reflektif, masker, dan sarung tangan - guna mencegah kontaminasi produk maupun risiko kecelakaan kerja.

Namun, pengawasan kepatuhan APD saat ini masih bergantung pada supervisor yang melakukan patroli manual. Dengan luasnya area fasilitas dan tingginya jumlah pekerja, metode ini terbukti tidak efisien: satu supervisor tidak dapat memantau semua area sekaligus, pelanggaran yang tidak terdeteksi dapat berujung pada kecelakaan kerja, dan tidak ada catatan historis yang terstruktur untuk evaluasi.

SafeWatch AI hadir sebagai solusi monitoring keselamatan kerja berbasis Computer Vision dan AI yang bekerja secara real-time. Sistem ini memungkinkan deteksi otomatis kelengkapan APD dari input gambar atau video, mencatat setiap pelanggaran secara terstruktur, dan menampilkan status keseluruhan fasilitas dalam sebuah dashboard terpusat yang dapat diakses supervisor kapan saja.

## **Tujuan Produk**

- Mendeteksi kelengkapan APD pekerja secara otomatis menggunakan Computer Vision tanpa memerlukan pengawasan manual berkelanjutan.
- Mencatat setiap kejadian pelanggaran APD secara terstruktur dan real-time ke dalam sistem log terpusat.
- Memberikan visibilitas penuh kepada supervisor terhadap tingkat kepatuhan APD di seluruh area fasilitas melalui dashboard.
- Mengurangi risiko kecelakaan kerja akibat ketidakpatuhan APD melalui sistem alert proaktif.
- Menyediakan data historis pelanggaran yang dapat digunakan untuk evaluasi dan peningkatan protokol keselamatan.

## **Konteks & Latar Belakang**

Berdasarkan data Kementerian Ketenagakerjaan Republik Indonesia, terdapat lebih dari 98.000 kasus kecelakaan kerja per tahun, di mana diperkirakan 60% di antaranya disebabkan oleh ketidakpatuhan penggunaan APD. Di industri farmasi yang memiliki regulasi ketat (GMP/CPOB), risiko ini berlipat ganda karena kontaminasi produk akibat APD yang tidak lengkap dapat berdampak langsung pada keselamatan konsumen.

SafeWatch AI menjawab tantangan ini dengan mengotomatisasi proses monitoring yang sebelumnya bergantung sepenuhnya pada manusia, sehingga cakupan pengawasan menjadi menyeluruh, konsisten, dan terdokumentasi dengan baik.

# **2\. Requirements**

Berikut adalah persyaratan tingkat tinggi untuk pengembangan sistem SafeWatch AI:

## **2.1 Persyaratan Fungsional**

- Sistem harus dapat menerima input berupa gambar (JPEG, PNG) atau video pendek (MP4) yang diunggah oleh pengguna.
- Sistem harus mendeteksi keberadaan objek APD (helm, rompi, masker) pada setiap individu yang terdeteksi dalam frame menggunakan model Computer Vision.
- Sistem harus mengklasifikasikan status setiap individu yang terdeteksi sebagai COMPLIANT atau VIOLATION berdasarkan kelengkapan APD.
- Sistem harus mencatat setiap kejadian deteksi secara otomatis ke dalam database log pelanggaran beserta timestamp, area, dan jenis pelanggaran.
- Sistem harus menampilkan bounding box dan label status pada gambar hasil deteksi secara visual.
- Sistem harus menyediakan dashboard yang menampilkan statistik kepatuhan APD secara real-time.
- Sistem harus menampilkan notifikasi/alert secara visual pada dashboard setiap kali pelanggaran terdeteksi.
- Sistem harus menyimpan riwayat log seluruh kejadian dan dapat diakses oleh pengguna.

## **2.2 Persyaratan Non-Fungsional**

- Aksesibilitas: Aplikasi harus dapat diakses melalui web browser modern (Chrome, Firefox, Edge) tanpa instalasi tambahan.
- Performa: Waktu proses dari upload gambar hingga hasil deteksi ditampilkan tidak boleh lebih dari 10 detik.
- Ketersediaan: Sistem harus dapat beroperasi 24 jam sehari, 7 hari seminggu dengan uptime minimal 99%.
- Skalabilitas: Arsitektur harus mendukung penambahan area monitoring (kamera/zone) tanpa perubahan fundamental pada sistem.
- Keamanan: Hanya pengguna yang terautentikasi (supervisor/admin) yang dapat mengakses dashboard dan data log.
- Responsivitas: UI harus responsif dan dapat digunakan dengan baik pada layar desktop minimal 1280px.

## **2.3 Persyaratan Teknis**

- Frontend dibangun menggunakan React.js dengan Tailwind CSS untuk styling.
- Backend menggunakan Node.js (Express) atau Python (FastAPI) sebagai API layer.
- Deteksi APD menggunakan Roboflow Inference API dengan model pre-trained PPE detection (MVP) dan dapat diganti Azure Computer Vision pada fase production.
- Database menggunakan PostgreSQL untuk penyimpanan log pelanggaran dan data area.
- Deployment menggunakan Vercel (frontend) dan Railway/Render (backend) dengan target minimal 1 layanan Microsoft Azure aktif.
- Komunikasi frontend-backend menggunakan REST API dengan format JSON.

# **3\. Core Features**

Berikut adalah fitur-fitur utama yang harus tersedia pada versi MVP (Minimum Viable Product):

## **Feature 1 - APD Detection Engine**

Inti dari sistem SafeWatch AI. Modul ini bertanggung jawab untuk menerima input visual dan mengembalikan hasil deteksi APD.

| **Atribut**        | **Detail**                                                                       | **Prioritas** |
| ------------------ | -------------------------------------------------------------------------------- | ------------- |
| Input              | Gambar (JPG/PNG) atau video pendek (MP4, maks. 30 detik)                         | P0            |
| Model AI           | Roboflow PPE Detection API (MVP) / Azure Computer Vision (Production)            | P0            |
| Objek Terdeteksi   | person, helmet/hard-hat, safety vest, face mask, gloves                          | P0            |
| Output Visual      | Bounding box berwarna per objek + label confidence score                         | P0            |
| Output Status      | COMPLIANT (hijau) jika semua APD lengkap, VIOLATION (merah) jika ada yang kurang | P0            |
| Logika Klasifikasi | Rule-based: person detected + semua required APD present = COMPLIANT             | P0            |

### **Logika Klasifikasi APD (Rule Engine)**

Setiap individu (person) yang terdeteksi akan dievaluasi berdasarkan keberadaan objek APD dalam radius bounding box-nya:

| **Kondisi**               | **Helm**  | **Rompi** | **Status**    |
| ------------------------- | --------- | --------- | ------------- |
| Semua APD lengkap         | Ada       | Ada       | **COMPLIANT** |
| Tidak pakai helm          | Tidak Ada | Ada       | **VIOLATION** |
| Tidak pakai rompi         | Ada       | Tidak Ada | **VIOLATION** |
| Tidak ada APD sama sekali | Tidak Ada | Tidak Ada | **VIOLATION** |

## **Feature 2 - Upload & Preview Interface**

Antarmuka utama yang digunakan analis atau petugas keselamatan untuk mengunggah gambar/video dan melihat hasil deteksi secara langsung.

- Drag & drop area untuk upload file gambar (JPG, PNG) atau video (MP4).
- Preview gambar sebelum diproses.
- Tombol 'Analisis Sekarang' untuk memulai proses deteksi.
- Tampilan hasil: gambar anotasi dengan bounding box + panel summary di sebelah kanan.
- Panel summary menampilkan: jumlah orang terdeteksi, jumlah COMPLIANT, jumlah VIOLATION, dan daftar jenis APD yang kurang.
- Pilihan area/zona (dropdown) sebelum upload untuk keperluan logging.

## **Feature 3 - Violation Log System**

Setiap deteksi pelanggaran dicatat secara otomatis ke dalam sistem log yang terstruktur.

| **Field**         | **Tipe Data** | **Deskripsi**                                 |
| ----------------- | ------------- | --------------------------------------------- |
| id                | UUID          | Primary key unik per kejadian                 |
| timestamp         | DATETIME      | Waktu kejadian terdeteksi (auto-generated)    |
| area_id           | FK → areas    | Area/zona mana yang dipantau                  |
| image_url         | STRING        | URL screenshot yang disimpan di cloud storage |
| total_persons     | INTEGER       | Jumlah orang terdeteksi dalam frame           |
| compliant_count   | INTEGER       | Jumlah orang dengan APD lengkap               |
| violation_count   | INTEGER       | Jumlah orang dengan APD tidak lengkap         |
| violation_details | JSON          | Detail APD yang kurang per individu           |
| confidence_score  | FLOAT         | Rata-rata confidence score deteksi            |
| created_by        | FK → users    | ID user yang melakukan upload                 |

## **Feature 4 - Real-time Dashboard**

Dashboard terpusat yang memberikan visibilitas penuh kepada supervisor terhadap kondisi kepatuhan APD di seluruh fasilitas.

### **Komponen Dashboard**

- Stat Cards - 4 kartu ringkasan: Total Pemeriksaan Hari Ini, Total COMPLIANT, Total VIOLATION, dan Compliance Rate (%).
- Alert Panel - Daftar pelanggaran terbaru yang belum di-acknowledge, diurutkan dari yang terbaru.
- Violation Trend Chart - Line chart yang menampilkan jumlah pelanggaran per jam atau per hari (7 hari terakhir).
- Area Heatmap - Tabel yang menunjukkan area mana yang paling sering terjadi pelanggaran.
- Recent Log Table - Tabel 10 entri log terbaru dengan kolom: waktu, area, jumlah orang, status, dan aksi (lihat detail).

## **Feature 5 - Area Management**

Pengelolaan data area/zona yang dipantau dalam fasilitas.

- CRUD (Create, Read, Update, Delete) data area/zona fasilitas.
- Setiap area memiliki: nama area, deskripsi, dan required APD spesifik untuk area tersebut.
- Required APD per area bisa berbeda (contoh: area produksi wajib masker, area gudang tidak wajib masker).
- Filter log dan dashboard berdasarkan area tertentu.

## **Feature 6 - Authentication & User Management**

Sistem autentikasi dasar untuk memastikan hanya pengguna yang berwenang yang dapat mengakses sistem.

- Login menggunakan email dan password.
- Dua level akses: Admin (akses penuh termasuk user management) dan Supervisor (akses dashboard, upload, dan log).
- Session management dengan JWT token.
- Logout otomatis setelah 8 jam tidak aktif.

# **4\. User Flow**

## **4.1 User Roles**

| **Role**            | Deskripsi                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| Admin               | Akses penuh: kelola user, area, dan semua fitur sistem                           |
| Supervisor          | Akses operasional: upload gambar, lihat dashboard, dan log pelanggaran           |
| Petugas Keselamatan | Akses terbatas: upload gambar dan lihat hasil deteksi (tanpa akses log historis) |

## **4.2 Alur Utama - Deteksi APD**

Alur kerja utama yang dilakukan petugas atau supervisor saat melakukan pemeriksaan kepatuhan APD:

- Login: Petugas masuk menggunakan email dan password yang telah terdaftar.
- Pilih Area: Dari dropdown, petugas memilih area/zona yang akan diperiksa (contoh: Area Produksi A, Gudang B).
- Upload Gambar/Video: Petugas mengunggah foto atau video singkat yang diambil dari area tersebut.
- Proses Deteksi: Sistem mengirim gambar ke AI engine dan memproses hasilnya (estimasi: 3-8 detik).
- Tampil Hasil: Sistem menampilkan gambar teranotasi dengan bounding box dan panel summary status COMPLIANT/VIOLATION.
- Auto-Log: Jika terdapat pelanggaran, sistem otomatis mencatat kejadian ke dalam violation log.
- Alert Terkirim: Dashboard supervisor diperbarui secara real-time dan alert baru muncul di panel peringatan.
- Review & Tindak Lanjut: Supervisor melihat alert, meninjau detail pelanggaran, dan mengambil tindakan yang diperlukan.

## **4.3 Alur Monitoring Dashboard**

- Login: Supervisor masuk ke sistem.
- Dashboard Overview: Supervisor melihat ringkasan statistik hari ini (compliance rate, total pemeriksaan, alert aktif).
- Review Alert: Supervisor memeriksa daftar pelanggaran yang belum di-acknowledge di Alert Panel.
- Lihat Detail: Supervisor mengklik salah satu alert untuk melihat foto pelanggaran, area, dan detail APD yang kurang.
- Acknowledge: Supervisor menandai alert sebagai 'sudah ditindaklanjuti'.
- Analisis Tren: Supervisor melihat grafik tren pelanggaran untuk evaluasi mingguan.
- Filter per Area: Supervisor mem-filter data berdasarkan area tertentu untuk identifikasi hotspot.

## **4.4 Alur Setup Awal (Admin)**

- Login sebagai Admin.
- Setup Area: Admin membuat data area/zona fasilitas yang akan dipantau.
- Konfigurasi APD per Area: Admin menentukan APD apa saja yang wajib digunakan di setiap area.
- Buat Akun User: Admin membuat akun untuk supervisor dan petugas keselamatan.
- Sistem Siap Digunakan.

# **5\. Architecture**

## **5.1 Gambaran Umum Arsitektur**

SafeWatch AI menggunakan arsitektur tiga lapis (three-tier architecture) yang memisahkan presentation layer, business logic layer, dan data layer secara jelas. Komunikasi antar layer menggunakan protokol HTTP/REST dengan format data JSON.

| **Layer**          | **Komponen**                                      | **Teknologi**                        |
| ------------------ | ------------------------------------------------- | ------------------------------------ |
| **Presentation**   | React Web App, Dashboard UI, Upload Interface     | React.js, Tailwind CSS, Recharts     |
| **Business Logic** | REST API, AI Integration Layer, Rule Engine, Auth | Node.js / FastAPI, JWT, Roboflow API |
| **Data**           | Relational Database, File Storage                 | PostgreSQL, Azure Blob Storage       |

## **5.2 Diagram Aliran Data - Proses Deteksi APD**

Sequence diagram berikut menggambarkan aliran data saat pengguna melakukan upload gambar untuk deteksi APD:

sequenceDiagram

participant U as Petugas (Browser)

participant FE as Frontend (React)

participant BE as Backend API

participant AI as Roboflow AI API

participant DB as Database (PostgreSQL)

U->>FE: Pilih area + upload gambar

FE->>BE: POST /api/detect (multipart: image, area_id)

BE->>AI: POST image ke Roboflow Inference API

AI-->>BE: JSON predictions (objects, confidence, bbox)

BE->>BE: Rule Engine - evaluasi COMPLIANT/VIOLATION

BE->>DB: Simpan violation log (jika ada pelanggaran)

DB-->>BE: Konfirmasi tersimpan

BE-->>FE: JSON response (annotated_image_url, summary, violations)

FE-->>U: Tampilkan gambar anotasi + panel hasil

## **5.3 Arsitektur Deployment**

| **Komponen** | **Platform**       | **Tier / Plan**       | **Keterangan**                          |
| ------------ | ------------------ | --------------------- | --------------------------------------- |
| Frontend     | Vercel             | Free                  | Static hosting, auto-deploy dari GitHub |
| Backend API  | Railway / Render   | Free Tier             | Container deployment, auto-scale        |
| Database     | Railway PostgreSQL | Free Tier             | 500MB storage, cukup untuk demo         |
| File Storage | Azure Blob Storage | Free (5GB/bulan)      | Simpan screenshot hasil deteksi         |
| AI Inference | Roboflow API       | Free (10k call/bulan) | PPE detection model pre-trained         |
| Domain / SSL | Vercel             | Free                  | HTTPS otomatis                          |

## **5.4 Integrasi Microsoft Azure**

Sesuai requirement hackathon, sistem mengimplementasikan minimal 1 layanan Microsoft Azure:

- Azure Blob Storage (Free Tier - 5GB/bulan): Digunakan untuk menyimpan screenshot gambar hasil anotasi deteksi APD secara persisten. Setiap kejadian deteksi yang mengandung pelanggaran akan disimpan di Azure Blob untuk keperluan audit dan dokumentasi.
- Rencana Production: Azure Computer Vision akan menggantikan Roboflow API sebagai inference engine utama untuk mendapatkan akurasi lebih tinggi dan SLA yang terjamin.

# **6\. Database Schema**

## **6.1 Entity Relationship Diagram (ERD)**

erDiagram

users {

uuid id PK

string email

string password_hash

string name

enum role

datetime created_at

}

areas {

uuid id PK

string name

string description

json required_ppe

datetime created_at

}

detection_logs {

uuid id PK

uuid area_id FK

uuid created_by FK

string image_url

int total_persons

int compliant_count

int violation_count

json violation_details

float confidence_score

datetime created_at

}

violations {

uuid id PK

uuid detection_log_id FK

string missing_ppe

boolean is_acknowledged

uuid acknowledged_by FK

datetime acknowledged_at

}

users ||--o{ detection_logs : "creates"

areas ||--o{ detection_logs : "has many"

detection_logs ||--o{ violations : "contains"

users ||--o{ violations : "acknowledges"

## **6.2 Deskripsi Tabel**

| **Tabel**      | **PK** | **Relasi**                              | **Deskripsi**                                      |
| -------------- | ------ | --------------------------------------- | -------------------------------------------------- |
| users          | uuid   | 1:N ke detection_logs, violations       | Data pengguna sistem dengan role-based access      |
| areas          | uuid   | 1:N ke detection_logs                   | Master data area/zona fasilitas yang dipantau      |
| detection_logs | uuid   | N:1 ke areas & users; 1:N ke violations | Log setiap sesi deteksi APD, satu entri per upload |
| violations     | uuid   | N:1 ke detection_logs & users           | Detail pelanggaran spesifik per individu per sesi  |

# **7\. API Specification**

Seluruh API menggunakan prefix /api/v1 dan mengembalikan response dalam format JSON. Autentikasi menggunakan Bearer JWT token pada header Authorization.

## **7.1 Authentication Endpoints**

| **Method** | **Endpoint** | **Auth** | **Deskripsi**                                          |
| ---------- | ------------ | -------- | ------------------------------------------------------ |
| POST       | /auth/login  | Tidak    | Login dengan email & password, mengembalikan JWT token |
| POST       | /auth/logout | Ya       | Invalidasi session token                               |
| GET        | /auth/me     | Ya       | Mendapatkan profil user yang sedang login              |

## **7.2 Detection Endpoints**

| **Method** | **Endpoint**     | **Auth** | **Deskripsi**                                                                     |
| ---------- | ---------------- | -------- | --------------------------------------------------------------------------------- |
| POST       | /detect          | Ya       | Upload gambar/video untuk deteksi APD. Body: multipart/form-data (image, area_id) |
| GET        | /detect/logs     | Ya       | Ambil daftar detection log dengan pagination & filter (area, date range)          |
| GET        | /detect/logs/:id | Ya       | Detail satu detection log beserta violation breakdown-nya                         |

## **7.3 Dashboard & Analytics Endpoints**

| **Method** | **Endpoint**                | **Auth** | **Deskripsi**                                                            |
| ---------- | --------------------------- | -------- | ------------------------------------------------------------------------ |
| GET        | /dashboard/stats            | Ya       | Statistik hari ini: total deteksi, compliant, violation, compliance rate |
| GET        | /dashboard/trend            | Ya       | Data tren pelanggaran per hari untuk 7 atau 30 hari terakhir             |
| GET        | /dashboard/heatmap          | Ya       | Jumlah pelanggaran per area untuk identifikasi hotspot                   |
| GET        | /violations/active          | Ya       | Daftar pelanggaran yang belum di-acknowledge                             |
| PATCH      | /violations/:id/acknowledge | Ya       | Tandai satu pelanggaran sebagai sudah ditindaklanjuti                    |

## **7.4 Area Management Endpoints**

| **Method** | **Endpoint** | **Auth** | **Deskripsi**                                    |
| ---------- | ------------ | -------- | ------------------------------------------------ |
| GET        | /areas       | Ya       | Daftar semua area/zona yang terdaftar            |
| POST       | /areas       | Admin    | Buat area baru (name, description, required_ppe) |
| PUT        | /areas/:id   | Admin    | Update data area tertentu                        |
| DELETE     | /areas/:id   | Admin    | Hapus area (soft delete)                         |

# **8\. Design & Technical Constraints**

## **8.1 High-Level Technology Stack**

| **Layer**           | **Teknologi Pilihan**                   | **Alasan**                                                                  |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| Frontend Framework  | React.js 18+ (Vite)                     | Ekosistem luas, component reusability, hot reload cepat                     |
| CSS Framework       | Tailwind CSS 3                          | Utility-first, konsisten, tidak perlu custom CSS banyak                     |
| Charting Library    | Recharts                                | Native React, ringan, cocok untuk time-series data                          |
| Backend Framework   | FastAPI (Python) / Express.js (Node.js) | FastAPI lebih cepat untuk API-heavy workload; Express familiar untuk tim JS |
| Database            | PostgreSQL 15                           | Relational, robust, free tier tersedia di Railway                           |
| ORM                 | Prisma (Node) / SQLAlchemy (Python)     | Type-safe, auto-migration, mudah digunakan                                  |
| AI Inference (MVP)  | Roboflow Inference API                  | Gratis 10k calls/bulan, model PPE sudah tersedia                            |
| AI Inference (Prod) | Azure Computer Vision                   | Enterprise-grade, SLA terjamin, integrasi Azure                             |
| File Storage        | Azure Blob Storage                      | Free 5GB/bulan, cocok untuk screenshot storage                              |
| Authentication      | JWT (JSON Web Token)                    | Stateless, mudah diimplementasi, standar industri                           |
| Deployment FE       | Vercel                                  | Zero-config, auto-deploy, gratis untuk project kecil                        |
| Deployment BE       | Railway / Render                        | Container-based, free tier cukup untuk demo                                 |

## **8.2 Typography & Design System**

- Font Utama (UI): Inter, ui-sans-serif, system-ui, sans-serif - untuk body text, label, dan navigasi.
- Font Monospace (Code/Data): JetBrains Mono, monospace - untuk menampilkan JSON response, confidence score, dan data teknis.
- Font Serif: serif - tidak digunakan dalam UI utama, reserved untuk dokumen cetak.

## **8.3 Color System**

| **Warna**      | **Hex** | **Penggunaan**                      |
| -------------- | ------- | ----------------------------------- |
| Primary Blue   | #1F4E79 | Header, judul utama, branding       |
| Action Blue    | #2E75B6 | Tombol utama, link, ikon aktif      |
| Success Green  | #375623 | Status COMPLIANT, badge aman        |
| Warning Orange | #C55A11 | Status VIOLATION ringan, peringatan |
| Danger Red     | #C00000 | Pelanggaran kritis, error state     |
| Background     | #F8FAFC | Background halaman utama            |
| Surface White  | #FFFFFF | Card, modal, form                   |
| Text Dark      | #404040 | Body text utama                     |
| Text Muted     | #888888 | Teks sekunder, placeholder          |

## **8.4 Batasan & Asumsi**

- Ukuran file gambar maksimum yang dapat diupload adalah 10MB per file.
- Durasi video maksimum yang diproses adalah 30 detik; video lebih panjang harus dipotong sebelum upload.
- Sistem pada fase MVP mengasumsikan pencahayaan yang memadai pada gambar untuk akurasi deteksi optimal.
- Minimum confidence score yang diterima sebagai deteksi valid adalah 0.5 (50%) - objek dengan confidence di bawah threshold ini diabaikan.
- Sistem tidak dirancang untuk deteksi real-time dari CCTV stream pada fase MVP; input adalah upload manual.
- Data pelanggaran disimpan maksimal 1 tahun dalam sistem sebelum diarsipkan.
- Sistem dirancang untuk penggunaan intranet fasilitas; tidak dioptimalkan untuk akses jaringan publik latensi tinggi.

# **9\. MVP Scope & Development Timeline**

## **9.1 Scope MVP (Fase Proposal - 30 April 2026)**

Fitur yang wajib berjalan untuk submission proposal hackathon:

| **Fitur**                     | **Status** | **Prioritas** | **Keterangan**                                         |
| ----------------------------- | ---------- | ------------- | ------------------------------------------------------ |
| Upload gambar & deteksi APD   | Wajib      | P0            | Core feature, harus 100% jalan                         |
| Tampilan hasil + bounding box | Wajib      | P0            | Visual output untuk demo                               |
| Violation log otomatis        | Wajib      | P0            | Bukti sistem mencatat kejadian                         |
| Dashboard statistik dasar     | Wajib      | P0            | 4 stat cards + tabel log terbaru                       |
| Pilih area sebelum upload     | Wajib      | P0            | Konteks area untuk logging                             |
| Login / autentikasi           | Dianjurkan | P1            | Bisa skip untuk demo jika waktu tidak cukup            |
| Alert panel real-time         | Dianjurkan | P1            | Menambah wow factor demo                               |
| Grafik tren pelanggaran       | Opsional   | P2            | Tambahkan jika ada waktu tersisa                       |
| Multi-area management (CRUD)  | Opsional   | P2            | Bisa diisi dengan data dummy hardcoded dulu            |
| Azure Blob Storage integrasi  | Opsional   | P2            | Nilai tambah Azure; bisa pakai local storage untuk MVP |

## **9.2 Jadwal Pengerjaan (28-30 April 2026)**

| **Hari**          | **Target**                                                                                                                                                                               | **PIC**                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Hari 1 (28 April) | Finalisasi PRD, setup repo GitHub, daftar Roboflow & dapatkan API key, setup project React + backend skeleton, test call Roboflow API dari Postman                                       | Semua anggota                                               |
| Hari 2 (29 April) | Build fitur core: upload gambar → call Roboflow → tampil bounding box + status. Setup database PostgreSQL. Build halaman dashboard dasar. Deploy frontend ke Vercel, backend ke Railway. | Orang 1: AI+Backend, Orang 2: Backend+DB, Orang 3: Frontend |
| Hari 3 (30 April) | Integrasi frontend-backend penuh. Testing end-to-end. Polish UI. Finalisasi proposal dokumen. Submit sebelum pukul 23:59.                                                                | Semua anggota                                               |

## **9.3 Pembagian Kerja Tim**

| **Anggota** | **Domain**         | **Tanggung Jawab Utama**                                                                                         |
| ----------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Orang 1     | AI & Backend       | Integrasi Roboflow API, implementasi rule engine COMPLIANT/VIOLATION, endpoint /detect, setup Azure Blob Storage |
| Orang 2     | Backend & Database | Setup PostgreSQL schema, endpoint dashboard & analytics, authentication JWT, deployment Railway                  |
| Orang 3     | Frontend           | Upload interface, tampilan hasil bounding box, dashboard UI, integrasi API, deployment Vercel, polish UX         |

# **10\. Success Metrics & Evaluation Criteria**

## **10.1 Metrik Keberhasilan Teknis**

| **Metrik**           | **Target MVP** | **Target Production** | **Cara Ukur**                               |
| -------------------- | -------------- | --------------------- | ------------------------------------------- |
| Waktu proses deteksi | < 10 detik     | < 5 detik             | Stopwatch dari upload hingga hasil muncul   |
| Akurasi deteksi helm | \> 70%         | \> 90%                | Manual test dengan 20+ sampel foto          |
| Uptime sistem        | \> 95%         | \> 99%                | Monitoring Vercel/Railway dashboard         |
| False positive rate  | < 30%          | < 10%                 | Manual review hasil deteksi vs ground truth |
| Ukuran bundle FE     | < 2MB          | < 1MB                 | Vite build output size                      |

## **10.2 Kriteria Penilaian Hackathon**

Berdasarkan kriteria resmi AI Impact Challenge Dicoding 2026:

| **Kriteria**                     | **Bobot** | **Strategi SafeWatch AI**                                                                                                 | **Target Nilai** |
| -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Inovasi & Kebaruan               | 25%       | Computer Vision untuk APD - pendekatan proaktif vs reaktif. Bounding box visual yang intuitif.                            | Tinggi           |
| Desain & Kemudahan Penggunaan    | 25%       | Dashboard clean, flow upload simpel (3 langkah), hasil visual yang mudah dipahami non-technical user.                     | Tinggi           |
| Pemanfaatan AI & Microsoft Azure | 30%       | AI: Roboflow PPE detection + rule engine. Azure: Blob Storage (aktif), rencana Computer Vision di production.             | Tinggi           |
| Manfaat & Relevansi              | 20%       | Relevan langsung dengan keselamatan kerja di industri farmasi. Data Kemnaker 98.000 kecelakaan/tahun sebagai justifikasi. | Tinggi           |

# **11\. Risk & Mitigation**

| **Risiko**                                       | **Probabilitas** | **Dampak**    | **Mitigasi**                                                                                                                      |
| ------------------------------------------------ | ---------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Akurasi Roboflow model rendah untuk APD spesifik | Sedang           | Tinggi        | Siapkan dataset foto pengujian yang beragam. Adjust confidence threshold. Gunakan contoh gambar yang terang dan jelas untuk demo. |
| API Roboflow down saat demo                      | Rendah           | Sangat Tinggi | Siapkan response mock (cached JSON response) sebagai fallback agar demo tetap berjalan.                                           |
| Waktu development tidak cukup                    | Tinggi           | Sedang        | Fokus hanya pada happy path P0. Fitur P1 dan P2 skip jika waktu tidak cukup.                                                      |
| Database Railway down                            | Rendah           | Sedang        | Gunakan SQLite lokal sebagai fallback untuk demo darurat.                                                                         |
| Tim tidak familiar dengan Computer Vision        | Sedang           | Sedang        | Roboflow menyediakan hosted inference API - tidak perlu paham ML. Cukup call API dan parse JSON response.                         |

# **12\. Appendix**

## **12.1 Referensi & Sumber Data**

- Kementerian Ketenagakerjaan RI - Data Kecelakaan Kerja Nasional 2023
- Roboflow PPE Detection Model - <https://universe.roboflow.com> (public model untuk PPE/hard-hat detection)
- Microsoft Azure - Free Services: <https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account/#free-services>
- CPOB (Cara Pembuatan Obat yang Baik) - BPOM RI, Regulasi Keselamatan Industri Farmasi
- AI Impact Challenge Brief - Dicoding x Microsoft Elevate Training Center 2026

## **12.2 Daftar Singkatan**

| **Singkatan** | Kepanjangan                                                      |
| ------------- | ---------------------------------------------------------------- |
| APD           | Alat Pelindung Diri                                              |
| CV            | Computer Vision                                                  |
| MVP           | Minimum Viable Product                                           |
| PRD           | Product Requirements Document                                    |
| PPE           | Personal Protective Equipment (padanan APD dalam bahasa Inggris) |
| CPOB          | Cara Pembuatan Obat yang Baik                                    |
| GMP           | Good Manufacturing Practice                                      |
| JWT           | JSON Web Token                                                   |
| OCR           | Optical Character Recognition                                    |
| SLA           | Service Level Agreement                                          |
| CRUD          | Create, Read, Update, Delete                                     |
| FK            | Foreign Key                                                      |
| PK            | Primary Key                                                      |

## **12.3 Versi Dokumen**

| **Versi** | **Tanggal**   | **Penulis**      | **Perubahan**                                              |
| --------- | ------------- | ---------------- | ---------------------------------------------------------- |
| 1.0.0     | 28 April 2026 | Tim SafeWatch AI | Initial draft - dibuat untuk submission proposal hackathon |
