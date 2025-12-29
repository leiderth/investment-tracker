import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Newspaper, Activity, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const MarketData = () => {
  const [cryptoPrices, setCryptoPrices] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [news, setNews] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [economics, setEconomics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      
      const [cryptoRes, sentimentRes, newsRes, recRes, econRes] = await Promise.all([
        axios.get(`${API_BASE}/market/crypto-prices`).catch(err => ({ data: { error: err.message } })),
        axios.get(`${API_BASE}/market/sentiment`).catch(err => ({ data: { error: err.message } })),
        axios.get(`${API_BASE}/market/news`).catch(err => ({ data: { error: err.message } })),
        axios.get(`${API_BASE}/market/recommendations`).catch(err => ({ data: { error: err.message } })),
        axios.get(`${API_BASE}/market/economics`).catch(err => ({ data: { error: err.message } })),
      ]);

      setCryptoPrices(cryptoRes.data);
      setSentiment(sentimentRes.data);
      setNews(newsRes.data);
      setRecommendations(recRes.data);
      setEconomics(econRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Market data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando datos de mercado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Análisis del Mercado</h1>
        <p className="text-gray-600 dark:text-gray-400">Datos en tiempo real y tendencias globales</p>
      </div>

      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
          <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
        </div>
      )}

      {/* Sentiment Overview */}
      {sentiment && !sentiment.error && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg shadow p-8 border border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity size={28} className="text-purple-600 dark:text-purple-400" />
            Sentimiento del Mercado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sentiment.indicators && sentiment.indicators.map((indicator, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{indicator.indicator}</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{indicator.value}</p>
                  <div className={`p-2 rounded-full ${indicator.trend === 'up' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {indicator.trend === 'up' ? (
                      <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crypto Prices */}
      {cryptoPrices && !cryptoPrices.error && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Criptomonedas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(cryptoPrices.data || {}).slice(0, 6).map(([crypto, data]) => (
              <div key={crypto} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 capitalize">{crypto}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${data.usd?.toFixed(2)}</span>
                  </div>
                  {data.usd_24h_change && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">24h:</span>
                      <span className={data.usd_24h_change > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {data.usd_24h_change > 0 ? '+' : ''}{data.usd_24h_change.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Economic Indicators */}
      {economics && !economics.error && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap size={28} className="text-yellow-600 dark:text-yellow-400" />
            Indicadores Económicos Globales
          </h2>
          <div className="space-y-3">
            {economics.indicators && economics.indicators.map((indicator, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-indigo-600">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{indicator.name}</h3>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{indicator.value}</p>
                    <p className={`text-sm ${indicator.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      Cambio: {indicator.change}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    indicator.impact === 'High'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : indicator.impact === 'Medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {indicator.impact} Impact
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sector Recommendations */}
      {recommendations && !recommendations.error && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recomendaciones por Sector</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.recommendations && recommendations.recommendations.map((rec, idx) => (
              <div key={idx} className={`rounded-lg p-6 shadow border-l-4 ${
                rec.sentiment === 'Bullish'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : rec.sentiment === 'Bearish'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-500'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{rec.category}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rec.sentiment === 'Bullish'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : rec.sentiment === 'Bearish'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                  }`}>
                    {rec.sentiment}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{rec.reason}</p>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Top Companies:</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.topCompanies && rec.topCompanies.map((company, cidx) => (
                      <span key={cidx} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium">
                        {company}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Confianza: {rec.confidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial News */}
      {news && !news.error && news.articles && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Newspaper size={28} className="text-blue-600 dark:text-blue-400" />
            Noticias Financieras
          </h2>
          <div className="space-y-4">
            {news.articles.slice(0, 5).map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg hover:border-indigo-500 transition border border-gray-200 dark:border-gray-700 block"
              >
                <div className="flex gap-4">
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-24 h-24 object-cover rounded hidden md:block"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                      <span>{article.source}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={loadMarketData}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition font-medium"
        >
          Actualizar Datos
        </button>
      </div>
    </div>
  );
};

export default MarketData;
