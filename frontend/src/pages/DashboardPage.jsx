import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShieldCheck, AlertTriangle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../api/client';
import clsx from 'clsx';

const mockTrendData = [
  { name: 'Senin', violations: 12 },
  { name: 'Selasa', violations: 8 },
  { name: 'Rabu', violations: 15 },
  { name: 'Kamis', violations: 5 },
  { name: 'Jumat', violations: 9 },
  { name: 'Sabtu', violations: 2 },
  { name: 'Minggu', violations: 4 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="animate-spin text-action" size={48} />
      </div>
    );
  }

  const dashboardData = stats || {
    totalPemeriksaan: 0,
    compliant: 0,
    violation: 0,
    complianceRate: 0,
    recentLogs: [],
    trend: []
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Dashboard Overview</h2>
          <p className="text-text-muted">Pantau tingkat kepatuhan APD secara real-time.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <Clock size={18} className="text-action" />
            <span className="text-sm font-medium">
              Update: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button 
            onClick={fetchStats}
            className="text-xs text-action hover:underline flex items-center gap-1"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Pemeriksaan" 
          value={dashboardData.totalPemeriksaan.toString()} 
          subtitle="Orang terdeteksi"
          icon={Users} 
          colorClass="bg-blue-100 text-blue-600"
          delay={0.1}
        />
        <StatCard 
          title="COMPLIANT" 
          value={dashboardData.compliant.toString()} 
          subtitle={`Sesuai standar (${dashboardData.complianceRate}%)`}
          icon={ShieldCheck} 
          colorClass="bg-green-100 text-green-600"
          delay={0.2}
        />
        <StatCard 
          title="VIOLATION" 
          value={dashboardData.violation.toString()} 
          subtitle="Tidak lengkap"
          icon={AlertTriangle} 
          colorClass="bg-red-100 text-red-600"
          delay={0.3}
        />
        <StatCard 
          title="Compliance Rate" 
          value={`${dashboardData.complianceRate}%`} 
          subtitle={
            <span className={clsx(
              "flex items-center",
              dashboardData.complianceRate > 80 ? "text-green-600" : "text-amber-600"
            )}>
              {dashboardData.complianceRate > 80 ? "Sangat Baik" : "Perlu Evaluasi"}
            </span>
          }
          icon={TrendingUp} 
          colorClass="bg-primary/10 text-primary"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold mb-6 text-primary">Tren Pelanggaran (7 Hari Terakhir)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViolation" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C00000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C00000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1F4E79' }}
                />
                <Area type="monotone" dataKey="violations" stroke="#C00000" strokeWidth={3} fillOpacity={1} fill="url(#colorViolation)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-primary">Log Terbaru</h3>
            <Link to="/logs" className="text-action text-sm font-medium hover:underline">Lihat Semua</Link>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {dashboardData.recentLogs.length > 0 ? (
              dashboardData.recentLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-text-dark">{log.area}</span>
                    <span className="text-xs text-text-muted bg-gray-100 px-2 py-1 rounded-md">{log.time}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded-full font-bold",
                      log.status === 'COMPLIANT' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {log.status}
                    </span>
                    <span className="text-xs text-text-muted">{log.persons} Orang</span>
                  </div>
                  {log.status === 'VIOLATION' && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                      <AlertTriangle size={12} /> Kurang: {log.missing}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-muted italic text-sm">
                Belum ada data deteksi hari ini.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
