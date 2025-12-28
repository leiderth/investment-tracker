import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency, getInvestmentTypeDisplay } from '../../utils/format';

export default function UpdateValueModal({ investment, onClose, onUpdate }) {
  const [newAmount, setNewAmount] = useState(investment.currentAmount);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newAmount <= 0) {
      alert('El valor debe ser mayor a cero');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(investment.id, parseFloat(newAmount));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const profit = newAmount - investment.initialAmount;
  const profitPercentage = ((profit / investment.initialAmount) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Actualizar Valor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Investment Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">
            {getInvestmentTypeDisplay(investment.type)}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{investment.platform}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Inversión inicial:</span>
              <span className="font-medium">{formatCurrency(investment.initialAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor actual:</span>
              <span className="font-medium">{formatCurrency(investment.currentAmount)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nuevo Valor (COP)
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="input-field"
              placeholder="500000"
              min="0"
              step="1000"
              required
              autoFocus
            />
          </div>

          {/* Preview */}
          {newAmount && newAmount > 0 && (
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Vista previa del cambio:</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ganancia/Pérdida:</span>
                  <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rendimiento:</span>
                  <span className={`font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitPercentage >= 0 ? '+' : ''}{profitPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}