#!/usr/bin/env node

const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Script para inicializar tasas de cambio
 */
async function initCurrencyRates() {
  let connection;
  try {
    console.log('🔄 Inicializando tasas de cambio...\n');

    const baseRates = [
      { from: 'USD', to: 'USD', rate: 1.0 },
      { from: 'USD', to: 'EUR', rate: 0.92 },
      { from: 'USD', to: 'GBP', rate: 0.79 },
      { from: 'USD', to: 'JPY', rate: 149.5 },
      { from: 'USD', to: 'COP', rate: 4285.5 },
      { from: 'USD', to: 'MXN', rate: 17.05 },
      { from: 'USD', to: 'BRL', rate: 4.97 },
      { from: 'EUR', to: 'USD', rate: 1.087 },
      { from: 'EUR', to: 'GBP', rate: 0.86 },
      { from: 'GBP', to: 'USD', rate: 1.266 },
      { from: 'COP', to: 'USD', rate: 1/4285.5 },
      { from: 'MXN', to: 'USD', rate: 1/17.05 },
      { from: 'BRL', to: 'USD', rate: 1/4.97 }
    ];

    // Limpiar tasas existentes
    await pool.execute('DELETE FROM exchange_rates');
    console.log('✅ Tabla limpiada');

    // Insertar tasas
    for (const rate of baseRates) {
      const [result] = await pool.execute(
        `INSERT INTO exchange_rates (from_currency, to_currency, rate, source)
         VALUES (?, ?, ?, ?)`,
        [rate.from, rate.to, rate.rate, 'initial']
      );
      console.log(`  ✅ ${rate.from}/${rate.to} = ${rate.rate.toFixed(4)}`);
    }

    console.log(`\n✨ Se han insertado ${baseRates.length} tasas de cambio`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initCurrencyRates();
