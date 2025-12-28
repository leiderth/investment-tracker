import { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle, Trash2 } from 'lucide-react';
import { createTransaction, getTransactions, deleteTransaction } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

export default function TransactionsModal({ investment, isOpen, onClose, onSuccess }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    type: 'deposit',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Cargar transacciones al abrir el modal
  useEffect(() => {
    if (isOpen && investment) {
      loadTransactions();
    }
  }, [isOpen, investment]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions(investment.id);
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
      setError('Error al cargar el historial de transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await createTransaction(investment.id, formData);
      
      // Recargar transacciones
      await loadTransactions();
      
      // Notificar al componente padre
      if (onSuccess) onSuccess();
      
      // Resetear formulario
      setFormData({
        type: 'deposit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setShowForm(false);
      
    } catch (err) {
      console.error('Error al crear transacción:', err);
      setError(err.response?.data?.error || 'Error al registrar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteTransaction(transactionId);
      await loadTransactions();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al eliminar transacción:', err);
      setError(err.response?.data?.error || 'Error al eliminar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return <TrendingUp className="text-green-500" size={20} />;
      case 'withdrawal': return <TrendingDown className="text-red-500" size={20} />;
      case 'dividend': return <DollarSign className="text-blue-500" size={20} />;
      case 'fee': return <AlertCircle className="text-orange-500" size={20} />;
      default: return null;
    }
  };

  const getTransactionLabel = (type) => {
    const labels = {
      deposit: 'Aporte adicional',
      withdrawal: 'Retiro parcial',
      dividend: 'Dividendo/Interés',
      fee: 'Comisión/Fee'
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'text-green-600',
      withdrawal: 'text-red-600',
      dividend: 'text-blue-600',
      fee: 'text-orange-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Transacciones</h2>
              <p className="text-indigo-100 mt-1">
                {investment.platform} - {investment.type}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón agregar transacción */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              <span>Agregar Transacción</span>
            </button>
          )}

          {/* Formulario */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-indigo-200">
              <h3 className="font-semibold text-lg mb-4">Nueva Transacción</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="deposit">➕ Aporte adicional</option>
                    <option value="withdrawal">➖ Retiro parcial</option>
                    <option value="dividend">💰 Dividendo/Interés</option>
                    <option value="fee">⚠️ Comisión/Fee</option>
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium mb-2">Monto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Fecha */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-2">Descripción (opcional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Pago de intereses trimestrales"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Transacción'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Lista de transacciones */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span>Historial de Transacciones</span>
              <span className="text-sm text-gray-500">({transactions.length})</span>
            </h3>

            {loading && !showForm ? (
              <div className="text-center py-8 text-gray-500">
                Cargando transacciones...
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign size={48} className="mx-auto mb-2 opacity-50" />
                <p>No hay transacciones registradas</p>
                <p className="text-sm">Agrega la primera transacción para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 bg-white border rounded-lg hover:shadow-md transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gray-50 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {getTransactionLabel(transaction.type)}
                          </span>
                          <span className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'withdrawal' || transaction.type === 'fee' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.description && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{transaction.description}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-1">
                          Balance después: {formatCurrency(transaction.balance_after)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={loading}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                      title="Eliminar transacción"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}