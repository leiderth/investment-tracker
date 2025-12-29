/**
 * Currency Service
 * Maneja conversión de monedas, tasas de cambio y conversiones
 */

const pool = require('../config/database');
const logger = require('./logger');

// Monedas soportadas
const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR',
  'MXN', 'BRL', 'ARS', 'COP', 'CLP'
];

/**
 * Obtener tasa de cambio entre dos monedas
 * @param {string} fromCurrency - Moneda origen
 * @param {string} toCurrency - Moneda destino
 * @returns {Promise<number>} Tasa de cambio
 */
async function getExchangeRate(fromCurrency, toCurrency) {
  try {
    // Si son la misma moneda, retornar 1
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Buscar en base de datos
    const [rows] = await pool.execute(
      `SELECT rate FROM exchange_rates 
       WHERE from_currency = ? AND to_currency = ? AND is_active = TRUE
       ORDER BY rate_timestamp DESC
       LIMIT 1`,
      [fromCurrency.toUpperCase(), toCurrency.toUpperCase()]
    );

    if (rows.length > 0) {
      return parseFloat(rows[0].rate);
    }

    // Si no encuentra la combinación directa, intentar inversa
    const [inverseRows] = await pool.execute(
      `SELECT rate FROM exchange_rates 
       WHERE from_currency = ? AND to_currency = ? AND is_active = TRUE
       ORDER BY rate_timestamp DESC
       LIMIT 1`,
      [toCurrency.toUpperCase(), fromCurrency.toUpperCase()]
    );

    if (inverseRows.length > 0) {
      return 1 / parseFloat(inverseRows[0].rate);
    }

    // Si tampoco encuentra, usar USD como intermediario
    return await convertThroughUSD(fromCurrency, toCurrency);
  } catch (error) {
    logger.error('Error obteniendo tasa de cambio:', error);
    throw new Error(`No se puede obtener tasa de cambio ${fromCurrency}/${toCurrency}`);
  }
}

/**
 * Convertir a través de USD como moneda intermediaria
 */
async function convertThroughUSD(fromCurrency, toCurrency) {
  try {
    const rateToUSD = await getExchangeRate(fromCurrency, 'USD');
    const rateFromUSD = await getExchangeRate('USD', toCurrency);
    return rateToUSD * rateFromUSD;
  } catch (error) {
    logger.error('Error en conversión a través de USD:', error);
    throw error;
  }
}

/**
 * Convertir cantidad de una moneda a otra
 * @param {number} amount - Cantidad a convertir
 * @param {string} fromCurrency - Moneda origen
 * @param {string} toCurrency - Moneda destino
 * @returns {Promise<number>} Cantidad convertida
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Obtener todas las tasas de cambio disponibles
 * @returns {Promise<array>} Array de tasas de cambio
 */
async function getAllExchangeRates() {
  try {
    const [rates] = await pool.execute(
      `SELECT 
        from_currency,
        to_currency,
        rate,
        rate_timestamp
       FROM exchange_rates 
       WHERE is_active = TRUE
       ORDER BY from_currency, to_currency`
    );

    return rates;
  } catch (error) {
    logger.error('Error obteniendo tasas de cambio:', error);
    throw error;
  }
}

/**
 * Actualizar tasa de cambio
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {number} rate
 * @returns {Promise<object>} Resultado de la actualización
 */
async function updateExchangeRate(fromCurrency, toCurrency, rate) {
  try {
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();

    const [result] = await pool.execute(
      `INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
       VALUES (?, ?, ?, 'MANUAL')
       ON DUPLICATE KEY UPDATE 
         rate = VALUES(rate),
         rate_timestamp = CURRENT_TIMESTAMP,
         source = 'MANUAL'`,
      [fromCurrency, toCurrency, rate]
    );

    // Guardar en historial
    await pool.execute(
      `INSERT INTO exchange_rate_history (from_currency, to_currency, rate, recorded_date)
       VALUES (?, ?, ?, CURDATE())
       ON DUPLICATE KEY UPDATE rate = VALUES(rate)`,
      [fromCurrency, toCurrency, rate]
    );

    return {
      success: true,
      message: `Tasa de cambio actualizada: ${fromCurrency}/${toCurrency} = ${rate}`
    };
  } catch (error) {
    logger.error('Error actualizando tasa de cambio:', error);
    throw error;
  }
}

