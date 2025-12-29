import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import {
  TrendingUp,
  Wallet,
  DollarSign,
  Activity,
  PieChart,
  Plus,
  AlertCircle
} from 'lucide-react';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercent = (value) => {
  if (value === null || value === undefined) return '0.00%';
  const num = parseFloat(value);
  return isNaN(num) ? '0.00%' : `${num.toFixed(2)}%`;
};

const getProfitColor = (value) => {
  if (value === null || value === undefined) return 'text-gray-600';
  const numValue = parseFloat(value);
  if (numValue > 0) return 'text-green-600';
  if (numValue < 0) return 'text-red-600';
  return 'text-gray-600';
};

const getInvestmentTypeDisplay = (type) => {
  const types = {
    'CDT': '🏦 CDT',
    'acciones': '📈 Acciones',
    'ETF': '📊 ETF',
    'cripto': '₿ Cripto',
    'negocio': '💼 Negocio',
    'otro': '💰 Otro'
  };
  return types[type] || type;
};

// StatCard Component
function StatCard({ title, value, icon: Icon, color = 'primary', subtitle }) {
  const colorClasses = {
    primary: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Usar el endpoint consolidado /api/dashboard/complete
      const response = await api.get('/dashboard/complete');
      
      if (response.data && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        throw new Error('Datos inválidos del servidor');
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err.message || 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Error al cargar el dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={loadDashboard}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <div>
            <p className="font-medium">Sin datos disponibles</p>
            <p className="text-sm mt-1">No hay inversiones registradas. Comienza registrando tu primera inversión.</p>
          </div>
        </div>
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Comienza a invertir!</h3>
            <p className="text-gray-600 mb-4">Registra tu primera inversión</p>
            <Link to="/investments" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Inversión</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats || {};
  const evolution = dashboardData.evolution || [];
  const riskAnalysis = dashboardData.riskAnalysis || {};
  const advancedMetrics = dashboardData.advancedMetrics || {};
  const topInvestments = dashboardData.topInvestments || [];
  const byType = dashboardData.byType || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Resumen de tus inversiones</p>
        </div>
        <Link
          to="/investments"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Inversión</span>
        </Link>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimonio Total"
          value={formatCurrency(stats.totalPatrimony || 0)}
          icon={Wallet}
          color="primary"
        />
        <StatCard
          title="Capital Invertido"
          value={formatCurrency(stats.totalCapital || 0)}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Ganancia/Pérdida"
          value={formatCurrency(stats.totalProfit || 0)}
          icon={TrendingUp}
          color={(stats.totalProfit || 0) >= 0 ? 'green' : 'red'}
          subtitle={`${formatPercent(stats.returnPercentage || 0)} de rendimiento`}
        />
        <StatCard
          title="Inversiones Activas"
          value={stats.activeInvestments || 0}
          icon={Activity}
          color="yellow"
          subtitle={`${stats.totalInvestments || 0} en total`}
        />
      </div>

      {/* Análisis de Riesgo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumen de Riesgo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Volatilidad Esperada</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
              {formatPercent(advancedMetrics.volatility || 0)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Max Drawdown</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              {formatPercent(advancedMetrics.maxDrawdown || 0)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">Índice Sharpe</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
              {(advancedMetrics.sharpeRatio || 0).toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Evolución */}
      {stats.totalInvestments > 0 && evolution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Evolución del Patrimonio (últimos 30 días)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Fecha: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4f46e5" 
                strokeWidth={2}
                dot={false}
                name="Valor del Portafolio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribución y Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Tipo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Distribución por Tipo</h2>
          </div>
          {byType && byType.length > 0 ? (
            <div className="space-y-3">
              {byType.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{getInvestmentTypeDisplay(type.type)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{type.count} {type.count === 1 ? 'inversión' : 'inversiones'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(type.total)}</p>
                    <p className={`text-sm font-medium ${getProfitColor(type.avgReturn)}`}>{formatPercent(type.avgReturn)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No hay inversiones</p>
          )}
        </div>

        {/* Top Inversiones */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Inversiones</h2>
          </div>
          {topInvestments && topInvestments.length > 0 ? (
            <div className="space-y-3">
              {topInvestments.slice(0, 5).map((inv, index) => (
                <Link
                  key={inv.id}
                  to={`/investments/${inv.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        <p className="font-medium text-gray-900 dark:text-white">{getInvestmentTypeDisplay(inv.type)}</p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{inv.platform || inv.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(inv.value || inv.currentAmount)}</p>
                      <p className={`text-sm font-medium ${getProfitColor(inv.returnPercentage)}`}>
                        {inv.returnPercentage > 0 ? '+' : ''}{formatPercent(inv.returnPercentage)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No hay inversiones</p>
          )}
        </div>
      </div>

      {/* Call to Action */}
      {stats.totalInvestments === 0 && (
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
          <div className="text-center py-8">
            <Wallet className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">¡Comienza a invertir!</h3>
            <p className="text-gray-600 mb-4">Registra tu primera inversión</p>
            <Link to="/investments" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              <span>Registrar Inversión</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
