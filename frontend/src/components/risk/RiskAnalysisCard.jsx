// frontend/src/components/risk/RiskAnalysisCard.jsx

import { useEffect, useState } from 'react';
import { Shield, TrendingUp, PieChart, AlertTriangle } from 'lucide-react';
import { getPortfolioRiskAnalysis } from '../../services/api';
import { formatCurrency } from '../../utils/format';
import RiskBadge from '../common/RiskBadge';

export default function RiskAnalysisCard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskAnalysis();
  }, []);

  const loadRiskAnalysis = async () => {
    try {
      setLoading(true);
      const response = await getPortfolioRiskAnalysis();
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error al cargar análisis de riesgo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.total_investments === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-gray-400" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Análisis de Riesgo</h3>
        </div>
        <p className="text-gray-600 text-center py-8">
          No hay inversiones activas para analizar
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={28} />
              <h3 className="text-xl font-bold">Análisis de Riesgo</h3>
            </div>
            <p className="text-purple-100">
              {analysis.total_investments} inversiones • {formatCurrency(analysis.total_value)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{analysis.risk_score}</div>
            <div className="text-sm text-purple-100">Score de Riesgo</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Nivel de Riesgo General */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600 mb-1">Nivel de Riesgo del Portafolio</div>
            <RiskBadge level={analysis.risk_level} size="lg" />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Diversificación</div>
            <div className="text-2xl font-bold text-indigo-600">
              {analysis.diversification_score}%
            </div>
          </div>
        </div>

        {/* Distribución por Nivel de Riesgo */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <PieChart size={18} />
            Distribución por Nivel de Riesgo
          </h4>
          
          <div className="space-y-3">
            {/* Bajo Riesgo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-green-600" />
                  <span className="text-sm font-medium">Bajo Riesgo</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {analysis.risk_distribution.bajo.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${analysis.risk_distribution.bajo.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {analysis.risk_distribution.bajo.count} inversiones • {formatCurrency(analysis.risk_distribution.bajo.value)}
              </div>
            </div>

            {/* Riesgo Medio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium">Riesgo Medio</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {analysis.risk_distribution.medio.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all duration-500"
                  style={{ width: `${analysis.risk_distribution.medio.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {analysis.risk_distribution.medio.count} inversiones • {formatCurrency(analysis.risk_distribution.medio.value)}
              </div>
            </div>

            {/* Alto Riesgo */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="text-sm font-medium">Alto Riesgo</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {analysis.risk_distribution.alto.percentage}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-500"
                  style={{ width: `${analysis.risk_distribution.alto.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {analysis.risk_distribution.alto.count} inversiones • {formatCurrency(analysis.risk_distribution.alto.value)}
              </div>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={18} />
              Recomendaciones
            </h4>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    rec.type === 'warning'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 mb-1">
                    {rec.title}
                  </div>
                  <div className="text-sm text-gray-700">
                    {rec.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}