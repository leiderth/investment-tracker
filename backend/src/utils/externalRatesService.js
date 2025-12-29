/**
 * Servicio para obtener tasas de cambio REALES y ACTUALIZADAS
 * Usando APIs confiables con datos del Banco Central Europeo y mercado real
 */

const axios = require('axios');
const pool = require('../config/database');
const logger = require('./logger');

// APIs con datos REALES y actualizados en tiempo real
const APIS = {
  // ECB-based (Banco Central Europeo - oficial)
  ecb: 'https://api.exchangerate.host/latest',
  
  // Fixer.io alternative (datos muy precisos)
  fixer: 'https://api.exchangerate-api.com/v4/latest',
  
  // Open Exchange Rates alternative
  openER: 'https://open.er-api.com/v6/latest',
  
  // Backup API con datos actualizados
  backup: 'https://api.exchangerate.app/latest'
};

class ExternalRatesService {
  /**
   * Intentar obtener tasas de múltiples APIs ordenadas por confiabilidad y actualización
   * Prioridad: ECB (Banco Central Europeo) > Fixer > Open ER > Backup
   */
  static async tryMultipleApis(baseCurrency = 'USD') {
    const apiConfigs = [
      {
        name: 'ECB (Banco Central Europeo)',
        url: `${APIS.ecb}?base=${baseCurrency}`,
        parser: (data) => data.rates || {}
      },
      {
        name: 'Fixer/ExchangeRate-API',
        url: `${APIS.fixer}/${baseCurrency}`,
        parser: (data) => data.rates || {}
      },
      {
        name: 'Open Exchange Rates',
        url: `${APIS.openER}?base=${baseCurrency}`,
        parser: (data) => data.rates || {}
      },
      {
        name: 'ExchangeRate.app',
        url: `${APIS.backup}?base=${baseCurrency}`,
        parser: (data) => data.rates || {}
      }
    ];

    for (let i = 0; i < apiConfigs.length; i++) {
      const config = apiConfigs[i];
      try {
        console.log(`📡 Intentando ${config.name}...`);
        
        const response = await axios.get(config.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'InvestmentTracker/1.0',
            'Accept': 'application/json'
          }
        });

        const rates = config.parser(response.data);

        if (Object.keys(rates).length > 0) {
          console.log(`✅ ${config.name} exitosa: ${Object.keys(rates).length} tasas obtenidas`);
          
          // Mostrar muestra de tasas importantes para verificación
          if (baseCurrency === 'USD') {
            console.log(`   📊 Muestra: 1 USD = ${rates.COP?.toFixed(2) || 'N/A'} COP, ${rates.EUR?.toFixed(4) || 'N/A'} EUR`);
          }
          
          return {
            baseCurrency,
            rates,
            source: config.name,
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        console.log(`⚠️ ${config.name} falló: ${error.message.split('\n')[0]}`);
        continue;
      }
    }

    throw new Error('❌ Todas las APIs fallaron - No se pudieron obtener tasas reales');
  }

  /**
   * Obtener tasas reales con fallback a múltiples APIs
   */
  static async fetchRealRates(baseCurrency = 'USD') {
    try {
      console.log(`📡 Obteniendo tasas reales para ${baseCurrency}...`);
      
      const result = await this.tryMultipleApis(baseCurrency);
      
      return result;
    } catch (error) {
      console.error(`❌ Error obteniendo tasas de ${baseCurrency}:`, error.message);
      throw error;
    }
  }

