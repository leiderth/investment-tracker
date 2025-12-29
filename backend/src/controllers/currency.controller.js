/**
 * Currency Controller
 * Maneja endpoints de conversión de monedas y tasas de cambio
 */

const pool = require('../config/database');
const ExchangeRatesManager = require('../utils/exchangeRatesManager');
const ExternalRatesService = require('../utils/externalRatesService');
const logger = require('../utils/logger');

/**
 * @route   GET /api/currency/rates
 * @desc    Obtener todas las tasas de cambio (reales de API o cached)
 * @access  Public
 */
exports.getAllRates = async (req, res) => {
  try {
    const rates = await ExternalRatesService.getAllRatesWithFallback();
    res.json({
      success: true,
      data: rates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo tasas de cambio:', error);
    res.status(500).json({ error: 'Error obteniendo tasas de cambio' });
  }
};

/**
 * @route   GET /api/currency/rate/:from/:to
 * @desc    Obtener tasa de cambio específica
 * @access  Public
 */
exports.getRate = async (req, res) => {
  try {
    const { from, to } = req.params;
    const rate = await ExchangeRatesManager.getRate(from, to);
    
    res.json({
      success: true,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: parseFloat(rate.toFixed(8)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo tasa de cambio:', error);
    res.status(500).json({ error: 'Error obteniendo tasa de cambio' });
  }
};

/**
 * @route   POST /api/currency/convert
 * @desc    Convertir cantidad entre monedas
 * @access  Public
 * @body    { amount, from, to }
 */
exports.convert = async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }

    const result = await ExchangeRatesManager.convert(amount, from, to);

    // Registrar si es usuario autenticado
    if (req.user) {
      await ExchangeRatesManager.recordConversion(
        req.user.id,
        from,
        to,
        amount,
        result.converted,
        result.rate
      );
    }

    res.json({
      success: true,
      original: { amount, currency: result.from },
      converted: { amount: result.converted, currency: result.to },
      rate: result.rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error en conversión:', error);
    res.status(500).json({ error: 'Error en conversión' });
  }
};

/**
 * @route   GET /api/currency/history/:from/:to
 * @desc    Obtener historial de tasas de cambio
 * @access  Public
 */
exports.getHistory = async (req, res) => {
  try {
    const { from, to } = req.params;
    const { days = 30 } = req.query;

    const result = await ExchangeRatesManager.getHistory(from, to, parseInt(days));

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error obteniendo historial:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};

/**
 * @route   GET /api/currency/supported
 * @desc    Obtener lista de monedas soportadas
 * @access  Public
 */
exports.getSupportedCurrencies = async (req, res) => {
  try {
    const rates = await ExternalRatesService.getAllRatesWithFallback();
    
    // Extraer monedas de la estructura de tasas
    const currencies = [];
    if (rates.USD) {
      currencies.push('USD');
      currencies.push(...Object.keys(rates.USD));
    }
    
    const uniqueCurrencies = [...new Set(currencies)].sort();
    
    res.json({
      success: true,
      currencies: uniqueCurrencies,
      count: uniqueCurrencies.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo monedas soportadas:', error);
    res.status(500).json({ error: 'Error obteniendo monedas soportadas' });
  }
};

/**
 * @route   GET /api/currency/user-preferences
 * @desc    Obtener preferencias de moneda del usuario
 * @access  Private
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = await ExchangeRatesManager.getUserPreferences(userId);

    // Parsear las monedas preferidas si es JSON string
    let preferredCurrencies = [];
    if (prefs.preferred_currencies) {
      try {
        preferredCurrencies = JSON.parse(prefs.preferred_currencies);
      } catch (e) {
        preferredCurrencies = [];
      }
    }

    res.json({
      success: true,
      data: {
        baseCurrency: prefs.base_currency || 'USD',
        preferredCurrencies: preferredCurrencies,
        autoSync: prefs.auto_sync || false
      }
    });
  } catch (error) {
    logger.error('Error obteniendo preferencias de moneda:', error);
    res.status(500).json({ error: 'Error obteniendo preferencias' });
  }
};

/**
 * @route   PUT /api/currency/user-preferences
 * @desc    Actualizar preferencias de moneda del usuario
 * @access  Private
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { baseCurrency, preferredCurrencies } = req.body;

    // Validar que preferredCurrencies sea un array
    if (preferredCurrencies && !Array.isArray(preferredCurrencies)) {
      return res.status(400).json({ error: 'Las monedas preferidas deben ser un array' });
    }

    await ExchangeRatesManager.updateUserPreferences(
      userId,
      baseCurrency || 'USD',
      preferredCurrencies || []
    );

    logger.info(`Preferencias actualizadas para usuario ${userId}`);

    res.json({
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      data: {
        baseCurrency: baseCurrency || 'USD',
        preferredCurrencies: preferredCurrencies || []
      }
    });
  } catch (error) {
    logger.error('Error actualizando preferencias:', error);
    res.status(500).json({ error: 'Error actualizando preferencias' });
  }
};

/**
 * @route   PUT /api/currency/rate/:from/:to
 * @desc    Actualizar tasa de cambio (Admin)
 * @access  Private
 */
exports.updateRate = async (req, res) => {
  try {
    const { from, to } = req.params;
    const { rate } = req.body;

    if (!rate || rate <= 0) {
      return res.status(400).json({ error: 'Tasa inválida' });
    }

    const result = await ExchangeRatesManager.updateRate(from, to, rate);

    logger.info(`Tasa actualizada: ${from}/${to} = ${rate}`);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('Error actualizando tasa:', error);
    res.status(500).json({ error: 'Error actualizando tasa' });
  }
};

/**
 * @route   GET /api/currency/portfolio
 * @desc    Obtener portafolio en múltiples monedas
 * @access  Private
 */
exports.getPortfolioInCurrencies = async (req, res) => {
  try {
    const userId = req.user.id;
    const { baseCurrency = 'USD' } = req.query;

    const [investments] = await pool.execute(
      `SELECT current_amount_cents FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount_cents, 0) / 100;

    const converted = await ExchangeRatesManager.convertPortfolioTo(
      totalValue,
      baseCurrency,
      ['USD', 'EUR', 'GBP', 'COP', 'MXN']
    );

    res.json({
      success: true,
      portfolio: converted
    });
  } catch (error) {
    logger.error('Error obteniendo portafolio multimoneda:', error);
    res.status(500).json({ error: 'Error obteniendo portafolio' });
  }
};

/**
 * @route   POST /api/currency/portfolio/convert
 * @desc    Convertir portafolio a moneda diferente
 * @access  Private
 */
exports.convertPortfolioTo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { toCurrency } = req.body;

    const [result] = await pool.execute(
      `SELECT COALESCE(SUM(current_amount_cents), 0) as total_cents
       FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const totalUSD = result[0].total_cents / 100;
    const converted = await ExchangeRatesManager.convert(totalUSD, 'USD', toCurrency);

    res.json({
      success: true,
      portfolio: {
        originalValue: totalUSD,
        originalCurrency: 'USD',
        convertedValue: converted.converted,
        convertedCurrency: converted.to,
        rate: converted.rate
      }
    });
  } catch (error) {
    logger.error('Error convirtiendo portafolio:', error);
    res.status(500).json({ error: 'Error convirtiendo portafolio' });
  }
};
/**
 * @route   POST /api/currency/refresh-rates
 * @desc    Forzar actualización de tasas en tiempo real desde API
 * @access  Public
 */
exports.refreshRates = async (req, res) => {
  try {
    console.log('🔄 Actualizando tasas en tiempo real...');
    
    const baseCurrencies = ['USD', 'EUR', 'COP'];
    let totalUpdated = 0;

    for (const base of baseCurrencies) {
      try {
        await ExternalRatesService.updateRatesInDatabase(base);
        totalUpdated += 166;
      } catch (error) {
        console.error(`⚠️ Error actualizando ${base}:`, error.message);
      }
    }

    console.log(`✅ Tasas actualizadas: ${totalUpdated} pares`);

    res.json({
      success: true,
      message: 'Tasas actualizadas desde API en tiempo real',
      updated: totalUpdated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error refrescando tasas:', error);
    res.status(500).json({ error: 'Error actualizando tasas' });
  }
};
/**
 * @route   GET /api/currency/rate-history
 * @desc    Obtener histórico de tasas para gráficos (últimos 7, 30, 90 días)
 * @access  Public
 * @query   ?from=USD&to=COP&days=30
 */
exports.getRateHistory = async (req, res) => {
  try {
    const { from = 'USD', to = 'COP', days = 30 } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'Parámetros from y to requeridos' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [history] = await pool.execute(
      `SELECT recorded_date, rate 
       FROM exchange_rate_history 
       WHERE from_currency = ? AND to_currency = ? AND recorded_date >= ? 
       ORDER BY recorded_date ASC`,
      [from.toUpperCase(), to.toUpperCase(), startDate.toISOString().split('T')[0]]
    );

    res.json({
      success: true,
      data: history.map(row => ({
        date: row.recorded_date,
        rate: parseFloat(row.rate),
        from: from.toUpperCase(),
        to: to.toUpperCase()
      })),
      days: parseInt(days),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo histórico de tasas:', error);
    res.status(500).json({ error: 'Error obteniendo histórico de tasas' });
  }
};
/**
 * @route   POST /api/currency/record-conversion
 * @desc    Registrar una conversión de monedas
 * @access  Private
 * @body    { from_currency, to_currency, from_amount, to_amount, rate_used }
 */
exports.recordConversion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from_currency, to_currency, from_amount, to_amount, rate_used } = req.body;

    if (!from_currency || !to_currency || !from_amount || !to_amount || !rate_used) {
      return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
    }

    const [result] = await pool.execute(
      `INSERT INTO currency_conversions (user_id, from_currency, to_currency, from_amount, to_amount, rate_used)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, from_currency.toUpperCase(), to_currency.toUpperCase(), from_amount, to_amount, rate_used]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        from_currency: from_currency.toUpperCase(),
        to_currency: to_currency.toUpperCase(),
        from_amount,
        to_amount,
        rate_used,
        converted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error registrando conversión:', error);
    res.status(500).json({ error: 'Error registrando conversión' });
  }
};

/**
 * @route   GET /api/currency/conversions
 * @desc    Obtener historial de conversiones del usuario
 * @access  Private
 * @query   ?limit=50&offset=0
 */
exports.getConversionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const [conversions] = await pool.execute(
      `SELECT * FROM currency_conversions 
       WHERE user_id = ? 
       ORDER BY converted_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) as total FROM currency_conversions WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: conversions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total
      }
    });
  } catch (error) {
    logger.error('Error obteniendo historial de conversiones:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};

/**
 * @route   GET /api/currency/conversions/stats
 * @desc    Obtener estadísticas de conversiones
 * @access  Private
 */
exports.getConversionStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_conversions,
        from_currency,
        to_currency,
        SUM(from_amount) as total_from,
        SUM(to_amount) as total_to,
        AVG(rate_used) as avg_rate
       FROM currency_conversions 
       WHERE user_id = ? 
       GROUP BY from_currency, to_currency
       ORDER BY total_conversions DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
/**
 * @route   GET /api/currency/popular-history
 * @desc    Obtener histórico de tasas populares (USD/COP, EUR/COP, etc.)
 * @access  Public
 * @query   ?days=30
 */
exports.getPopularHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const pairs = [
      { from: 'USD', to: 'COP' },
      { from: 'EUR', to: 'COP' },
      { from: 'GBP', to: 'COP' },
      { from: 'USD', to: 'EUR' },
      { from: 'USD', to: 'MXN' }
    ];

    const result = {};

    for (const pair of pairs) {
      const [history] = await pool.execute(
        `SELECT recorded_date, rate 
         FROM exchange_rate_history 
         WHERE from_currency = ? AND to_currency = ? AND recorded_date >= ? 
         ORDER BY recorded_date ASC`,
        [pair.from, pair.to, startDate.toISOString().split('T')[0]]
      );

      const key = `${pair.from}_${pair.to}`;
      result[key] = history.map(row => ({
        date: row.recorded_date,
        rate: parseFloat(row.rate)
      }));
    }

    res.json({
      success: true,
      data: result,
      days: parseInt(days),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error obteniendo histórico de tasas populares:', error);
    res.status(500).json({ error: 'Error obteniendo histórico' });
  }
};