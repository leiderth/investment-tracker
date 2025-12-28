// frontend/src/pages/Investments.jsx

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, DollarSign, RefreshCw, History, X } from 'lucide-react';
import { getInvestments, createInvestment, deleteInvestment } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import UpdateValueModal from '../components/investments/UpdateValueModal';
import TransactionsModal from '../components/investments/TransactionsModal';
import { exportToExcel } from '../utils/export';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'CDT',
    platform: '',
    initial_amount: '',
    current_amount: '',
    expected_return: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const response = await getInvestments();
      setInvestments(response.data.investments || []);
    } catch (error) {
      console.error('Error al cargar inversiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createInvestment({
        type: formData.type,
        platform: formData.platform,
        initialAmount: parseFloat(formData.initial_amount),
        expectedReturn: formData.expected_return ? parseFloat(formData.expected_return) : null,
        startDate: formData.start_date,
        endDate: formData.end_date || null,
        notes: formData.notes || null
      });
      
      setShowCreateForm(false);
      setFormData({
        type: 'CDT',
        platform: '',
        initial_amount: '',
        current_amount: '',
        expected_return: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
      loadInvestments();
    } catch (error) {
      console.error('Error al crear inversión:', error);
      alert(error.response?.data?.error || 'Error al crear la inversión');
    }
  };

  const handleCloseInvestment = async (id) => {
    if (window.confirm('¿Estás seguro de cerrar esta inversión?')) {
      try {
        await deleteInvestment(id);
        loadInvestments();
      } catch (error) {
        console.error('Error al cerrar inversión:', error);
        alert('Error al cerrar la inversión');
      }
    }
  };

  const handleOpenTransactions = (investment) => {
    setSelectedInvestment(investment);
    setShowTransactionsModal(true);
  };

  const handleCloseTransactions = () => {
    setShowTransactionsModal(false);
    setSelectedInvestment(null);
  };

  const handleTransactionSuccess = () => {
    loadInvestments();
  };

  const handleExport = () => {
    exportToExcel(investments, 'mis_inversiones');
  };

  // Filtrar inversiones según el estado seleccionado
  const filteredInvestments = investments.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'active') return inv.status === 'active';
    if (filter === 'closed') return inv.status === 'closed';
    return true;
  });

  const getInvestmentEmoji = (type) => {
    const emojis = {
      'CDT': '🏦',
      'acciones': '📈',
      'ETF': '📊',
      'cripto': '₿',
      'negocio': '💼',
      'otro': '💰'
    };
    return emojis[type] || '💰';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inversiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Inversiones</h1>
        <p className="text-gray-600">Gestiona tu portafolio de inversiones</p>
      </div>

      {/* Filtros y acciones */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({investments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas ({investments.filter(i => i.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'closed'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cerradas ({investments.filter(i => i.status === 'closed').length})
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Nueva Inversión
          </button>
        </div>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Nueva Inversión</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="CDT">🏦 CDT</option>
                <option value="acciones">📈 Acciones</option>
                <option value="ETF">📊 ETF</option>
                <option value="cripto">₿ Criptomonedas</option>
                <option value="negocio">💼 Negocio</option>
                <option value="otro">💰 Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Plataforma</label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Bancolombia, Binance, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monto Inicial</label>
              <input
                type="number"
                step="0.01"
                value={formData.initial_amount}
                onChange={(e) => setFormData({ ...formData, initial_amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rendimiento Esperado (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.expected_return}
                onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: 12.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Inicio</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Vencimiento (Opcional)</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Notas (Opcional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="3"
                placeholder="Añade notas sobre esta inversión..."
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
              >
                Crear Inversión
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de inversiones */}
      {filteredInvestments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay inversiones {filter !== 'all' && filter}
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza a registrar tus inversiones para trackear tu patrimonio
          </p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Crear Primera Inversión</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-l-4"
              style={{
                borderLeftColor: inv.profit_loss >= 0 ? '#10b981' : '#ef4444'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getInvestmentEmoji(inv.type)}</span>
                    <h3 className="font-bold text-lg text-gray-900">{inv.platform}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{inv.type}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    inv.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {inv.status === 'active' ? 'Activa' : 'Cerrada'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor Actual</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(inv.current_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capital Inicial</span>
                  <span className="text-sm text-gray-900">
                    {formatCurrency(inv.initial_amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ganancia/Pérdida</span>
                  <span
                    className={`font-semibold ${
                      inv.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {inv.profit_loss >= 0 ? '+' : ''}
                    {formatCurrency(inv.profit_loss)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rendimiento</span>
                  <span
                    className={`font-semibold ${
                      inv.actual_return_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {inv.actual_return_percentage >= 0 ? '+' : ''}
                    {inv.actual_return_percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Calendar size={14} />
                  <span>{formatDate(inv.start_date)}</span>
                </div>
              </div>

              {inv.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedInvestment(inv);
                      setShowUpdateModal(true);
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <RefreshCw size={16} />
                    Actualizar
                  </button>

                  <button
                    onClick={() => handleOpenTransactions(inv)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                  >
                    <History size={16} />
                    Transacciones
                  </button>

                  <button
                    onClick={() => handleCloseInvestment(inv.id)}
                    className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de actualización de valor */}
      {showUpdateModal && selectedInvestment && (
        <UpdateValueModal
          investment={selectedInvestment}
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedInvestment(null);
          }}
          onSuccess={loadInvestments}
        />
      )}

      {/* Modal de transacciones */}
      {showTransactionsModal && selectedInvestment && (
        <TransactionsModal
          investment={selectedInvestment}
          isOpen={showTransactionsModal}
          onClose={handleCloseTransactions}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
}