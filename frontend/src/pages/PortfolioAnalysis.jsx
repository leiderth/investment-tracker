import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Zap, AlertCircle, Download, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';
import ReportExporter from '../components/ReportExporter';
import { onRatesUpdate, offRatesUpdate, onPortfolioUpdate, offPortfolioUpdate } from '../services/socketService';

const API_BASE = 'http://localhost:5000/api';

const PortfolioAnalysis = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [showDetails, setShowDetails] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState(false);

  // Colores para gráficos
  const COLORS = ['#4F46E5', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#0EA5E9', '#F97316'];

  useEffect(() => {
    loadPortfolioData();

    // Escuchar actualizaciones en tiempo real
    const handlePortfolioUpdate = (data) => {
      console.log('📊 Actualización en tiempo real recibida:', data);
      setRealtimeStatus(true);
      loadPortfolioData(); // Recargar datos
      
      // Mostrar notificación brevemente
      setTimeout(() => setRealtimeStatus(false), 2000);
    };

    onPortfolioUpdate(handlePortfolioUpdate);

    return () => {
      offPortfolioUpdate();
    };
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE}/investments/portfolio-analysis`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortfolioData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar portafolio');
      console.error('Portfolio load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // ReportExporter maneja el export
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis del portafolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-bold text-red-900">Error</h3>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) return null;

  const {
    summary,
    byType,
    byStatus,
    byRisk,
    performance,
    investments,
    metrics,
  } = portfolioData;

  const profitLoss = summary.totalValue - summary.totalInvested;
  const returnPercentage = summary.totalInvested > 0 ? ((profitLoss / summary.totalInvested) * 100) : 0;
  const isProfitable = profitLoss >= 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Análisis del Portafolio</h1>
            <p className="text-gray-600 dark:text-gray-400">Vista completa de tus inversiones y su composición</p>
          </div>
          <div className="flex items-center gap-4">
            {realtimeStatus && (
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg animate-pulse">
                <Wifi size={18} />
                <span className="text-sm font-medium">Actualizado en tiempo real</span>
              </div>
            )}
            <ReportExporter 
              title="Portfolio Analysis Report" 
              data={portfolioData}
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Valor Total</p>
            <p className="text-3xl font-bold text-gray-900">${summary.totalValue.toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500 mt-2">{summary.investmentCount} inversiones</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Invertido</p>
            <p className="text-3xl font-bold text-gray-900">${summary.totalInvested.toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
            <p className="text-xs text-gray-500 mt-2">Aporte inicial</p>
          </div>

          <div className={`bg-white rounded-lg shadow p-6 ${isProfitable ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
            <p className="text-gray-600 text-sm mb-2">Ganancia/Pérdida</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(profitLoss).toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </p>
              {isProfitable ? (
                <ArrowUpRight size={24} className="text-green-600" />
              ) : (
                <ArrowDownRight size={24} className="text-red-600" />
              )}
            </div>
            <p className={`text-sm mt-2 ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              {returnPercentage > 0 ? '+' : ''}{returnPercentage.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Diversificación</p>
            <p className="text-3xl font-bold text-indigo-600">{metrics.diversificationScore.toFixed(1)}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((metrics.diversificationScore / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart - Por Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Composición por Tipo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {byType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart - Por Riesgo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Exposición al Riesgo</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={byRisk}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {byRisk.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Por Estado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Estado de Inversiones</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Line Chart */}
          {performance && performance.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Evolución Temporal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    dot={false}
                    name="Valor del Portafolio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Detailed Investments Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Inversiones Detalladas</h2>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
            </button>
          </div>

          {showDetails && investments && investments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Tipo</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Invertido</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Valor Actual</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Rendimiento</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Estado</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Riesgo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {investments.map((inv, idx) => {
                    const gain = inv.currentValue - inv.amountInvested;
                    const gainPercent = inv.amountInvested > 0 ? ((gain / inv.amountInvested) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-medium text-gray-900">{inv.name}</td>
                        <td className="px-4 py-3 text-gray-600">{inv.type}</td>
                        <td className="px-4 py-3 text-right text-gray-900">${inv.amountInvested.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-3 text-right text-gray-900">${inv.currentValue.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? '+' : ''}{gainPercent.toFixed(2)}% (${Math.abs(gain).toLocaleString('es-CO', {minimumFractionDigits: 0, maximumFractionDigits: 0})})
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${inv.status === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            inv.riskLevel === 'bajo' ? 'bg-blue-100 text-blue-800' :
                            inv.riskLevel === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {inv.riskLevel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Risk & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Rebalance Recommendations */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-indigo-200">
            <div className="flex items-start gap-3 mb-4">
              <Zap className="text-indigo-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Rebalanceo Sugerido</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {metrics.needsRebalancing
                    ? 'Tu portafolio se ha desbalanceado. Se recomienda ajustar la distribución.'
                    : 'Tu portafolio está bien balanceado.'}
                </p>
              </div>
            </div>
            {metrics.rebalanceRecommendations && metrics.rebalanceRecommendations.length > 0 && (
              <ul className="space-y-2">
                {metrics.rebalanceRecommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Portfolio Health */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
            <div className="flex items-start gap-3 mb-4">
              <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Salud del Portafolio</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Score de diversificación y estabilidad
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Diversificación</span>
                  <span className="font-semibold text-gray-900">{metrics.diversificationScore.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(metrics.diversificationScore / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Inversiones activas: <span className="font-semibold">{summary.investmentCount}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis;
