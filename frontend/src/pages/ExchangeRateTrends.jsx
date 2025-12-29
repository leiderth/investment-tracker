import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import api from '../services/api';

export default function ExchangeRateTrends() {
  const [data, setData] = useState({});
  const [selectedPair, setSelectedPair] = useState('USD_COP');
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  const currencyPairs = [
    { label: 'USD → COP', value: 'USD_COP' },
    { label: 'EUR → COP', value: 'EUR_COP' },
    { label: 'GBP → COP', value: 'GBP_COP' },
    { label: 'USD → EUR', value: 'USD_EUR' },
    { label: 'USD → MXN', value: 'USD_MXN' }
  ];

  useEffect(() => {
    loadTrendData();
  }, [days]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/currency/popular-history', {
        params: { days }
      });

      setData(response.data.data || {});
      calculateStats(response.data.data || {});
    } catch (err) {
      setError('Error cargando datos de tendencias: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allData) => {
    const statsData = {};

    Object.keys(allData).forEach(pair => {
      const pairData = allData[pair];
      if (pairData && pairData.length > 0) {
        const rates = pairData.map(d => d.rate);
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
        const current = rates[rates.length - 1];
        const change = ((current - rates[0]) / rates[0]) * 100;

        statsData[pair] = {
          min: min.toFixed(4),
          max: max.toFixed(4),
          avg: avg.toFixed(4),
          current: current.toFixed(4),
          change: change.toFixed(2)
        };
      }
    });

    setStats(statsData);
  };

  const chartData = data[selectedPair] || [];

  const getChartColor = (pair) => {
    const colors = {
      'USD_COP': '#6366f1',
      'EUR_COP': '#ec4899',
      'GBP_COP': '#8b5cf6',
      'USD_EUR': '#f59e0b',
      'USD_MXN': '#10b981'
    };
    return colors[pair] || '#6366f1';
  };

  const exportData = () => {
    const csvContent = [
      ['Fecha', 'Tasa'],
      ...chartData.map(d => [d.date, d.rate])
    ]
      .map(row => row.join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `${selectedPair}_${days}dias.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de tendencias...</p>
        </div>
      </div>
    );
  }

  const pairStats = stats[selectedPair] || {};
  const pairLabel = currencyPairs.find(p => p.value === selectedPair)?.label || selectedPair;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Análisis de Tendencias</h1>
          </div>
          <p className="text-gray-600">Visualiza las tendencias históricas de tasas de cambio</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Currency Pair Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Par de Monedas
              </label>
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                {currencyPairs.map(pair => (
                  <option key={pair.value} value={pair.value}>
                    {pair.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Days Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Período
              </label>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={90}>Últimos 90 días</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportData}
                disabled={chartData.length === 0}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {pairStats.current && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Actual</p>
              <p className="text-2xl font-bold text-indigo-600">{pairStats.current}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Mínimo</p>
              <p className="text-2xl font-bold text-red-600">{pairStats.min}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Máximo</p>
              <p className="text-2xl font-bold text-green-600">{pairStats.max}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Promedio</p>
              <p className="text-2xl font-bold text-blue-600">{pairStats.avg}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-gray-600 text-sm font-semibold mb-1">Cambio %</p>
              <p className={`text-2xl font-bold ${pairStats.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pairStats.change >= 0 ? '+' : ''}{pairStats.change}%
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tendencia: {pairLabel}
          </h2>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color${selectedPair}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor(selectedPair)} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={getChartColor(selectedPair)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                  domain="dataMin - 10"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: `2px solid ${getChartColor(selectedPair)}`,
                    borderRadius: '8px'
                  }}
                  formatter={(value) => value.toFixed(4)}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={getChartColor(selectedPair)}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#color${selectedPair})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No hay datos disponibles para este período</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800">
            <strong>💡 Consejo:</strong> Analiza las tendencias para identificar el mejor momento para hacer conversiones.
            Tasas más bajas en ciertos períodos pueden indicar oportunidades de conversión favorables.
          </p>
        </div>
      </div>
    </div>
  );
}
