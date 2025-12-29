import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, BarChart3, Shield, BookOpen, RotateCw } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const getDefaultRecommendations = () => ({
    disclaimer: '⚠️ Información educativa únicamente, no asesoramiento financiero profesional.',
    healthScore: 65,
    summary: 'Portafolio en desarrollo',
    technicalAnalysis: {
      indicators: { rsi: 50, macd: 0.15 },
      analysis: 'Indicadores en equilibrio',
      confidence: 65
    },
    fundamentalMetrics: {
      diversificationScore: 5,
      sharpeRatio: 1.0,
      analysis: 'Diversificación moderada'
    },
    riskAssessment: {
      risks: [
        { type: 'Concentración', level: 3, description: 'Posiciones concentradas', mitigation: 'Diversificar' },
        { type: 'Volatilidad', level: 2, description: 'Volatilidad moderada', mitigation: 'Rebalanceo' }
      ]
    },
    educationalRecommendations: {
      strategies: {
        short: 'Análisis técnico de corto plazo',
        medium: 'Rebalanceo cada 3 meses',
        long: 'Estrategia buy and hold'
      }
    }
  });

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setRecommendations(getDefaultRecommendations());
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE}/investments/ai-recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Asegurar que tenemos datos válidos
      const data = response.data;
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        // Filtrar solo los campos que esperamos
        const safeData = {
          disclaimer: typeof data.disclaimer === 'string' ? data.disclaimer : getDefaultRecommendations().disclaimer,
          healthScore: typeof data.healthScore === 'number' ? data.healthScore : 65,
          summary: typeof data.summary === 'string' ? data.summary : 'Análisis disponible',
          executiveSummary: data.executiveSummary || {},
          technicalAnalysis: data.technicalAnalysis || {},
          fundamentalMetrics: data.fundamentalMetrics || {},
          riskAssessment: data.riskAssessment || {},
          educationalRecommendations: data.educationalRecommendations || {}
        };
        setRecommendations(safeData);
      } else {
        setRecommendations(getDefaultRecommendations());
      }
    } catch (err) {
      console.error('Error:', err);
      setRecommendations(getDefaultRecommendations());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <AlertCircle className="text-red-600 dark:text-red-400 mb-2" size={24} />
        <p className="text-red-800 dark:text-red-300">{error || 'Error cargando datos'}</p>
      </div>
    );
  }

  const DisclaimerSection = () => (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-4 mb-6">
      <div className="flex gap-3">
        <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={20} />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          {typeof recommendations.disclaimer === 'string' ? recommendations.disclaimer : 'Información educativa'}
        </p>
      </div>
    </div>
  );

  const ExecutiveTab = () => (
    <div className="space-y-6">
      <DisclaimerSection />
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg shadow p-8 border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-200">Salud del Portafolio</h2>
            <p className="text-indigo-700 dark:text-indigo-300 mt-1">
              {typeof recommendations.summary === 'string' ? recommendations.summary : 'Análisis disponible'}
            </p>
          </div>
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-600">
            <div className="text-center">
              <p className="text-6xl font-bold text-indigo-600">{Math.round(Number(recommendations.healthScore) || 65)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">/100</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full"
            style={{ width: `${Math.round(Number(recommendations.healthScore) || 65)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );

  const TechnicalTab = () => (
    <div className="space-y-6">
      <DisclaimerSection />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity size={24} className="text-blue-600" />
          Indicadores Técnicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">RSI</p>
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {(recommendations.technicalAnalysis?.indicators?.rsi || 50).toFixed(1)}
            </p>
          </div>
          <div className="bg-cyan-50 dark:bg-cyan-900/30 p-6 rounded-lg border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">MACD</p>
            <p className="text-5xl font-bold text-cyan-600 dark:text-cyan-400">
              {(recommendations.technicalAnalysis?.indicators?.macd || 0).toFixed(2)}
            </p>
          </div>
        </div>
        {recommendations.technicalAnalysis?.analysis && typeof recommendations.technicalAnalysis.analysis === 'string' && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-gray-700 dark:text-gray-300">{recommendations.technicalAnalysis.analysis}</p>
          </div>
        )}
      </div>
    </div>
  );

  const FundamentalTab = () => (
    <div className="space-y-6">
      <DisclaimerSection />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BarChart3 size={24} className="text-green-600" />
          Métricas Fundamentales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Diversificación</h4>
            <p className="text-5xl font-bold text-green-600 dark:text-green-400">
              {(recommendations.fundamentalMetrics?.diversificationScore || 5).toFixed(1)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Escala 0-10</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sharpe Ratio</h4>
            <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
              {(recommendations.fundamentalMetrics?.sharpeRatio || 1.0).toFixed(2)}
            </p>
          </div>
        </div>
        {recommendations.fundamentalMetrics?.analysis && typeof recommendations.fundamentalMetrics.analysis === 'string' && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-gray-700 dark:text-gray-300">{recommendations.fundamentalMetrics.analysis}</p>
          </div>
        )}
      </div>
    </div>
  );

  const RiskTab = () => (
    <div className="space-y-6">
      <DisclaimerSection />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Shield size={24} className="text-orange-600" />
          Evaluación de Riesgos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.riskAssessment?.risks?.map((risk, idx) => (
            <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-3">{risk.type}</h4>
              <div className="space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded ${
                        i <= (risk.level || 3) ? 'bg-orange-600 dark:bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-sm text-orange-800 dark:text-orange-200">{risk.description}</p>
                {risk.mitigation && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded border border-orange-100 dark:border-orange-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300">{risk.mitigation}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const LearningTab = () => (
    <div className="space-y-6">
      <DisclaimerSection />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen size={24} className="text-indigo-600" />
          Educación Financiera
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.educationalRecommendations?.strategies && Object.entries(recommendations.educationalRecommendations.strategies).map(([horizon, text]) => (
            typeof text === 'string' && (
              <div key={horizon} className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h5 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                  {horizon === 'short' ? 'Corto Plazo' : horizon === 'medium' ? 'Mediano Plazo' : 'Largo Plazo'}
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'executive', label: '📊 Resumen', component: ExecutiveTab },
    { id: 'technical', label: '📈 Técnico', component: TechnicalTab },
    { id: 'fundamental', label: '🏛️ Fundamental', component: FundamentalTab },
    { id: 'risks', label: '⚠️ Riesgos', component: RiskTab },
    { id: 'learning', label: '📚 Educación', component: LearningTab }
  ];

  const CurrentTab = tabs.find(t => t.id === activeTab)?.component || ExecutiveTab;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análisis y Recomendaciones IA</h1>
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <RotateCw size={18} />
          Actualizar
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <CurrentTab />
    </div>
  );
};

export default AIRecommendations;
