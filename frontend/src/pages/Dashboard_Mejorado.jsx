import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Activity,
  PieChart as PieIcon,
  Plus,
  AlertCircle,
  Target,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight
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

// Enhanced StatCard Component
function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-600',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-600',
    red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-600',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-600'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-6 border hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 opacity-80 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 opacity-90">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${getProfitColor(trendValue)}`}>
              {parseFloat(trendValue) >= 0 ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              <span className="text-xs font-semibold">{Math.abs(parseFloat(trendValue)).toFixed(2)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white rounded-lg shadow-sm opacity-90">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Risk Indicator Component
function RiskIndicator({ score, level }) {
  const getRiskColor = (score) => {
    if (score <= 25) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' };
    if (score <= 50) return { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' };
    if (score <= 75) return { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-500' };
    return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' };
  };

  const colors = getRiskColor(score);

  return (
    <div className={`${colors.bg} rounded-lg p-4 border border-opacity-30`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`font-semibold ${colors.text}`}>Nivel de Riesgo</p>
        <p className={`text-2xl font-bold ${colors.text}`}>{score}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colors.bar} h-2 rounded-full transition-all duration-500`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-2 ${colors.text} font-medium`}>{level || 'Medio'}</p>
    </div>
  );
}

// Investment Card Component
function InvestmentCard({ investment, rank }) {
  return (
    <Link
      to={`/investments/${investment.id}`}
      className="block bg-white rounded-lg p-4 border border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{getInvestmentTypeDisplay(investment.type)}</p>
            <p className="text-xs text-gray-500">{investment.platform || investment.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatCurrency(investment.value || investment.currentAmount)}</p>
          <p className={`text-xs font-semibold ${getProfitColor(investment.returnPercentage)}`}>
            {investment.returnPercentage > 0 ? '+' : ''}{formatPercent(investment.returnPercentage)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex-1">
          <p className="text-gray-500 mb-1">Inversión</p>
          <p className="font-semibold text-gray-700">{formatCurrency(investment.initialAmount || 0)}</p>
        </div>
        <div className="flex-1">
          <p className="text-gray-500 mb-1">Ganancia</p>
          <p className={`font-semibold ${getProfitColor(investment.profit || 0)}`}>
            {formatCurrency(investment.profit || 0)}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Type Distribution Card Component
function TypeDistributionCard({ type }) {
  const total = type.total || 0;
  const percentage = type.percentage || 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{getInvestmentTypeDisplay(type.type)}</p>
          <p className="text-xs text-gray-600">{type.count} {type.count === 1 ? 'inversión' : 'inversiones'}</p>
        </div>
        <p className="text-lg font-bold text-indigo-600">{percentage.toFixed(1)}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-600 mt-2 font-medium">{formatCurrency(total)}</p>
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-lg">Error al cargar el dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={loadDashboard}
              className="mt-3 text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
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
        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-8">
          <div className="text-center py-12">
            <Wallet className="w-20 h-20 text-indigo-600 mx-auto mb-4 opacity-80" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Comienza a invertir!</h3>
            <p className="text-gray-600 mb-6 text-lg">Registra tu primera inversión para ver el dashboard</p>
            <Link to="/investments" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition">
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

  // Calculate percentages for distribution
  const totalValue = byType.reduce((sum, t) => sum + (t.total || 0), 0);
  const byTypeWithPercentage = byType.map(t => ({
    ...t,
    percentage: totalValue > 0 ? (t.total / totalValue) * 100 : 0
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 pb-8">
      {/* Header con CTA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Resumen completo de tu portafolio de inversiones</p>
        </div>
        <Link
          to="/investments"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Inversión</span>
        </Link>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Patrimonio Total"
          value={formatCurrency(stats.totalPatrimony || 0)}
          subtitle={`${stats.totalInvestments || 0} inversiones activas`}
          icon={Wallet}
          color="primary"
          trend={true}
          trendValue={stats.returnPercentage || 0}
        />
        <StatCard
          title="Capital Invertido"
          value={formatCurrency(stats.totalCapital || 0)}
          subtitle="Inversión total realizada"
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Ganancia/Pérdida"
          value={formatCurrency(stats.totalProfit || 0)}
          subtitle={`Rendimiento: ${formatPercent(stats.returnPercentage || 0)}`}
          icon={(stats.totalProfit || 0) >= 0 ? TrendingUp : TrendingDown}
          color={(stats.totalProfit || 0) >= 0 ? 'green' : 'red'}
          trend={true}
          trendValue={stats.returnPercentage || 0}
        />
        <StatCard
          title="Inversiones Activas"
          value={stats.activeInvestments || 0}
          subtitle={`de ${stats.totalInvestments || 0} total`}
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Sección Análisis - 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicadores de Riesgo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Análisis de Riesgo</h2>
          </div>
          <RiskIndicator 
            score={riskAnalysis.riskScore || 50}
            level={riskAnalysis.riskLevel}
          />
          <div className="space-y-4 mt-6">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <p className="text-xs text-gray-600 mb-1">Diversificación</p>
              <p className="text-xl font-bold text-indigo-600">{(riskAnalysis.diversificationScore || 0).toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Volatilidad</p>
              <p className="text-xl font-bold text-gray-900">{formatPercent(advancedMetrics.volatility || 0)}</p>
            </div>
          </div>
        </div>

        {/* Métricas Avanzadas */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Métricas Avanzadas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
              <p className="text-xs text-gray-600 font-medium mb-2">Índice Sharpe</p>
              <p className="text-3xl font-bold text-green-600">
                {(advancedMetrics.sharpeRatio || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-2">Rendimiento ajustado por riesgo</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
              <p className="text-xs text-gray-600 font-medium mb-2">Max Drawdown</p>
              <p className="text-3xl font-bold text-red-600">
                {formatPercent(advancedMetrics.maxDrawdown || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">Peor caída histórica</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-gray-600 font-medium mb-2">Volatilidad</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatPercent(advancedMetrics.volatility || 0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">Desviación estándar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Evolución */}
      {stats.totalInvestments > 0 && evolution.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Evolución del Patrimonio
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={evolution} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#d1d5db"
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Fecha: ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4f46e5" 
                strokeWidth={3}
                dot={false}
                name="Valor del Portafolio"
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Distribución y Top Inversiones */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Distribución por Tipo */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            Distribución por Tipo
          </h2>
          {byTypeWithPercentage && byTypeWithPercentage.length > 0 ? (
            <div className="space-y-3">
              {byTypeWithPercentage.map((type, index) => (
                <TypeDistributionCard key={index} type={type} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay inversiones registradas</p>
            </div>
          )}
        </div>

        {/* Top Inversiones */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Top Inversiones
          </h2>
          {topInvestments && topInvestments.length > 0 ? (
            <div className="space-y-3">
              {topInvestments.slice(0, 6).map((inv, index) => (
                <InvestmentCard key={inv.id} investment={inv} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay inversiones registradas</p>
            </div>
          )}
        </div>
      </div>

      {/* CTA Secundario */}
      {stats.totalInvestments === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-8">
          <div className="text-center py-8">
            <Wallet className="w-24 h-24 text-indigo-600 mx-auto mb-6 opacity-80" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">¡Comienza tu viaje de inversión!</h3>
            <p className="text-gray-700 mb-8 text-lg max-w-2xl mx-auto">
              Registra tu primera inversión y visualiza todos los datos en este dashboard
            </p>
            <Link 
              to="/investments" 
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 inline-flex items-center gap-2 font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              <Plus className="w-6 h-6" />
              <span>Registrar Primera Inversión</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
