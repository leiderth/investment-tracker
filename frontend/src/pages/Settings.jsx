import React, { useState } from 'react';
import { Bell, Lock, Globe, Palette, Database, Save, ToggleRight, ToggleLeft } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    // General
    language: 'es',
    currency: 'COP',
    timezone: 'America/Bogota',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    priceAlerts: true,
    milestoneAlerts: true,

    // Privacy
    profilePrivate: false,
    showPortfolioValue: true,
    allowAnalytics: true,

    // Display
    darkMode: isDark,
    compactView: false,
    animationsEnabled: true,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: '✅ Configuración guardada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error al guardar la configuración' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">Personaliza tu experiencia en InvestTracker</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'general', label: 'General', icon: Globe },
          { id: 'notifications', label: 'Notificaciones', icon: Bell },
          { id: 'display', label: 'Apariencia', icon: Palette },
          { id: 'privacy', label: 'Privacidad', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-4 font-medium transition border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración General</h3>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleSelectChange}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda Predeterminada
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleSelectChange}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
              >
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="BRL">BRL - Real Brasileño</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleSelectChange}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
              >
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/New_York">Nueva York (UTC-5)</option>
                <option value="Europe/London">Londres (UTC+0)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
                <option value="Asia/Tokyo">Tokio (UTC+9)</option>
              </select>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferencias de Notificaciones</h3>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe actualizaciones importantes por email</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailNotifications')}
                className="text-2xl transition"
              >
                {settings.emailNotifications ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notificaciones Push</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibe notificaciones en el navegador</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('pushNotifications')}
                className="text-2xl transition"
              >
                {settings.pushNotifications ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Weekly Reports */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Reportes Semanales</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Resumen semanal de tu portafolio</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('weeklyReports')}
                className="text-2xl transition"
              >
                {settings.weeklyReports ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Price Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Alertas de Precio</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones cuando los precios cambian</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('priceAlerts')}
                className="text-2xl transition"
              >
                {settings.priceAlerts ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Milestone Alerts */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Alertas de Hitos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notificaciones al alcanzar objetivos</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('milestoneAlerts')}
                className="text-2xl transition"
              >
                {settings.milestoneAlerts ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Display Settings */}
        {activeTab === 'display' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferencias de Apariencia</h3>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modo Oscuro</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Activar tema oscuro para toda la aplicación</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleToggle('darkMode');
                  toggleTheme();
                }}
                className="text-2xl transition"
              >
                {settings.darkMode ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Compact View */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Vista Compacta</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mostrar más información en menos espacio</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('compactView')}
                className="text-2xl transition"
              >
                {settings.compactView ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Animations */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Animaciones</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Habilitar transiciones y animaciones</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('animationsEnabled')}
                className="text-2xl transition"
              >
                {settings.animationsEnabled ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuración de Privacidad</h3>

            {/* Profile Private */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Perfil Privado</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Solo tú podrás ver tu perfil</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('profilePrivate')}
                className="text-2xl transition"
              >
                {settings.profilePrivate ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Show Portfolio Value */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Mostrar Valor del Portafolio</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Permitir que otros vean el valor de tu portafolio</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('showPortfolioValue')}
                className="text-2xl transition"
              >
                {settings.showPortfolioValue ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Análisis Anónimos</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ayudarnos a mejorar compartiendo datos anónimos</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowAnalytics')}
                className="text-2xl transition"
              >
                {settings.allowAnalytics ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-gray-400">✗</span>
                )}
              </button>
            </div>

            {/* GDPR Notice */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                📋 Tus datos están protegidos según GDPR. <a href="#" className="underline hover:no-underline">Ver política de privacidad</a>
              </p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
}
