import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, User, Lock, Loader2, AlertCircle } from 'lucide-react';
import { login } from '../api/client';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = await login(username, password);
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal login. Periksa koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-action/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 text-center bg-gradient-to-br from-primary to-blue-800 text-white">
            <div className="inline-flex bg-white/20 p-4 rounded-2xl mb-6 backdrop-blur-md">
              <ShieldCheck size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">SobatSafety</h1>
            <p className="text-blue-100 opacity-80">Monitoring Keselamatan Kerja Cerdas</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="admincihuyy"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-action focus:border-action outline-none transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-action focus:border-action outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-text-muted cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-action focus:ring-action" />
                Ingat saya
              </label>
              <a href="#" className="text-action font-medium hover:underline">Lupa password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-action hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-action/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> Memverifikasi...</>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-text-muted">
                Bukan anggota tim? <a href="#" className="text-action font-semibold">Hubungi Admin</a>
              </p>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-text-muted text-sm">
          &copy; 2026 SobatSafety. Powered by Microsoft Azure & YOLOv8.
        </p>
      </motion.div>
    </div>
  );
}
