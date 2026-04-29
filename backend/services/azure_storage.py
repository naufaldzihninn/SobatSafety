import os
from azure.storage.blob import BlobServiceClient, ContentSettings
from dotenv import load_dotenv

load_dotenv()

# Konfigurasi dari Environment Variables
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME", "evidences")

def upload_image_to_azure(file_path):
    """
    Mengunggah file gambar ke Azure Blob Storage.
    Jika Connection String tidak ada, fungsi akan mengembalikan path lokal (fallback).
    """
    if not AZURE_CONNECTION_STRING:
        print("⚠️ Azure Connection String tidak ditemukan. Menggunakan penyimpanan lokal.")
        return None

    try:
        filename = os.path.basename(file_path)
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        blob_client = blob_service_client.get_blob_client(container=AZURE_CONTAINER_NAME, blob=filename)

        # Tambahkan content_settings agar file dikenali sebagai gambar (mencegah auto-download)
        content_settings = ContentSettings(content_type='image/jpeg')

        with open(file_path, "rb") as data:
            blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)
        
        # Kembalikan URL publik dari Blob
        return blob_client.url
    except Exception as e:
        print(f"❌ Gagal mengunggah ke Azure: {e}")
        return None
