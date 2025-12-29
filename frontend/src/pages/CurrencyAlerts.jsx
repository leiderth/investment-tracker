import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';

export default function CurrencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    from_currency: 'USD',
    to_currency: 'COP',
    alert_type: 'above',
    target_value: ''
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/currency/alerts');
      setAlerts(response.data.data || []);
    } catch (err) {
      setError('Error cargando alertas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.target_value) {
      setError('El valor objetivo es requerido');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/currency/alerts/${editingId}`, {
          alert_type: formData.alert_type,
          target_value: parseFloat(formData.target_value)
        });
      } else {
        await api.post('/currency/alerts', {
          from_currency: formData.from_currency,
          to_currency: formData.to_currency,
          alert_type: formData.alert_type,
          target_value: parseFloat(formData.target_value)
        });
      }

      setFormData({
        from_currency: 'USD',
        to_currency: 'COP',
        alert_type: 'above',
        target_value: ''
      });
      setEditingId(null);
      setShowForm(false);
      await loadAlerts();
    } catch (err) {
      setError('Error guardando alerta: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta alerta?')) return;

    try {
      await api.delete(`/currency/alerts/${id}`);
      await loadAlerts();
    } catch (err) {
      setError('Error eliminando alerta: ' + err.message);
    }
  };

  const handleEdit = (alert) => {
    setFormData({
      from_currency: alert.from_currency,
      to_currency: alert.to_currency,
      alert_type: alert.alert_type,
      target_value: alert.target_value
    });
    setEditingId(alert.id);
    setShowForm(true);
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'above':
        return 'Mayor que (≥)';
      case 'below':
        return 'Menor que (≤)';
      case 'change_percent':
        return 'Cambio %';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Alertas de Tasas</h1>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  from_currency: 'USD',
                  to_currency: 'COP',
                  alert_type: 'above',
                  target_value: ''
                });
                setShowForm(!showForm);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Nueva Alerta
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Editar Alerta' : 'Crear Nueva Alerta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!editingId && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Moneda Base
                      </label>
                      <input
                        type="text"
                        value={formData.from_currency}
                        onChange={(e) => setFormData({ ...formData, from_currency: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="USD"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Moneda Destino
                      </label>
                      <input
                        type="text"
                        value={formData.to_currency}
                        onChange={(e) => setFormData({ ...formData, to_currency: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                        placeholder="COP"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Alerta
                  </label>
                  <select
                    value={formData.alert_type}
                    onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  >
                    <option value="above">Mayor que (≥)</option>
                    <option value="below">Menor que (≤)</option>
                    <option value="change_percent">Cambio Porcentual (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {formData.alert_type === 'change_percent' ? 'Cambio %' : 'Valor Objetivo'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="3500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No hay alertas configuradas</p>
              <p className="text-gray-500 text-sm mt-2">Crea una alerta para recibir notificaciones sobre cambios en tasas</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                        alert.is_active ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {alert.is_active ? 'Activa' : 'Inactiva'}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {alert.from_currency} → {alert.to_currency}
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-gray-600">Tipo</p>
                        <p className="font-semibold text-gray-800">{getAlertTypeLabel(alert.alert_type)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Valor Objetivo</p>
                        <p className="font-semibold text-gray-800">{alert.target_value}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Último Disparo</p>
                        <p className="font-semibold text-gray-800">
                          {alert.last_triggered_at ? new Date(alert.last_triggered_at).toLocaleDateString() : 'Nunca'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(alert)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
