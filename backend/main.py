import os
import uuid
import json
import threading
from fastapi import FastAPI, File, UploadFile, Depends, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

import models, database
from services import yolo_service, rule_engine, video_helper

# Bikin folder uploads jika belum ada
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Buat tabel database jika belum ada
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="SafeWatch AI API")

# Konfigurasi CORS agar frontend React bisa mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Ganti dengan origin spesifik saat production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount folder static untuk image hasil anotasi
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.on_event("startup")
def startup_event():
    # Seed Data Dummy Area
    db = database.SessionLocal()
    if db.query(models.Area).count() == 0:
        seed_areas = [
            models.Area(id="1", name="Area Produksi A", description="Lantai produksi utama", required_ppe=json.dumps(["helmet", "vest"])),
            models.Area(id="2", name="Area Gudang B", description="Gudang bahan baku", required_ppe=json.dumps(["helmet", "vest"])),
            models.Area(id="3", name="Area Packing C", description="Area pengemasan", required_ppe=json.dumps(["helmet", "vest"])),
            models.Area(id="4", name="Area QC Lab D", description="Laboratorium QC", required_ppe=json.dumps(["vest"])),
        ]
        db.add_all(seed_areas)
        db.commit()
    
    # Seed Default User
    if db.query(models.User).count() == 0:
        admin_user = models.User(
            id=str(uuid.uuid4()),
            username="admincihuyy",
            password_hash="admin123", # Untuk MVP kita pakai simple password dulu
            name="Admin Sobatsafety",
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        
    db.close()
    
    # Load model AI
    yolo_service.load_model()

@app.post("/api/v1/auth/login")
async def login(data: dict, db: Session = Depends(database.get_db)):
    username = data.get("username")
    password = data.get("password")
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or user.password_hash != password:
        raise HTTPException(status_code=401, detail="Username atau password salah")
    
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "role": user.role,
        "token": "dummy-jwt-token-for-mvp"
    }

@app.get("/api/v1/areas")
def get_areas(db: Session = Depends(database.get_db)):
    areas = db.query(models.Area).all()
    return [{"id": a.id, "name": a.name, "description": a.description} for a in areas]

