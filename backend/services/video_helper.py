import cv2
import os

def extract_frame_from_video(video_path, output_image_path):
    # Buka video
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise Exception("Tidak dapat membuka video.")
        
    # Ambil total frame
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # Ambil frame di pertengahan video (agar lebih representatif)
    target_frame = total_frames // 2
    
    cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
    ret, frame = cap.read()
    
    if ret:
        cv2.imwrite(output_image_path, frame)
    else:
        # Fallback ke frame pertama jika gagal
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        ret, frame = cap.read()
        if ret:
            cv2.imwrite(output_image_path, frame)
            
    cap.release()
    return output_image_path
