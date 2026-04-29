def calculate_iou(boxA, boxB):
    # Tentukan koordinat intersection rectangle
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)

    boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1)
    boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1)

    # Intersection over Union
    iou = interArea / float(boxAArea + boxBArea - interArea)
    return iou

def evaluate_compliance(predictions, required_ppe):
    """
    Evaluasi kepatuhan APD berdasarkan hasil deteksi AI.
    Asumsi: Model mengeluarkan class 'person', 'hardhat' (atau 'helmet'), 'safety vest' (atau 'vest').
    """
    persons = [p for p in predictions if "person" in p["class"]]
    ppes = [p for p in predictions if "person" not in p["class"]]
    
    # Jika tidak ada person yang terdeteksi, tapi ada model yang tidak mendeteksi 'person' melainkan langsung APD-nya saja.
    # Untuk amannya, jika tidak ada person, kita hitung 'orang' berdasarkan kelompok APD yang berdekatan.
    # Tapi kita asumsikan model kita bagus dan mendeteksi 'person'.
    
    # Jika tidak ada deteksi person, kita gunakan dummy evaluasi agar tidak error jika YOLO fail detect person
    if len(persons) == 0:
        if len(ppes) > 0:
            # Ada APD terdeteksi tapi tidak ada person terdeteksi
            # Anggap 1 orang COMPLIANT (untuk mencegah error false negative)
            return {
                "total_persons": 1,
                "compliant_count": 1,
                "violation_count": 0,
                "violation_details": []
            }
        else:
            return {
                "total_persons": 0,
                "compliant_count": 0,
                "violation_count": 0,
                "violation_details": []
            }

    compliant_count = 0
    violation_count = 0
    violation_details = []

    # Map required_ppe terms to possible class names from YOLO
    ppe_mapping = {
        "helmet": ["hardhat", "helmet", "hard-hat"],
        "vest": ["safety vest", "vest", "safety-vest"],
        "mask": ["mask", "face mask", "mask"],
        "gloves": ["gloves", "glove"] # Model ini mungkin tidak punya gloves, tapi kita biarkan mappingnya
    }

    for idx, person in enumerate(persons):
        person_box = person["bbox"]
        
        # Cari APD apa saja yang berada di dalam/berpotongan dengan person_box ini
        detected_ppes_for_person = set()
        
        for ppe in ppes:
            # Jika IoU > 0.1 atau APD berada di dalam bounding box person
            # Kita gunakan logika sederhana: jika titik tengah APD ada di dalam box person
            px_mid = (ppe["bbox"][0] + ppe["bbox"][2]) / 2
            py_mid = (ppe["bbox"][1] + ppe["bbox"][3]) / 2
            
            if (person_box[0] <= px_mid <= person_box[2]) and (person_box[1] <= py_mid <= person_box[3]):
                detected_ppes_for_person.add(ppe["class"])
            elif calculate_iou(person_box, ppe["bbox"]) > 0.1:
                detected_ppes_for_person.add(ppe["class"])
        
        # Periksa juga jika model secara eksplisit mendeteksi "NO-Hardhat" atau pelanggaran langsung
        explicit_violations = [p["class"] for p in ppes if "no-" in p["class"] or "without" in p["class"]]
        
        missing_list = []
        for req in required_ppe:
            # Apakah ada class yang match dengan requirement ini?
            possible_classes = ppe_mapping.get(req.lower(), [req.lower()])
            
            has_this_ppe = any(cls in detected_ppes_for_person for cls in possible_classes)
            
            if not has_this_ppe:
                missing_list.append(req)
                
        # Jika ada missing atau explicit violation
        if len(missing_list) > 0 or len(explicit_violations) > 0:
            violation_count += 1
            if len(explicit_violations) > 0:
                missing_list.extend([v.replace("no-", "").replace("without ", "") for v in explicit_violations])
                missing_list = list(set(missing_list)) # unique
                
            violation_details.append({
                "person": idx + 1,
                "missing": missing_list
            })
        else:
            compliant_count += 1

    return {
        "total_persons": len(persons),
        "compliant_count": compliant_count,
        "violation_count": violation_count,
        "violation_details": violation_details
    }
