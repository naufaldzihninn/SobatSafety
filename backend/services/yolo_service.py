import os
import cv2
import uuid
import json
from ultralytics import YOLO
from services import rule_engine
import database, models

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../weights/best.pt")
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print(f"✅ Model YOLO berhasil dimuat dari: {MODEL_PATH}")
    else:
        print(f"⚠️ Model tidak ditemukan di {MODEL_PATH}. Akan menggunakan mode MOCK.")

def run_inference(image_path: str):
    global model
    if model is None:
        return mock_inference(image_path)
        
    results = model(image_path)
    result = results[0]
    
    base, ext = os.path.splitext(image_path)
    annotated_path = f"{base}_annotated{ext}"
    result.save(filename=annotated_path)
    
    predictions = []
    for box in result.boxes:
        class_id = int(box.cls[0])
        class_name = result.names[class_id]
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        predictions.append({
            "class": class_name.lower(),
            "confidence": float(box.conf[0]),
            "bbox": [x1, y1, x2, y2]
        })
        
    return {
        "predictions": predictions,
        "annotated_image_path": annotated_path
    }

video_stats = {}

def stream_video_inference(video_path: str, filename: str, required_ppe: list, log_id: str = None):
    global model, video_stats
    
    # Ambil area_id dari log awal jika ada
    area_id = "1" # Default
    if log_id:
        try:
            db_temp = database.SessionLocal()
            initial_log = db_temp.query(models.DetectionLog).filter(models.DetectionLog.id == log_id).first()
            if initial_log:
                area_id = initial_log.area_id
            db_temp.close()
        except:
            pass

    # Inisialisasi stats UI
    video_stats[filename] = {
        "status": "MENGANALISIS...",
        "compliantCount": 0,
        "violationCount": 0,
        "details": [],
        "latestFrameUrl": None
    }
    
    # Variabel Tracking
    last_alert_time_ms = -5000
    max_violations = 0
    worst_evaluation = None
    worst_frame = None
    frame_count = 0
    FRAME_SKIP = 5   # Proses 1 dari setiap 5 frame (hemat CPU 5x lipat)
    SCALE = 0.5      # Kecilkan resolusi 50% sebelum inference
    last_annotated_frame = None  # Cache frame terakhir untuk frame yang dilewati

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        current_time_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
        frame_count += 1

        # Lewati frame (kirim frame terakhir yang sudah dianotasi agar stream tetap mulus)
        if frame_count % FRAME_SKIP != 0:
            display_frame = last_annotated_frame if last_annotated_frame is not None else frame
            _, buffer = cv2.imencode('.jpg', display_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            continue

        if model is not None:
            # Kecilkan frame sebelum inference untuk hemat CPU
            small_frame = cv2.resize(frame, (0, 0), fx=SCALE, fy=SCALE)
            results = model(small_frame, verbose=False)
            result = results[0]

            # Skala balik anotasi ke ukuran asli
            annotated_small = result.plot()
            annotated_frame = cv2.resize(annotated_small, (frame.shape[1], frame.shape[0]))
            last_annotated_frame = annotated_frame

            # Simpan frame terbaru ke file agar bisa di-fetch frontend
            latest_frame_path = os.path.join(os.path.dirname(video_path), f"latest_{filename}.jpg")
            cv2.imwrite(latest_frame_path, annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])

            predictions = []
            for box in result.boxes:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                x1, y1, x2, y2 = [v / SCALE for v in box.xyxy[0].tolist()]
                predictions.append({
                    "class": class_name.lower(),
                    "confidence": float(box.conf[0]),
                    "bbox": [x1, y1, x2, y2]
                })

            evaluation = rule_engine.evaluate_compliance(predictions, required_ppe)

            # Update stats UI
            video_stats[filename] = {
                "status": "COMPLIANT" if evaluation["violation_count"] == 0 else "VIOLATION",
                "compliantCount": evaluation["compliant_count"],
                "violationCount": evaluation["violation_count"],
                "details": evaluation["violation_details"],
                "latestFrameUrl": f"/uploads/latest_{filename}.jpg"
            }

            # Tracking "Terparah" untuk ringkasan akhir
            if evaluation["violation_count"] >= max_violations:
                max_violations = evaluation["violation_count"]
                worst_evaluation = evaluation
                worst_frame = annotated_frame.copy()

            # SISTEM ALERT CCTV (Setiap 5 detik jika ada pelanggaran)
            if evaluation["violation_count"] > 0 and (current_time_ms - last_alert_time_ms) > 5000:
                try:
                    from services import azure_storage
                    alert_id = str(uuid.uuid4())
                    img_name = f"alert_{alert_id[:8]}.jpg"
                    img_path = os.path.join(os.path.dirname(video_path), img_name)
                    cv2.imwrite(img_path, annotated_frame)

                    azure_url = azure_storage.upload_image_to_azure(img_path)
                    final_path = azure_url if azure_url else f"/uploads/{img_name}"

                    db = database.SessionLocal()
                    new_alert = models.DetectionLog(
                        id=alert_id,
                        area_id=area_id,
                        image_path=final_path,
                        total_persons=evaluation["total_persons"],
                        compliant_count=evaluation["compliant_count"],
                        violation_count=evaluation["violation_count"],
                        violation_details=json.dumps(evaluation["violation_details"]),
                        confidence_score=0.0
                    )
                    db.add(new_alert)
                    db.commit()
                    db.close()
                    last_alert_time_ms = current_time_ms
                    print(f"🚨 ALERT UPLOADED TO {'AZURE' if azure_url else 'LOCAL'}")
                except Exception as e:
                    print(f"⚠️ Alert fail: {e}")
        else:
            annotated_frame = frame
            last_annotated_frame = frame

        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
               
    cap.release()
    
    # Update log utama di akhir video (Ringkasan)
    if log_id and worst_evaluation:
        try:
            from services import azure_storage
            db = database.SessionLocal()
            main_log = db.query(models.DetectionLog).filter(models.DetectionLog.id == log_id).first()
            if main_log:
                if worst_frame is not None and max_violations > 0:
                    sum_name = f"summary_{log_id[:8]}.jpg"
                    sum_path = os.path.join(os.path.dirname(video_path), sum_name)
                    cv2.imwrite(sum_path, worst_frame)
                    
                    # Upload ke Azure
                    azure_url = azure_storage.upload_image_to_azure(sum_path)
                    main_log.image_path = azure_url if azure_url else f"/uploads/{sum_name}"
                
                main_log.total_persons = worst_evaluation["total_persons"]
                main_log.compliant_count = worst_evaluation["compliant_count"]
                main_log.violation_count = worst_evaluation["violation_count"]
                main_log.violation_details = json.dumps(worst_evaluation["violation_details"])
                db.commit()
            db.close()
        except:
            pass

def mock_inference(image_path: str):
    import shutil
    annotated_path = image_path.replace(".", "_annotated.")
    shutil.copy(image_path, annotated_path)
    return {
        "predictions": [{"class": "person", "confidence": 0.9, "bbox": [0,0,100,100]}],
        "annotated_image_path": annotated_path
    }
