// backend/src/controllers/market.controller.js

const MarketDataService = require('../services/marketDataService');

/**
 * @route   GET /api/market/crypto-prices
 * @desc    Get cryptocurrency prices and market data
 * @access  Public
 */
exports.getCryptoPrices = async (req, res) => {
  try {
    const data = await MarketDataService.getCryptoPrices();
    res.json(data);
  } catch (error) {
    console.error('❌ [getCryptoPrices] Error:', error);
    res.status(500).json({ error: 'Error al obtener precios de crypto' });
  }
};

/**
 * @route   GET /api/market/indices
 * @desc    Get market indices and general market data
 * @access  Public
 */
exports.getMarketIndices = async (req, res) => {
  try {
    const data = await MarketDataService.getMarketIndices();
    res.json(data);
  } catch (error) {
    console.error('❌ [getMarketIndices] Error:', error);
    res.status(500).json({ error: 'Error al obtener índices del mercado' });
  }
};

/**
 * @route   GET /api/market/news
 * @desc    Get financial news
 * @access  Public
 */
exports.getMarketNews = async (req, res) => {
  try {
    const data = await MarketDataService.getMarketNews();
    res.json(data);
  } catch (error) {
    console.error('❌ [getMarketNews] Error:', error);
    res.status(500).json({ error: 'Error al obtener noticias del mercado' });
  }
};

/**
 * @route   GET /api/market/sentiment
 * @desc    Get market sentiment indicators
 * @access  Public
 */
exports.getMarketSentiment = async (req, res) => {
  try {
    const data = MarketDataService.getMarketSentiment();
    res.json(data);
  } catch (error) {
    console.error('❌ [getMarketSentiment] Error:', error);
    res.status(500).json({ error: 'Error al obtener sentimiento del mercado' });
  }
};

/**
 * @route   GET /api/market/recommendations
 * @desc    Get sector investment recommendations
 * @access  Public
 */
exports.getInvestmentRecommendations = async (req, res) => {
  try {
    const data = await MarketDataService.getInvestmentRecommendations();
    res.json(data);
  } catch (error) {
    console.error('❌ [getInvestmentRecommendations] Error:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones' });
  }
};

/**
 * @route   GET /api/market/economics
 * @desc    Get global economic indicators
 * @access  Public
 */
exports.getGlobalEconomics = async (req, res) => {
  try {
    const data = MarketDataService.getGlobalEconomics();
    res.json(data);
  } catch (error) {
    console.error('❌ [getGlobalEconomics] Error:', error);
    res.status(500).json({ error: 'Error al obtener datos económicos' });
  }
};
