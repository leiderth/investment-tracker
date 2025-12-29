import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileAPI } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);

  // Form data for profile info
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
    birth_date: '',
    occupation: '',
  });

  // Form data for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Cargar perfil al montar componente
  useEffect(() => {
    loadProfile();
    loadSecurityLogs();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfileData(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        city: response.data.user.city || '',
        country: response.data.user.country || '',
        bio: response.data.user.bio || '',
        birth_date: response.data.user.birth_date ? response.data.user.birth_date.split('T')[0] : '',
        occupation: response.data.user.occupation || '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error al cargar el perfil' });
    }
  };

  const loadSecurityLogs = async () => {
    try {
      const response = await profileAPI.getSecurityLogs();
      setSecurityLogs(response.data.logs || []);
    } catch (error) {
      console.error('Error cargando logs de seguridad:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicturePreview) return;

    setLoading(true);
    try {
      const formDataObj = new FormData();
      const fileInput = document.getElementById('picture-input');
      formDataObj.append('picture', fileInput.files[0]);

      const response = await profileAPI.uploadProfilePicture(formDataObj);
      console.log('✅ Foto uploadada:', response.data);
      
      setMessage({ type: 'success', text: '✅ Foto de perfil actualizada' });
      setProfilePicturePreview(null);
      
      // Clear file input
      fileInput.value = '';
      
      // Reload profile
      await loadProfile();
      
      // Trigger navbar update
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('❌ Error:', error);
      setMessage({ type: 'error', text: '❌ Error al subir la foto: ' + (error.response?.data?.error || error.message) });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await profileAPI.updateProfile(formData);
      setMessage({ type: 'success', text: '✅ Perfil actualizado correctamente' });
      setIsEditing(false);
      setProfileData(response.data.user);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '❌ Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ La contraseña debe tener al menos 6 caracteres' });
      setLoading(false);
      return;
    }

    try {
      const response = await profileAPI.changePassword(passwordData);
      setMessage({ type: 'success', text: response.data.message });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      loadSecurityLogs();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || '❌ Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mi Perfil</h1>
        <p className="text-gray-600 dark:text-gray-400">Gestiona tu información personal y configuración de seguridad</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-4 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={20} />
            Información Personal
          </div>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 font-medium transition border-b-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock size={20} />
            Seguridad
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        
        {/* Information Tab */}
        {activeTab === 'info' && (
          <div>
            {/* Profile Picture */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Foto de Perfil</h3>
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-4 border-indigo-200 dark:border-indigo-900">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white" />
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    id="picture-input"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('picture-input').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    <Upload size={18} />
                    Seleccionar Foto
                  </button>
                  {profilePicturePreview && (
                    <button
                      onClick={handleUploadProfilePicture}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
                    >
                      <Save size={18} />
                      {loading ? 'Subiendo...' : 'Guardar Foto'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Personal</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition"
                  >
                    Editar
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg outline-none cursor-not-allowed opacity-50"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El email no puede ser modificado</p>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="+57 3XX XXX XXXX"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Ocupación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Ej: Analista Financiero"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ciudad
                    </label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Bogotá"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* País */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Colombia"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Biografía
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Cuéntanos sobre ti..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition"
                    >
                      <Save size={18} />
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        loadProfile();
                      }}
                      className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change Password Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cambiar Contraseña</h3>

              <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 6 caracteres, con mayúsculas y números</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                >
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>

            {/* Security Tips */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 Consejos de Seguridad</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li>✓ Usa una contraseña fuerte con mayúsculas, minúsculas y números</li>
                <li>✓ No compartas tu contraseña con nadie</li>
                <li>✓ Cambia tu contraseña regularmente (cada 3 meses)</li>
                <li>✓ Usa contraseñas únicas para cada cuenta importante</li>
                <li>✓ Cierra sesión en dispositivos que no uses frecuentemente</li>
              </ul>
            </div>

            {/* Security Logs */}
            {securityLogs.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad de Seguridad</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {securityLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {log.action.replace('_', ' ').toUpperCase()}
                          </p>
                          {log.ip_address && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">IP: {log.ip_address}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
