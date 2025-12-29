import { useState, useEffect } from 'react';
import { currencyAPI } from '../../services/api';
import { Globe } from 'lucide-react';

export default function CurrencySelector() {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCurrencies();
    loadUserPreferences();
  }, []);

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      const response = await currencyAPI.getSupportedCurrencies();
      setCurrencies(response.data.currencies);
    } catch (err) {
      console.error('Error loading currencies:', err);
      setError('Error al cargar monedas');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await currencyAPI.getUserPreferences();
      if (response.data && response.data.data) {
        setSelectedCurrency(response.data.data.display_currency);
      }
    } catch (err) {
      console.error('Error loading user preferences:', err);
    }
  };

  const handleCurrencyChange = async (currency) => {
    try {
      setSelectedCurrency(currency);
      await currencyAPI.updateUserPreferences({
        display_currency: currency
      });
    } catch (err) {
      console.error('Error updating currency preference:', err);
      setError('Error al actualizar preferencia de moneda');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Globe className="w-5 h-5 text-primary-600" />
      <select
        value={selectedCurrency}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {currencies.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
