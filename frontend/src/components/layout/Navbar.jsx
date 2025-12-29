import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, TrendingUp, User, Target, Zap, BarChart3, Globe, LineChart, Bell, Moon, Sun, MessageCircle, Newspaper, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { profileAPI } from '../../services/api';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  // Load profile picture on mount and when user changes
  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        if (user?.id) {
          // Try to load the picture directly
          const pictureUrl = `http://localhost:5000/api/profile/picture/${user.id}`;
          
          // Check if the picture exists by trying to fetch it
          const response = await fetch(pictureUrl);
          if (response.ok) {
            setProfilePicture(pictureUrl + '?t=' + Date.now()); // Add timestamp to avoid cache
          } else {
            setProfilePicture(null);
          }
        }
      } catch (error) {
        console.log('No profile picture available');
        setProfilePicture(null);
      }
    };

    loadProfilePicture();
  }, [user?.id]);

  // Listen for profile updates (you can trigger this from Profile page)
  useEffect(() => {
    const handleProfileUpdate = () => {
      // Reload picture when profile is updated
      if (user?.id) {
        const pictureUrl = `http://localhost:5000/api/profile/picture/${user.id}?t=${Date.now()}`;
        fetch(pictureUrl)
          .then(res => res.ok && setProfilePicture(pictureUrl))
          .catch(() => setProfilePicture(null));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user?.id]);

  console.log('🎨 Navbar rendered. isDark:', isDark);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    console.log('🖱️ Theme button clicked! isDark was:', isDark);
    toggleTheme();
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                <TrendingUp size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
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
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              to="/investments"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/investments')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Inversiones</span>
            </Link>

            <Link
              to="/goals"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/goals')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Target size={20} />
              <span className="font-medium">Metas</span>
            </Link>

            <Link
              to="/simulations"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/simulations')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Zap size={20} />
              <span className="font-medium">Simuladores</span>
            </Link>

            <Link
              to="/currency"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/currency')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Globe size={20} />
              <span className="font-medium">Monedas</span>
            </Link>

            <Link
              to="/trends"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/trends')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LineChart size={20} />
              <span className="font-medium">Tendencias</span>
            </Link>

            <Link
              to="/alerts"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/alerts')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Bell size={20} />
              <span className="font-medium">Alertas</span>
            </Link>

            <Link
              to="/portfolio-analysis"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/portfolio-analysis')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <BarChart3 size={20} />
              <span className="font-medium">Análisis</span>
            </Link>

            <Link
              to="/chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/chat')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <MessageCircle size={20} />
              <span className="font-medium">FinanceGPT</span>
            </Link>

            <Link
              to="/market"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/market')
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Newspaper size={20} />
              <span className="font-medium">Mercado</span>
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
              {/* Dark Mode Toggle */}
              <button
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-400"
                title="Toggle dark mode"
                type="button"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Foto de perfil"
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
                      onError={() => setProfilePicture(null)}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-full">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <ChevronDown size={16} className={`text-gray-600 dark:text-gray-400 transition ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Foto de perfil"
                          className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                          onError={() => setProfilePicture(null)}
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-full">
                          <User size={18} className="text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || 'Usuario'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <a
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <User size={16} />
                      <span className="text-sm">Mi Perfil</span>
                    </a>

                    <a
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <Settings size={16} />
                      <span className="text-sm">Configuración</span>
                    </a>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition text-left"
                    >
                      <LogOut size={16} />
                      <span className="text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}