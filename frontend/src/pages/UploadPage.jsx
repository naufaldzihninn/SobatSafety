import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, MapPin, Loader2, CheckCircle, AlertOctagon, ShieldCheck, Maximize } from 'lucide-react';
import clsx from 'clsx';

import { getAreas, detectPPE, getFileUrl, getStreamStats } from '../api/client';

export default function UploadPage() {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getAreas().then(setAreas).catch(console.error);
  }, []);

  useEffect(() => {
    let interval;
    if (result?.isVideo && result?.filename) {
      interval = setInterval(async () => {
        try {
          const stats = await getStreamStats(result.filename);
          if (stats.status && stats.status !== 'LOADING...') {
            setResult(prev => ({
              ...prev,
              status: stats.status,
              compliantCount: stats.compliantCount,
              violationCount: stats.violationCount,
              details: stats.details || [],
              latestFrameUrl: stats.latestFrameUrl || prev?.latestFrameUrl
            }));
          }
        } catch (e) {
          console.error('Error fetching stats:', e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [result?.isVideo, result?.filename]);

  const toggleFullscreen = () => {
    const el = document.getElementById('video-stream-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null); // Reset result when new file is selected
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/'))) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !selectedArea) return;
    
    setIsUploading(true);
    try {
      const response = await detectPPE(file, selectedArea);
      setResult(response);
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat menghubungi server AI.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary mb-2">Deteksi Kepatuhan APD</h2>
        <p className="text-text-muted">Pilih area dan unggah foto atau rekaman video untuk mendeteksi kelengkapan APD menggunakan AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-dark mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-action" /> Pilih Area/Zona
            </label>
            <select 
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-action focus:border-action outline-none transition-all"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="" disabled>-- Pilih Area --</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>

          <div 
            className={clsx(
              "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-colors cursor-pointer relative overflow-hidden",
              previewUrl ? "border-action bg-action/5" : "border-gray-300 hover:border-action hover:bg-gray-50"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileUpload').click()}
          >
            <input 
              type="file" 
              id="fileUpload" 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
            
            {previewUrl ? (
              <div className="absolute inset-0 p-2">
                {file?.type?.startsWith('video/') ? (
                  <video src={previewUrl} className="w-full h-full object-contain rounded-xl" controls />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => document.getElementById('fileUpload').click()}>
                    <ImageIcon size={18} /> Ganti File
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <UploadCloud size={40} className="text-action" />
                </div>
                <h4 className="text-lg font-bold text-text-dark mb-1">Unggah Foto / Video</h4>
                <p className="text-sm text-text-muted text-center max-w-xs">
                  Drag and drop file di sini, atau klik untuk memilih file dari komputer.
                </p>
                <p className="text-xs text-gray-400 mt-4">Format: JPG, PNG, MP4 (Max 30MB)</p>
              </>
            )}
          </div>

          <button 
            disabled={!file || !selectedArea || isUploading}
            onClick={handleAnalyze}
            className={clsx(
              "mt-6 w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all",
              (!file || !selectedArea) 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-action hover:bg-blue-700 shadow-lg shadow-action/30 hover:shadow-xl hover:shadow-action/40"
            )}
          >
            {isUploading ? (
              <><Loader2 className="animate-spin" size={20} /> Memproses AI...</>
            ) : (
              <><ShieldCheck size={20} /> Analisis Sekarang</>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <h3 className="text-lg font-bold text-primary mb-6">Hasil Analisis</h3>
          
          {!result && !isUploading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={64} className="mb-4 opacity-20" />
              <p>Belum ada media yang dianalisis.</p>
              <p className="text-sm">Silakan unggah foto/video dan klik "Analisis Sekarang".</p>
            </div>
          ) : isUploading ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-action/20 border-t-action rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-action animate-pulse" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-text-dark mt-6 mb-2">AI sedang menganalisis...</h4>
              <p className="text-sm text-text-muted">Mendeteksi Helm, Rompi, dan Sarung Tangan.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col"
            >
              <div id="video-stream-container" className="w-full bg-gray-100 rounded-xl mb-6 relative overflow-hidden border border-gray-200 group" style={{minHeight: '12rem'}}>
                {result.isVideo ? (
                  <div className="flex flex-col gap-2 p-2">
                    {/* Video asli dari file lokal - smooth 100% */}
                    <div className="relative">
                      <video
                        src={previewUrl}
                        className="w-full rounded-lg object-contain max-h-40"
                        autoPlay
                        loop
                        muted
                      />
                      <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
                      </div>
                    </div>
                    {/* Frame teranotasi terbaru dari AI */}
                    {result.latestFrameUrl && (
                      <div className="relative">
                        <img
                          key={result.latestFrameUrl + Date.now()}
                          src={getFileUrl(result.latestFrameUrl) + '?t=' + Date.now()}
                          alt="AI Detection Frame"
                          className="w-full rounded-lg object-contain max-h-40"
                        />
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          🤖 AI Detection
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <img src={getFileUrl(result.imageUrl) || previewUrl} alt="Annotated Result" className="w-full h-full max-h-48 object-contain" />
                )}

                <button onClick={toggleFullscreen} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                   <Maximize size={16} />
                </button>
              </div>

              {/* Status Summary */}
              <div className={clsx(
                "p-4 rounded-xl border mb-6 flex items-center gap-4",
                result.status === 'COMPLIANT' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
              )}>
                {result.status === 'COMPLIANT' ? <CheckCircle size={32} /> : <AlertOctagon size={32} />}
                <div>
                  <h4 className="font-bold text-lg">Status: {result.status}</h4>
                  <p className="text-sm opacity-80">
                    {result.status === 'COMPLIANT' ? "Semua pekerja memakai APD lengkap." : "Ditemukan pelanggaran APD!"}
                  </p>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-text-muted mb-1">COMPLIANT</p>
                  <p className="text-2xl font-bold text-green-600">{result.compliantCount} Orang</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-text-muted mb-1">VIOLATION</p>
                  <p className="text-2xl font-bold text-red-600">{result.violationCount} Orang</p>
                </div>
              </div>

              {/* Violation Details (if any) */}
              {result.violationCount > 0 && (
                <div>
                  <h5 className="font-bold text-text-dark mb-3 text-sm">Detail Pelanggaran:</h5>
                  <ul className="space-y-2">
                    {result.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-text-dark bg-white border border-red-100 p-3 rounded-lg shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        Orang {detail.person} kurang: <span className="font-bold text-red-600">{detail.missing.join(', ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