/**
 * Obtener historial de tasas de cambio
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {number} days - Últimos N días
 * @returns {Promise<array>} Historial de tasas
 */
async function getExchangeRateHistory(fromCurrency, toCurrency, days = 30) {
  try {
    const [history] = await pool.execute(
      `SELECT 
        from_currency,
        to_currency,
        rate,
        recorded_date
       FROM exchange_rate_history
       WHERE from_currency = ? 
         AND to_currency = ?
         AND recorded_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY recorded_date ASC`,
      [fromCurrency.toUpperCase(), toCurrency.toUpperCase(), days]
    );

    return history;
  } catch (error) {
    logger.error('Error obteniendo historial de tasas:', error);
    throw error;
  }
}

/**
 * Convertir portafolio completo a moneda objetivo
 * @param {number} userId
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @returns {Promise<array>} Array de inversiones convertidas
 */
async function convertPortfolio(userId, fromCurrency, toCurrency) {
  try {
    const [investments] = await pool.execute(
      `SELECT 
        id,
        type,
        platform,
        currency,
        current_amount_cents,
        initial_amount_cents
       FROM investments
       WHERE user_id = ? AND currency = ?`,
      [userId, fromCurrency.toUpperCase()]
    );

    const converted = [];
    for (const inv of investments) {
      const rate = await getExchangeRate(inv.currency, toCurrency);
      converted.push({
        id: inv.id,
        type: inv.type,
        platform: inv.platform,
        originalCurrency: inv.currency,
        originalAmount: inv.current_amount_cents / 100,
        convertedCurrency: toCurrency,
        convertedAmount: (inv.current_amount_cents * rate) / 100,
        rate
      });
    }

    return converted;
  } catch (error) {
    logger.error('Error convirtiendo portafolio:', error);
    throw error;
  }
}

/**
 * Obtener resumen del portafolio en múltiples monedas
 */
async function getPortfolioInMultipleCurrencies(userId, baseCurrency = 'USD') {
  try {
    const [investments] = await pool.execute(
      `SELECT 
        currency,
        COUNT(*) as count,
        SUM(current_amount_cents) as total_cents
       FROM investments
       WHERE user_id = ? AND status = 'active'
       GROUP BY currency`,
      [userId]
    );

    let totalInBaseCurrency = 0;
    const breakdown = [];

    for (const inv of investments) {
      const rate = await getExchangeRate(inv.currency, baseCurrency);
      const amountInBase = (inv.total_cents * rate) / 100;
      totalInBaseCurrency += amountInBase;

      breakdown.push({
        currency: inv.currency,
        count: inv.count,
        amountOriginal: inv.total_cents / 100,
        amountInBase,
        rate,
        percentage: 0 // Se calcula después
      });
    }

    // Calcular porcentajes
    breakdown.forEach(b => {
      b.percentage = parseFloat(((b.amountInBase / totalInBaseCurrency) * 100).toFixed(2));
    });

    return {
      baseCurrency,
      totalInBaseCurrency,
      breakdown
    };
  } catch (error) {
    logger.error('Error obteniendo portafolio multimoneda:', error);
    throw error;
  }
}

/**
 * Validar que una moneda sea soportada
 */
function isValidCurrency(currency) {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}

/**
 * Obtener lista de monedas soportadas
 */
function getSupportedCurrencies() {
  return SUPPORTED_CURRENCIES;
}

module.exports = {
  getExchangeRate,
  convertCurrency,
  getAllExchangeRates,
  updateExchangeRate,
  getExchangeRateHistory,
  convertPortfolio,
  getPortfolioInMultipleCurrencies,
  isValidCurrency,
  getSupportedCurrencies
};
