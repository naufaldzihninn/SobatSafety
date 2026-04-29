import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, UploadCloud, History, LogOut, User } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import LogsPage from './pages/LogsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('safewatch_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('safewatch_user', JSON.stringify(userData));
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('safewatch_user');
    navigate('/login');
  };

  if (isAuthLoading) return null;

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Deteksi APD', path: '/upload', icon: UploadCloud },
    { name: 'Riwayat', path: '/logs', icon: History },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col shadow-sm z-10">
        <div className="p-6 flex items-center gap-3 text-primary border-b border-gray-100">
          <div className="bg-primary/10 p-2 rounded-xl">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">SobatSafety</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const activeClass = isActive
              ? 'bg-action text-white shadow-md shadow-action/30'
              : 'text-text-dark hover:bg-gray-100';

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${activeClass}`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'text-text-muted'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-text-dark truncate">{user.name}</p>
              <p className="text-xs text-text-muted truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all font-medium"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-action/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="p-8 max-w-7xl mx-auto h-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
