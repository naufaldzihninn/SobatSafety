import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Calendar, ArrowLeft, AlertTriangle, CheckCircle2, RefreshCw, ExternalLink, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllLogs, getFileUrl, deleteLog, deleteAllLogs } from '../api/client';
import clsx from 'clsx';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return;
    
    try {
      await deleteLog(logId);
      setLogs(logs.filter(log => log.id !== logId));
    } catch (error) {
      console.error('Failed to delete log:', error);
      alert('Gagal menghapus riwayat.');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SELURUH riwayat deteksi? Tindakan ini tidak dapat dibatalkan.')) return;
    
    try {
      setLoading(true);
      await deleteAllLogs();
      setLogs([]);
    } catch (error) {
      console.error('Failed to delete all logs:', error);
      alert('Gagal menghapus seluruh riwayat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Tidak ada data untuk di-export.");
      return;
    }

    // Header CSV
    const headers = ["ID", "Waktu", "Area", "Status", "Total Orang", "Pelanggaran"];
    
    // Data Baris
    const rows = filteredLogs.map(log => [
      log.id,
      log.time,
      log.area,
      log.status,
      log.persons,
      log.status === 'VIOLATION' ? (log.missing || "Ada Pelanggaran") : "Lengkap"
    ]);

    // Gabungkan Header dan Baris
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Buat file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `SafeWatch_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="text-action text-sm font-medium flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft size={14} /> Kembali ke Dashboard
          </Link>
          <h2 className="text-3xl font-bold text-primary">Riwayat Deteksi</h2>
          <p className="text-text-muted">Daftar lengkap seluruh aktivitas monitoring APD.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDeleteAll}
            disabled={logs.length === 0 || loading}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm",
              logs.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-50 border border-red-100 text-red-600 hover:bg-red-100"
            )}
          >
            <Trash2 size={16} /> Hapus Semua
          </button>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan area atau status..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-action/20 focus:border-action transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition-all">
            <Calendar size={16} /> Tanggal
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Area / Zona</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Temuan</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Petugas</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted italic">
                    <RefreshCw className="animate-spin inline-block mr-2" size={20} /> Memuat data...
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={log.id} 
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-text-dark">{log.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-dark font-semibold">{log.area}</div>
                      <div className="text-xs text-text-muted">{log.persons} Orang Terdeteksi</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                        log.status === 'COMPLIANT' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {log.status === 'COMPLIANT' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        {log.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-dark">
                        {log.status === 'VIOLATION' ? (
                          <span className="text-red-600 font-medium italic">Kurang: {log.missing}</span>
                        ) : (
                          <span className="text-text-muted italic">Lengkap</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text-dark font-medium">Supervisor AI</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => setSelectedImage(getFileUrl(log.imageUrl))}
                          className="inline-flex items-center gap-1 text-action hover:bg-action/10 px-3 py-1.5 rounded-lg transition-all text-xs font-bold border border-transparent hover:border-action/20"
                        >
                          Lihat Bukti <ExternalLink size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Hapus Riwayat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted italic">
                    Tidak ada riwayat ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-action" />
                <h3 className="font-bold text-text-dark">Bukti Deteksi APD</h3>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-900 flex items-center justify-center min-h-[300px]">
              <img 
                src={selectedImage} 
                alt="Evidence" 
                className="max-h-[80vh] w-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
