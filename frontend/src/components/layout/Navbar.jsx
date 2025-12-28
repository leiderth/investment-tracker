import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, TrendingUp, User, Target, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">
                InvestTracker
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/dashboard')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/investments"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/investments')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Inversiones</span>
            </Link>

            <Link
              to="/goals"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/goals')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Target size={20} />
              <span className="font-medium">Metas</span>
            </Link>

            <Link
              to="/simulations"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/simulations')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Zap size={20} />
              <span className="font-medium">Simulaciones</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l">
              <div className="flex items-center gap-2 text-gray-700">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <User size={18} />
                </div>
                <span className="font-medium">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
              >
                <LogOut size={18} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}