@app.post("/api/v1/detect")
async def detect_ppe(
    area_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    area = db.query(models.Area).filter(models.Area.id == area_id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    # Save original image
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    # Cek apakah file adalah video
    video_extensions = [".mp4", ".mov", ".avi", ".webm", ".mkv"]
    if file_ext.lower() in video_extensions:
        log_id = str(uuid.uuid4())
        log_entry = models.DetectionLog(
            id=log_id,
            area_id=area_id,
            image_path=f"/uploads/{filename}",
            total_persons=0,
            compliant_count=0,
            violation_count=0,
            violation_details="[]",
            confidence_score=0.0
        )
        db.add(log_entry)
        db.commit()

        # Ambil required_ppe untuk background thread
        required_ppe = json.loads(area.required_ppe) if area.required_ppe else ["helmet", "vest"]

        # Proses video di background thread (tidak blocking)
        def run_background():
            gen = yolo_service.stream_video_inference(file_path, filename, required_ppe, log_id)
            # Konsumsi semua frame agar YOLO memproses sampai selesai
            for _ in gen:
                pass

        thread = threading.Thread(target=run_background, daemon=True)
        thread.start()

        return {
            "isVideo": True,
            "filename": filename,
            "logId": log_id,
            "status": "REAL-TIME MONITORING",
            "streamUrl": f"/api/v1/stream/{filename}?area_id={area_id}&log_id={log_id}",
            "compliantCount": "-",
            "violationCount": "-",
            "details": []
        }
        
    # Jalankan inferensi YOLO (Untuk Foto)
    result = yolo_service.run_inference(file_path)
    
    # Evaluasi dengan Rule Engine
    required_ppe = json.loads(area.required_ppe) if area.required_ppe else ["helmet", "vest"]
    evaluation = rule_engine.evaluate_compliance(result["predictions"], required_ppe)
    
    # Simpan ke Database
    from services import azure_storage
    log_id = str(uuid.uuid4())
    
    # Upload ke Azure
    azure_url = azure_storage.upload_image_to_azure(result["annotated_image_path"])
    final_path = azure_url if azure_url else f"/uploads/{os.path.basename(result['annotated_image_path'])}"
    
    log_entry = models.DetectionLog(
        id=log_id,
        area_id=area_id,
        image_path=final_path,
        total_persons=evaluation["total_persons"],
        compliant_count=evaluation["compliant_count"],
        violation_count=evaluation["violation_count"],
        violation_details=json.dumps(evaluation["violation_details"]),
        confidence_score=0.0 # TODO: hitung rata-rata
    )
    db.add(log_entry)
    
    # Simpan pelanggaran spesifik
    if evaluation["violation_count"] > 0:
        for detail in evaluation["violation_details"]:
            db.add(models.Violation(
                id=str(uuid.uuid4()),
                detection_log_id=log_id,
                missing_ppe=", ".join(detail["missing"])
            ))
            
    db.commit()
    
    return {
        "isVideo": False,
        "status": "COMPLIANT" if evaluation["violation_count"] == 0 else "VIOLATION",
        "compliantCount": evaluation["compliant_count"],
        "violationCount": evaluation["violation_count"],
        "details": evaluation["violation_details"],
        "imageUrl": final_path
    }

@app.get("/api/v1/stream/{filename}")
def stream_video(filename: str, area_id: str, log_id: str = None):
    """Endpoint untuk streaming video real-time MJPEG"""
    video_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video not found")
        
    db = database.SessionLocal()
    area = db.query(models.Area).filter(models.Area.id == area_id).first()
    db.close()
    
    required_ppe = json.loads(area.required_ppe) if area and area.required_ppe else ["helmet", "vest"]
        
    return StreamingResponse(
        yolo_service.stream_video_inference(video_path, filename, required_ppe, log_id),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/api/v1/stream/stats/{filename}")
def get_stream_stats(filename: str):
    """Endpoint untuk mengambil statistik real-time dari video yang sedang diproses"""
    stats = yolo_service.video_stats.get(filename)
    if not stats:
        return {"status": "LOADING...", "compliantCount": 0, "violationCount": 0, "details": []}
    return stats

@app.get("/api/v1/logs")
def get_all_logs(db: Session = Depends(database.get_db)):
    logs = db.query(models.DetectionLog).order_by(models.DetectionLog.created_at.desc()).all()
    result = []
    for log in logs:
        area = db.query(models.Area).filter(models.Area.id == log.area_id).first()
        result.append({
            "id": log.id,
            "time": log.created_at.strftime("%d %b %Y, %H:%M") if log.created_at else "",
            "area": area.name if area else "Unknown",
            "status": "COMPLIANT" if log.violation_count == 0 else "VIOLATION",
            "missing": json.loads(log.violation_details)[0]["missing"] if log.violation_count > 0 and len(json.loads(log.violation_details)) > 0 else "-",
            "persons": log.total_persons,
            "imageUrl": log.image_path
        })
    return result

@app.delete("/api/v1/logs/{log_id}")
def delete_log(log_id: str, db: Session = Depends(database.get_db)):
    # Hapus pelanggaran terkait dulu (FK constraint)
    db.query(models.Violation).filter(models.Violation.detection_log_id == log_id).delete()
    # Hapus log deteksi
    log = db.query(models.DetectionLog).filter(models.DetectionLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Log deleted successfully"}

@app.delete("/api/v1/logs")
def delete_all_logs(db: Session = Depends(database.get_db)):
    # Hapus semua pelanggaran
    db.query(models.Violation).delete()
    # Hapus semua log
    db.query(models.DetectionLog).delete()
    db.commit()
    return {"message": "All logs deleted successfully"}

@app.get("/api/v1/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    # Statistik sederhana untuk hari ini
    logs = db.query(models.DetectionLog).all()
    
    total_persons = sum(log.total_persons for log in logs)
    compliant = sum(log.compliant_count for log in logs)
    violation = sum(log.violation_count for log in logs)
    rate = round((compliant / total_persons * 100), 1) if total_persons > 0 else 0
    
    # Hitung Tren 7 Hari Terakhir
    from datetime import datetime, timedelta
    trend = []
    day_map = {"Mon": "Senin", "Tue": "Selasa", "Wed": "Rabu", "Thu": "Kamis", "Fri": "Jumat", "Sat": "Sabtu", "Sun": "Minggu"}
    
    for i in range(6, -1, -1):
        target_date = (datetime.now() - timedelta(days=i)).date()
        day_name_eng = target_date.strftime("%a")
        display_name = day_map.get(day_name_eng, day_name_eng)
        
        # Hitung total pelanggaran pada tanggal tersebut
        day_violations = sum(log.violation_count for log in logs if log.created_at and log.created_at.date() == target_date)
        trend.append({"name": display_name, "violations": day_violations})

    recent_logs = []
    for log in sorted(logs, key=lambda x: x.created_at, reverse=True)[:5]:
        area = db.query(models.Area).filter(models.Area.id == log.area_id).first()
        recent_logs.append({
            "id": log.id,
            "time": log.created_at.strftime("%H:%M %p") if log.created_at else "",
            "area": area.name if area else "Unknown",
            "status": "COMPLIANT" if log.violation_count == 0 else "VIOLATION",
            "missing": json.loads(log.violation_details)[0]["missing"] if log.violation_count > 0 and len(json.loads(log.violation_details)) > 0 else "-",
            "persons": log.total_persons
        })
    
    return {
        "totalPemeriksaan": total_persons,
        "compliant": compliant,
        "violation": violation,
        "complianceRate": rate,
        "recentLogs": recent_logs,
        "trend": trend
    }
