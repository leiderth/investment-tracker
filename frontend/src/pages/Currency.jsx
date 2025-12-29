import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowRightLeft, History, Star, Search, X } from 'lucide-react';
import api from '../services/api';

export default function Currency() {
  const [activeTab, setActiveTab] = useState('rates');
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Converter state
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('COP');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);

  // History state
  const [historyFrom, setHistoryFrom] = useState('USD');
  const [historyTo, setHistoryTo] = useState('COP');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [conversionHistory, setConversionHistory] = useState([]);
  const [conversionHistoryLoading, setConversionHistoryLoading] = useState(false);

  // Favorites state
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [preferredCurrencies, setPreferredCurrencies] = useState([]);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesChanged, setPreferencesChanged] = useState(false);

  useEffect(() => {
    loadInitialData();
    loadConversionHistory();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Forzar actualización de tasas en tiempo real desde API
      try {
        console.log('🔄 Actualizando tasas en tiempo real...');
        await api.post('/currency/refresh-rates');
        console.log('✅ Tasas refrescadas desde API');
      } catch (err) {
        console.warn('⚠️ No se pudo refrescar tasas desde API:', err.message);
      }

      // Cargar tasas de cambio (ahora actualizadas)
      const ratesRes = await api.get('/currency/rates');
      console.log('📊 Tasas completas:', ratesRes.data);

      // Cargar monedas soportadas
      const currenciesRes = await api.get('/currency/supported');
      console.log('📍 Monedas soportadas:', currenciesRes.data);

      // Cargar preferencias del usuario
      let userFavorites = [];
      try {
        const prefsRes = await api.get('/currency/user-preferences');
        userFavorites = prefsRes.data.data?.preferredCurrencies || [];
        setBaseCurrency(prefsRes.data.data?.baseCurrency || 'USD');
        setPreferredCurrencies(userFavorites);
        console.log('⭐ Divisas favoritas cargadas:', userFavorites);
      } catch (err) {
        console.warn('⚠️ No se pudieron cargar las preferencias:', err.message);
      }

      // Procesar tasas - ratesData es { USD: { EUR: { rate, timestamp }, ... }, ... }
      const ratesData = ratesRes.data.data || {};
      const flatRates = [];
      
      Object.keys(ratesData).forEach(from => {
        Object.keys(ratesData[from] || {}).forEach(to => {
          flatRates.push({
            from_currency: from,
            to_currency: to,
            rate: ratesData[from][to]?.rate || 0,
            rate_timestamp: ratesData[from][to]?.timestamp || new Date().toISOString()
          });
        });
      });

      // Reorganizar para mostrar primero los pares más importantes (incluir favoritas)
      const priorityCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'COP', 'MXN', 'BRL', ...userFavorites];
      const priorityRates = [];
      const otherRates = [];

      flatRates.forEach(rate => {
        const isPriority = 
          priorityCurrencies.includes(rate.from_currency) || 
          priorityCurrencies.includes(rate.to_currency);
        
        if (isPriority) {
          priorityRates.push(rate);
        } else {
          otherRates.push(rate);
        }
      });

      // Ordenar pares importantes: 
      // 1. Pares con divisas favoritas como destino
      // 2. Pares con COP
      // 3. USD/EUR como base
      priorityRates.sort((a, b) => {
        // Prioridad 1: Divisas favoritas como destino
        const aIsFavorite = userFavorites.includes(a.to_currency);
        const bIsFavorite = userFavorites.includes(b.to_currency);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

        // Prioridad 2: Pares con COP
        if (a.to_currency === 'COP' && b.to_currency !== 'COP') return -1;
        if (a.to_currency !== 'COP' && b.to_currency === 'COP') return 1;
        
        // Prioridad 3: USD base
        if (a.from_currency === 'USD' && b.from_currency !== 'USD') return -1;
        if (a.from_currency !== 'USD' && b.from_currency === 'USD') return 1;
        
        return 0;
      });

      const sortedRates = [...priorityRates, ...otherRates];

      console.log('✅ Tasas procesadas y ordenadas:', sortedRates.slice(0, 15));

      setRates(sortedRates);
      setCurrencies(currenciesRes.data.currencies || []);
    } catch (err) {
      console.error('❌ Error cargando datos:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error al cargar datos de monedas');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await api.get('/currency/user-preferences');
      console.log('⭐ Preferencias de usuario:', response.data);
      
      setBaseCurrency(response.data.data?.baseCurrency || 'USD');
      setPreferredCurrencies(response.data.data?.preferredCurrencies || []);
    } catch (err) {
      console.warn('⚠️ No se pudieron cargar las preferencias:', err.message);
      setPreferredCurrencies([]);
    }
  };

  const saveUserPreferences = async () => {
    try {
      setPreferencesLoading(true);
      
      const response = await api.put('/currency/user-preferences', {
        baseCurrency: baseCurrency,
        preferredCurrencies: preferredCurrencies
      });

      console.log('✅ Preferencias guardadas:', response.data);
      setPreferencesChanged(false);
      setError('');
      alert('✅ Divisas favoritas guardadas correctamente');
    } catch (err) {
      console.error('❌ Error guardando preferencias:', err.response?.data || err.message);
      setError('Error al guardar las preferencias');
    } finally {
      setPreferencesLoading(false);
    }
  };

  const toggleCurrency = (currency) => {
    setPreferencesChanged(true);
    if (preferredCurrencies.includes(currency)) {
      setPreferredCurrencies(preferredCurrencies.filter(c => c !== currency));
    } else {
      setPreferredCurrencies([...preferredCurrencies, currency]);
    }
  };

  const handleConvert = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setError('');
        setConvertedAmount(null);
        return;
      }

      setError('');
      
      // Usar las tasas ya cargadas
      const ratesData = rates;
      
      // Buscar la tasa de cambio directa
      let rate = null;
      const directRate = ratesData.find(
        r => r.from_currency === fromCurrency && r.to_currency === toCurrency
      );
      
      if (directRate) {
        rate = directRate.rate;
      } else {
        // Si no hay tasa directa, intentar conversión a través de USD
        const fromToUSD = ratesData.find(r => r.from_currency === fromCurrency && r.to_currency === 'USD');
        const USDToTarget = ratesData.find(r => r.from_currency === 'USD' && r.to_currency === toCurrency);
        
        if (fromToUSD && USDToTarget) {
          rate = (1 / fromToUSD.rate) * USDToTarget.rate;
        } else if (fromCurrency === 'USD') {
          const directToTarget = ratesData.find(r => r.from_currency === 'USD' && r.to_currency === toCurrency);
          if (directToTarget) {
            rate = directToTarget.rate;
          }
        }
      }
      
      if (rate) {
        const numAmount = parseFloat(amount);
        const converted = numAmount * rate;
        setConvertedAmount(converted);
        setConversionRate(rate);

        // Guardar conversión automáticamente
        await saveConversion(fromCurrency, toCurrency, numAmount, converted, rate);
      } else {
        setError('No se encontró la tasa de cambio para este par');
        setConvertedAmount(null);
      }
    } catch (err) {
      console.error('❌ Error en conversión:', err.message);
      setError('Error al calcular la conversión');
      setConvertedAmount(null);
    }
  };

  const saveConversion = async (from, to, fromAmount, toAmount, rate) => {
    try {
      await api.post('/currency/record-conversion', {
        from_currency: from,
        to_currency: to,
        from_amount: parseFloat(fromAmount),
        to_amount: parseFloat(toAmount),
        rate_used: parseFloat(rate)
      });
    } catch (err) {
      console.warn('⚠️ Conversión no registrada:', err.message);
    }
  };

  const loadConversionHistory = async () => {
    try {
      setConversionHistoryLoading(true);
      const response = await api.get('/currency/conversions?limit=10');
      setConversionHistory(response.data.data || []);
    } catch (err) {
      console.error('Error cargando historial:', err.message);
    } finally {
      setConversionHistoryLoading(false);
    }
  };

  // Ejecutar conversión automáticamente cuando cambien los valores
  useEffect(() => {
    handleConvert();
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleLoadHistory = async () => {
    try {
      setHistoryLoading(true);
      console.log(`📈 Cargando historial de ${historyFrom}/${historyTo}`);
      
      const response = await api.get(`/currency/history/${historyFrom}/${historyTo}`);
      console.log('📈 Respuesta de historial:', response.data);
      
      setHistory(response.data.data || []);
      
      if (!response.data.data || response.data.data.length === 0) {
        setError('No hay datos históricos disponibles');
      } else {
        setError('');
      }
    } catch (err) {
      console.error('❌ Error cargando historial:', err.response?.data || err.message);
      setError('Error al cargar historial');
    } finally {
      setHistoryLoading(false);
    }
  };

  const getFilteredRates = () => {
    if (searchTerm.trim() === '') {
      // Sin búsqueda: mostrar solo favoritas
      return rates.filter(rate => 
        preferredCurrencies.includes(rate.to_currency) || 
        preferredCurrencies.includes(rate.from_currency)
      );
    } else {
      // Con búsqueda: mostrar todas las que coincidan
      const search = searchTerm.toUpperCase();
      return rates.filter(rate =>
        rate.from_currency.includes(search) || 
        rate.to_currency.includes(search)
      );
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tasas de cambio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestor de Monedas</h1>
          <p className="text-gray-600 mt-2">Convierte entre divisas y consulta tasas de cambio en tiempo real</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'rates'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={20} />
            Tasas de Cambio
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'converter'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowRightLeft size={20} />
            Convertidor
          </button>

          <button
            onClick={() => setActiveTab('important')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'important'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Star size={20} />
            Divisas Importantes
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History size={20} />
            Historial
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'rates' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tasas de Cambio Actuales</h2>
            {rates.length > 0 ? (
              <>
                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    📊 {searchTerm ? `Resultados de búsqueda: "${searchTerm}"` : `Mostrando ${preferredCurrencies.length > 0 ? 'tus divisas favoritas' : 'todas las divisas'}`} • Total disponibles: <strong>{rates.length}</strong>
                  </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Busca una divisa (USD, EUR, COP, etc.)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none transition-colors"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 mt-2">
                      {getFilteredRates().length} resultado{getFilteredRates().length !== 1 ? 's' : ''} encontrado{getFilteredRates().length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Divisas Favoritas Info */}
                {!searchTerm && preferredCurrencies.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3">⭐ Mis Divisas Importantes ({preferredCurrencies.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {preferredCurrencies.map((currency) => (
                        <button
                          key={currency}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                        >
                          {currency}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!searchTerm && preferredCurrencies.length === 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      💡 No tienes divisas importantes. Usa el buscador abajo para encontrar divisas, o ve a <strong>Divisas Importantes</strong> para configurar tus preferidas.
                    </p>
                  </div>
                )}

                {/* Rates Grid */}
                {getFilteredRates().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredRates().map((rate, idx) => {
                      const isFavorite = preferredCurrencies.includes(rate.to_currency);
                      const isCOP = rate.to_currency === 'COP';
                      
                      return (
                        <div key={idx} className={`p-4 rounded-lg border transition hover:shadow-md ${
                          isFavorite && isCOP
                            ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-md'
                            : isFavorite
                            ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-300 shadow-md'
                            : isCOP
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {rate.from_currency}
                                <span className="text-gray-400 mx-1">/</span>
                                {rate.to_currency}
                              </h3>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {isFavorite && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-indigo-200 text-indigo-800 rounded font-semibold">
                                    ⭐ Importante
                                  </span>
                                )}
                                {isCOP && !isFavorite && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-green-200 text-green-800 rounded font-semibold">
                                    💚 COP
                                  </span>
                                )}
                              </div>
                            </div>
                          <span className="text-xs text-gray-500">
                            {rate.rate_timestamp ? new Date(rate.rate_timestamp).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-indigo-600 mb-2">
                          {rate.rate?.toFixed(4) || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          1 {rate.from_currency} = {rate.rate?.toFixed(4) || 'N/A'} {rate.to_currency}
                        </p>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? `No se encontraron resultados para "${searchTerm}"`
                        : 'No tienes divisas favoritas aún'}
                    </p>
                    {!searchTerm && (
                      <p className="text-sm text-gray-500">
                        Configura tus divisas favoritas en la sección <strong>"Divisas Favoritas"</strong> o usa el buscador
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-600">
                No hay tasas disponibles
              </div>
            )}
          </div>
        )}

        {activeTab === 'converter' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Convertidor */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Convertidor</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ingresa la cantidad"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={swapCurrencies}
                    className="p-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full transition-colors"
                  >
                    <ArrowRightLeft size={20} />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">A</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                {conversionRate && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 text-center">
                      1 {fromCurrency} = {conversionRate.toFixed(6)} {toCurrency}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resultado */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow p-6 flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultado</h2>
              {error ? (
                <div className="text-center">
                  <p className="text-red-600 font-semibold text-lg">{error}</p>
                </div>
              ) : amount && parseFloat(amount) > 0 && convertedAmount !== null ? (
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Cantidad a convertir</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-xl text-gray-600 mt-1">{fromCurrency}</p>
                  </div>
                  <div className="my-4">
                    <ArrowRightLeft size={24} className="text-indigo-600 mx-auto" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Equivale a</p>
                    <p className="text-4xl font-bold text-indigo-600">
                      {convertedAmount.toFixed(2)}
                    </p>
                    <p className="text-xl text-gray-600 mt-1">{toCurrency}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 text-lg">
                    Ingresa una cantidad y haz clic en "Convertir"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Conversion History */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Últimas Conversiones</h3>
              <button
                onClick={loadConversionHistory}
                className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded transition"
              >
                Refrescar
              </button>
            </div>

            {conversionHistory.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {conversionHistory.map((conv, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {conv.from_amount.toFixed(2)} {conv.from_currency} → {conv.to_amount.toFixed(2)} {conv.to_currency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tasa: {conv.rate_used.toFixed(6)} • {new Date(conv.converted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">Sin conversiones registradas</p>
            )}
          </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Historial de Tasas</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">De</label>
                <select
                  value={historyFrom}
                  onChange={(e) => setHistoryFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">A</label>
                <select
                  value={historyTo}
                  onChange={(e) => setHistoryTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleLoadHistory}
                  disabled={historyLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {historyLoading ? 'Cargando...' : 'Cargar Historial'}
                </button>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-left font-semibold">Tasa</th>
                      <th className="px-4 py-3 text-right font-semibold">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium">{entry.rate.toFixed(6)}</td>
                        <td className="px-4 py-3 text-right">1 {historyFrom} = {entry.rate.toFixed(6)} {historyTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                Selecciona las monedas y carga el historial
              </div>
            )}
          </div>
        )}

        {/* Important Currencies Tab */}
        {activeTab === 'important' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star size={32} className="text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mis Divisas Importantes</h2>
                <p className="text-sm text-gray-600 mt-1">Configura las divisas que deseas monitorear</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Base Currency */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Moneda Base Predeterminada
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => {
                    setBaseCurrency(e.target.value);
                    setPreferencesChanged(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Esta será tu moneda de referencia para conversiones
                </p>
              </div>

              {/* Important Currencies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Selecciona tus divisas importantes
                  </h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {preferredCurrencies.length} seleccionada{preferredCurrencies.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => toggleCurrency(curr)}
                      className={`p-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                        preferredCurrencies.includes(curr)
                          ? 'bg-indigo-600 text-white shadow-lg scale-105 ring-2 ring-indigo-400'
                          : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg">
                        {preferredCurrencies.includes(curr) && '⭐ '}
                        {curr}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {preferredCurrencies.length} divisas seleccionadas
                </p>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={saveUserPreferences}
                  disabled={!preferencesChanged || preferencesLoading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    preferencesChanged && !preferencesLoading
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {preferencesLoading ? '⏳ Guardando...' : '💾 Guardar Preferencias'}
                </button>
                {preferencesChanged && (
                  <button
                    onClick={() => {
                      loadUserPreferences();
                      setPreferencesChanged(false);
                    }}
                    className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                  >
                    ↺ Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
