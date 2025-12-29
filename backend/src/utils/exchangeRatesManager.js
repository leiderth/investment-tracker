// backend/src/utils/exchangeRatesManager.js

const pool = require('../config/database');

/**
 * Gestor de tasas de cambio
 * Maneja todo lo relacionado con tasas de cambio, conversiones y historial
 */

class ExchangeRatesManager {
  /**
   * Obtener tasa de cambio actual
   */
  static async getRate(fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) return 1.0;

      const [rows] = await pool.execute(
        `SELECT rate FROM exchange_rates 
         WHERE from_currency = ? AND to_currency = ?
         ORDER BY created_at DESC LIMIT 1`,
        [fromCurrency.toUpperCase(), toCurrency.toUpperCase()]
      );

      if (rows.length > 0) {
        return parseFloat(rows[0].rate);
      }

      // Si no existe, intentar conversión inversa
      const [inverse] = await pool.execute(
        `SELECT rate FROM exchange_rates 
         WHERE from_currency = ? AND to_currency = ?
         ORDER BY created_at DESC LIMIT 1`,
        [toCurrency.toUpperCase(), fromCurrency.toUpperCase()]
      );

      if (inverse.length > 0) {
        return 1 / parseFloat(inverse[0].rate);
      }

      throw new Error(`No se encontró tasa para ${fromCurrency}/${toCurrency}`);
    } catch (error) {
      console.error('Error obteniendo tasa:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las tasas disponibles
   */
  static async getAllRates() {
    try {
      // Obtener las tasas más recientes para cada par de monedas
      // Sin usar ninguna columna de timestamp (solo tomamos los registros actuales)
      const [rows] = await pool.execute(
        `SELECT from_currency, to_currency, rate, id
         FROM exchange_rates
         WHERE id IN (
           SELECT MAX(id)
           FROM exchange_rates
           GROUP BY from_currency, to_currency
         )
         ORDER BY from_currency, to_currency`
      );

      // Agrupar por moneda
      const rates = {};
      rows.forEach(row => {
        if (!rates[row.from_currency]) {
          rates[row.from_currency] = {};
        }
        rates[row.from_currency][row.to_currency] = {
          rate: parseFloat(row.rate),
          timestamp: new Date().toISOString()
        };
      });

      return {
        data: rates,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo tasas:', error);
      throw error;
    }
  }

  /**
   * Actualizar tasa de cambio
   */
  static async updateRate(fromCurrency, toCurrency, rate) {
    try {
      const from = fromCurrency.toUpperCase();
      const to = toCurrency.toUpperCase();

      if (rate <= 0) throw new Error('La tasa debe ser positiva');

      const [result] = await pool.execute(
        `INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
         VALUES (?, ?, ?, 'manual')
         ON DUPLICATE KEY UPDATE
         rate = VALUES(rate),
         recorded_at = CURRENT_TIMESTAMP`,
        [from, to, rate]
      );

      return {
        success: true,
        from,
        to,
        rate,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error actualizando tasa:', error);
      throw error;
    }
  }

  /**
   * Convertir cantidad entre monedas
   */
  static async convert(amount, fromCurrency, toCurrency) {
    try {
      if (fromCurrency === toCurrency) {
        return {
          amount,
          converted: amount,
          rate: 1.0,
          from: fromCurrency,
          to: toCurrency
        };
      }

      const rate = await this.getRate(fromCurrency, toCurrency);
      const converted = amount * rate;

      return {
        amount,
        converted: parseFloat(converted.toFixed(2)),
        rate: parseFloat(rate.toFixed(8)),
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase()
      };
    } catch (error) {
      console.error('Error en conversión:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de tasas
   */
  static async getHistory(fromCurrency, toCurrency, daysBack = 30) {
    try {
      const [rows] = await pool.execute(
        `SELECT rate, id
         FROM exchange_rates
         WHERE from_currency = ? AND to_currency = ?
         ORDER BY id ASC
         LIMIT 100`,
        [fromCurrency.toUpperCase(), toCurrency.toUpperCase()]
      );

      return {
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        daysBack,
        data: rows.map((r, idx) => ({
          date: new Date(Date.now() - (rows.length - idx) * 86400000).toISOString(),
          rate: parseFloat(r.rate)
        }))
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Registrar conversión de usuario
   */
  static async recordConversion(userId, fromCurrency, toCurrency, fromAmount, toAmount, rate) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO currency_conversions 
         (user_id, from_currency, to_currency, from_amount, to_amount, rate)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, fromCurrency.toUpperCase(), toCurrency.toUpperCase(), fromAmount, toAmount, rate]
      );

      return { success: true, id: result.insertId };
    } catch (error) {
      console.error('Error registrando conversión:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de conversiones del usuario
   */
  static async getUserConversions(userId, limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM currency_conversions
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return rows;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Obtener preferencias de moneda del usuario
   */
  static async getUserPreferences(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM user_currency_preferences
         WHERE user_id = ?`,
        [userId]
      );

      if (rows.length === 0) {
        // Crear preferencias por defecto
        await pool.execute(
          `INSERT INTO user_currency_preferences (user_id, base_currency)
           VALUES (?, 'USD')`,
          [userId]
        );
        return {
          user_id: userId,
          base_currency: 'USD',
          preferred_currencies: null,
          auto_sync: false
        };
      }

      return rows[0];
    } catch (error) {
      console.error('Error obteniendo preferencias:', error);
      throw error;
    }
  }

  /**
   * Actualizar preferencias de moneda
   */
  static async updateUserPreferences(userId, baseCurrency, preferredCurrencies) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO user_currency_preferences (user_id, base_currency, preferred_currencies)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         base_currency = VALUES(base_currency),
         preferred_currencies = VALUES(preferred_currencies)`,
        [userId, baseCurrency, JSON.stringify(preferredCurrencies || [])]
      );

      return { success: true };
    } catch (error) {
      console.error('Error actualizando preferencias:', error);
      throw error;
    }
  }

  /**
   * Obtener monedas soportadas
   */
  static async getSupportedCurrencies() {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT from_currency as currency FROM exchange_rates
         UNION
         SELECT DISTINCT to_currency as currency FROM exchange_rates
         ORDER BY currency`
      );

      const currencies = rows.map(r => r.currency);
      
      return {
        currencies,
        count: currencies.length,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error obteniendo monedas:', error);
      throw error;
    }
  }

  /**
   * Convertir portafolio a múltiples monedas
   */
  static async convertPortfolioTo(portfolio, baseCurrency, targetCurrencies) {
    try {
      const converted = {
        [baseCurrency]: portfolio
      };

      for (const currency of targetCurrencies) {
        if (currency !== baseCurrency) {
          const rate = await this.getRate(baseCurrency, currency);
          converted[currency] = portfolio * rate;
        }
      }

      return converted;
    } catch (error) {
      console.error('Error convirtiendo portafolio:', error);
      throw error;
    }
  }

  /**
   * Inicializar tasas base
   */
  static async initializeBaseRates() {
    try {
      const baseRates = [
        { from: 'USD', to: 'USD', rate: 1.0 },
        { from: 'USD', to: 'EUR', rate: 0.92 },
        { from: 'USD', to: 'GBP', rate: 0.79 },
        { from: 'USD', to: 'JPY', rate: 149.5 },
        { from: 'USD', to: 'COP', rate: 4285.5 },
        { from: 'USD', to: 'MXN', rate: 17.05 },
        { from: 'USD', to: 'BRL', rate: 4.97 }
      ];

      for (const rate of baseRates) {
        await this.updateRate(rate.from, rate.to, rate.rate);
      }

      return { success: true, initialized: baseRates.length };
    } catch (error) {
      console.error('Error inicializando tasas:', error);
      throw error;
    }
  }
}

module.exports = ExchangeRatesManager;