  /**
   * Actualizar las tasas en la BD desde la API
   */
  static async updateRatesInDatabase(baseCurrency = 'USD') {
    try {
      const { rates, source } = await this.fetchRealRates(baseCurrency);

      // Insertar tasas en la BD
      let inserted = 0;
      for (const [toCurrency, rate] of Object.entries(rates)) {
        await pool.execute(
          `INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           rate = VALUES(rate),
           recorded_at = CURRENT_TIMESTAMP`,
          [baseCurrency, toCurrency, rate, source || 'external-api']
        );
        inserted++;
      }

      console.log(`✅ ${inserted} tasas actualizadas en la BD (Fuente: ${source})`);

      // Verificar y disparar alertas
      const currencyAlertsController = require('../controllers/currency-alerts.controller');
      currencyAlertsController.checkAndTriggerAlerts(baseCurrency, rates).catch(err => 
        console.error('Error verificando alertas:', err.message)
      );

      return { success: true, inserted, source };
    } catch (error) {
      logger.error('Error actualizando tasas en BD:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las tasas (API + BD como fallback) con múltiples bases
   */
  static async getAllRatesWithFallback() {
    try {
      // Obtener tasas de múltiples bases para cobertura completa
      const baseCurrencies = ['USD', 'EUR', 'COP'];
      const formattedRates = {};

      for (const base of baseCurrencies) {
        try {
          const { rates } = await this.fetchRealRates(base);
          
          formattedRates[base] = {};
          for (const [currency, rate] of Object.entries(rates)) {
            formattedRates[base][currency] = {
              rate: parseFloat(rate),
              timestamp: new Date().toISOString(),
              source: 'live'
            };
          }

          // Actualizar en BD en background (sin bloquear)
          this.updateRatesInDatabase(base).catch(err => 
            console.error(`Error en actualización de ${base}:`, err.message)
          );
        } catch (err) {
          console.warn(`⚠️ Error obteniendo tasas para ${base}:`, err.message);
        }
      }

      return formattedRates;
    } catch (error) {
      console.warn('⚠️ API externa no disponible, usando BD como fallback');
      
      // Fallback: obtener de la BD
      try {
        const [rows] = await pool.execute(
          `SELECT from_currency, to_currency, rate, recorded_at
           FROM exchange_rates
           ORDER BY recorded_at DESC`
        );

        const formattedRates = {};
        rows.forEach(row => {
          if (!formattedRates[row.from_currency]) {
            formattedRates[row.from_currency] = {};
          }
          formattedRates[row.from_currency][row.to_currency] = {
            rate: parseFloat(row.rate),
            timestamp: row.recorded_at,
            source: 'cached'
          };
        });

        return formattedRates;
      } catch (dbError) {
        logger.error('Error obteniendo tasas de fallback:', dbError);
        throw new Error('No se pudieron obtener tasas de cambio');
      }
    }
  }

  /**
   * Guardar histórico diario de tasas (se ejecuta una vez al día)
   */
  static async saveHistoricalDaily() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const baseCurrencies = ['USD', 'EUR', 'COP'];

      for (const base of baseCurrencies) {
        try {
          const { rates } = await this.fetchRealRates(base);
          
          // Guardar cada tasa en tabla de histórico
          for (const [toCurrency, rate] of Object.entries(rates)) {
            await pool.execute(
              `INSERT INTO exchange_rate_history (from_currency, to_currency, rate, recorded_date)
               VALUES (?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               rate = VALUES(rate)`,
              [base, toCurrency, rate, today]
            );
          }

          console.log(`✅ Histórico guardado para ${base} en ${today}`);
        } catch (err) {
          console.error(`Error guardando histórico de ${base}:`, err.message);
        }
      }
    } catch (error) {
      console.error('Error guardando histórico diario:', error.message);
    }
  }

  /**
   * Iniciar actualización automática cada hora (múltiples bases)
   */
  static startAutoUpdate(intervalMinutes = 60) {
    console.log(`🔄 Actualizador de tasas iniciado (cada ${intervalMinutes} minutos)`);
    
    const baseCurrencies = ['USD', 'EUR', 'COP'];

    // Actualizar inmediatamente
    baseCurrencies.forEach(base => {
      this.updateRatesInDatabase(base).catch(err => 
        console.error(`Error en actualización inicial de ${base}:`, err.message)
      );
    });

    // Guardar histórico al inicio del día
    this.saveHistoricalDaily();

    // Luego cada X minutos
    setInterval(() => {
      baseCurrencies.forEach(base => {
        this.updateRatesInDatabase(base).catch(err => 
          console.error(`Error en actualización de ${base}:`, err.message)
        );
      });
    }, intervalMinutes * 60 * 1000);

    // Guardar histórico diariamente a las 12:00 AM UTC
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.saveHistoricalDaily();
      }
    }, 60000); // Verificar cada minuto
  }
}

module.exports = ExternalRatesService;
