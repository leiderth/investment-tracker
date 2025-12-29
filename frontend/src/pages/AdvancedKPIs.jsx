// frontend/src/pages/AdvancedKPIs.jsx

import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { getAdvancedMetrics } from '../services/api';
import { formatCurrency, formatPercent } from '../utils/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

export default function AdvancedKPIs() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await getAdvancedMetrics();
      console.log('📊 [ADVANCEDKPIS] Response:', response);
      // El backend retorna { success: true, data: {...} }
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      console.error('❌ [ADVANCEDKPIS] Error al obtener métricas avanzadas:', err);
      setError('No pudimos cargar las métricas avanzadas. Asegúrate de tener inversiones activas.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="animate-spin mx-auto mb-4" size={40} />
            <p className="text-gray-600">Calculando métricas avanzadas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Sin datos disponibles</h3>
              <p className="text-red-700 mt-1">{error || 'No hay inversiones activas para analizar'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Colores para gráficos
  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Datos para gráfico de sector
  const sectorData = Object.entries(metrics.sectorConcentration || {}).map(([name, data]) => ({
    name,
    value: parseFloat(data.percentage)
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 size={32} className="text-indigo-600" />
          KPIs Avanzados
        </h1>
        <p className="text-gray-600 mt-2">Análisis detallado del riesgo y performance de tu portafolio</p>
      </div>

      {/* KPI Cards - Fila 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Diversificación */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Diversificación</h3>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              metrics.diversificationIndex > 60 ? 'bg-green-100' : metrics.diversificationIndex > 40 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <PieChartIcon size={24} className={
                metrics.diversificationIndex > 60 ? 'text-green-600' : metrics.diversificationIndex > 40 ? 'text-yellow-600' : 'text-red-600'
              } />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.diversificationIndex.toFixed(1)}</div>
          <p className="text-sm text-gray-500 mt-2">Índice HHI (0-100)</p>
          <div className="mt-4 bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, metrics.diversificationIndex)}%` }}
            ></div>
          </div>
        </div>

        {/* Volatilidad */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Volatilidad</h3>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              metrics.volatility.historical > 15 ? 'bg-red-100' : metrics.volatility.historical > 8 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <TrendingUp size={24} className={
                metrics.volatility.historical > 15 ? 'text-red-600' : metrics.volatility.historical > 8 ? 'text-yellow-600' : 'text-green-600'
              } />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.volatility.historical.toFixed(2)}%</div>
          <p className="text-sm text-gray-500 mt-2">{metrics.volatility.interpretation} - Anualizada</p>
          <div className="mt-4 text-xs text-gray-600">
            Datos: {metrics.volatility.dataPoints} inversiones
          </div>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Sharpe Ratio</h3>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              metrics.sharpeRatio > 1 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <Activity size={24} className={
                metrics.sharpeRatio > 1 ? 'text-green-600' : 'text-yellow-600'
              } />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.sharpeRatio.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-2">Retorno ajustado por riesgo</p>
          <div className="mt-4 text-xs text-gray-600">
            {metrics.sharpeRatio > 1 ? '✅ Buen retorno por riesgo' : '⚠️ Considera diversificar'}
          </div>
        </div>

        {/* Value at Risk */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Riesgo (95%)</h3>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{metrics.valueAtRisk.percentageOf95.toFixed(2)}%</div>
          <p className="text-sm text-gray-500 mt-2">Pérdida máxima esperada</p>
          <div className="mt-4 text-xs text-gray-600">
            ${metrics.valueAtRisk.loss95.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Resumen del Portafolio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6 border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-4">Valor Total</h4>
          <div className="text-3xl font-bold text-indigo-600">{formatCurrency(metrics.portfolioSummary.totalValue)}</div>
          <p className="text-sm text-indigo-700 mt-2">
            Invertido: {formatCurrency(metrics.portfolioSummary.totalInvested)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-4">Ganancia Total</h4>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(metrics.portfolioSummary.totalProfit)}</div>
          <p className="text-sm text-green-700 mt-2">
            ROI: {formatPercent(metrics.portfolioSummary.totalReturnPercentage)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-4">Inversiones</h4>
          <div className="text-3xl font-bold text-purple-600">{metrics.portfolioSummary.numberOfInvestments}</div>
          <p className="text-sm text-purple-700 mt-2">
            Activas en tu portafolio
          </p>
        </div>
      </div>

      {/* Análisis de Riesgo */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Análisis de Riesgo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Nivel de Riesgo General</h4>
            <div className={`px-4 py-3 rounded-lg font-semibold ${
              metrics.riskMetrics.portfolioRiskLevel === 'bajo' ? 'bg-green-100 text-green-900' :
              metrics.riskMetrics.portfolioRiskLevel === 'medio' ? 'bg-yellow-100 text-yellow-900' :
              'bg-red-100 text-red-900'
            }`}>
              {metrics.riskMetrics.portfolioRiskLevel.toUpperCase()}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Concentración</h4>
            <div className={`px-4 py-3 rounded-lg font-semibold capitalize ${
              metrics.riskMetrics.concentrationLevel === 'excelente' ? 'bg-green-100 text-green-900' :
              metrics.riskMetrics.concentrationLevel === 'buena' ? 'bg-green-100 text-green-900' :
              metrics.riskMetrics.concentrationLevel === 'moderada' ? 'bg-yellow-100 text-yellow-900' :
              'bg-red-100 text-red-900'
            }`}>
              {metrics.riskMetrics.concentrationLevel}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Tendencia</h4>
            <div className="px-4 py-3 rounded-lg font-semibold bg-blue-100 text-blue-900">
              {metrics.riskMetrics.volatilityTrend}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Recomendación</h4>
          <p className="text-blue-800">{metrics.riskMetrics.recommendation}</p>
        </div>
      </div>

      {/* Distribución por Sector */}
      {sectorData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Distribución por Sector</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de Sectores */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Detalles por Sector</h2>
            <div className="space-y-3">
              {Object.entries(metrics.sectorConcentration).map(([sector, data], idx) => (
                <div key={sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-semibold text-gray-900">{sector}</p>
                      <p className="text-sm text-gray-600">{data.count} inversión{data.count !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{data.percentage.toFixed(1)}%</p>
                    {data.isConcentrated && (
                      <p className="text-xs text-red-600 font-semibold">⚠️ Concentrado</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Value at Risk Detallado */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Value at Risk (VaR)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">Pérdida Máxima (95% confianza)</h4>
            <div className="text-3xl font-bold text-red-600">${metrics.valueAtRisk.loss95.toLocaleString()}</div>
            <p className="text-sm text-red-700 mt-2">
              {metrics.valueAtRisk.percentageOf95.toFixed(2)}% del portafolio
            </p>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-900 mb-2">Pérdida Máxima (99% confianza)</h4>
            <div className="text-3xl font-bold text-orange-600">${metrics.valueAtRisk.loss99.toLocaleString()}</div>
            <p className="text-sm text-orange-700 mt-2">
              {metrics.valueAtRisk.percentageOf99.toFixed(2)}% del portafolio
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Interpretación:</strong> {metrics.valueAtRisk.interpretation}
          </p>
        </div>
      </div>

      {/* Información de Correlación */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Matriz de Correlaciones</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-2 font-semibold">Activo</th>
                {metrics.correlationMatrix[0]?.map((_, i) => (
                  <th key={i} className="text-center p-2 font-semibold">#{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.correlationMatrix.map((row, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-semibold text-gray-700">Inv. {i + 1}</td>
                  {row.map((corr, j) => (
                    <td
                      key={j}
                      className={`text-center p-2 font-semibold ${
                        corr > 0.7 ? 'bg-red-100 text-red-900' :
                        corr < -0.3 ? 'bg-green-100 text-green-900' :
                        'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {corr.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Clave:</strong> Valores cercanos a +1 = Correlacionadas (riesgo) | Cercanos a -1 = Diversificadas (bueno) | Cercanos a 0 = Sin relación
          </p>
        </div>
      </div>

      {/* Botón de Actualizar */}
      <div className="text-center">
        <button
          onClick={fetchMetrics}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          ⟳ Actualizar Métricas
        </button>
      </div>
    </div>
  );
}
