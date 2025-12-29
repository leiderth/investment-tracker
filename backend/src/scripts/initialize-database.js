// backend/src/scripts/initialize-database.js

/**
 * Script para inicializar la base de datos con datos
 * Ejecutar: node src/scripts/initialize-database.js
 */

const pool = require('../config/database');
const ExchangeRatesManager = require('../utils/exchangeRatesManager');
const logger = require('../utils/logger');

async function initializeDatabase() {
  try {
    console.log('🔧 Inicializando base de datos...\n');

    // 1. Crear tablas si no existen
    console.log('📋 Creando tablas...');
    await createTables();
    console.log('✅ Tablas creadas\n');

    // 2. Inicializar tasas de cambio
    console.log('💱 Inicializando tasas de cambio...');
    await ExchangeRatesManager.initializeBaseRates();
    console.log('✅ Tasas de cambio inicializadas\n');

    // 3. Crear snapshot inicial para usuarios existentes
    console.log('📸 Creando snapshots iniciales...');
    await createInitialSnapshots();
    console.log('✅ Snapshots creados\n');

    console.log('🎉 Base de datos inicializada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando BD:', error);
    process.exit(1);
  }
}

async function createTables() {
  const tables = [
    // Investment Snapshots
    `CREATE TABLE IF NOT EXISTS investment_snapshots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      investment_id INT NOT NULL,
      snapshot_date DATE NOT NULL,
      value_cents BIGINT NOT NULL DEFAULT 0 CHECK (value_cents >= 0),
      transaction_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
      INDEX idx_investment_date (investment_id, snapshot_date),
      INDEX idx_snapshot_date (snapshot_date),
      UNIQUE KEY unique_investment_snapshot (investment_id, snapshot_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Exchange Rates
    `CREATE TABLE IF NOT EXISTS exchange_rates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      from_currency VARCHAR(3) NOT NULL,
      to_currency VARCHAR(3) NOT NULL,
      rate DECIMAL(18, 8) NOT NULL CHECK (rate > 0),
      source VARCHAR(50) DEFAULT 'manual',
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_rate_timestamp (from_currency, to_currency, DATE(recorded_at)),
      INDEX idx_currency_pair (from_currency, to_currency),
      INDEX idx_recorded_date (recorded_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Currency Conversions
    `CREATE TABLE IF NOT EXISTS currency_conversions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      from_currency VARCHAR(3) NOT NULL,
      to_currency VARCHAR(3) NOT NULL,
      from_amount DECIMAL(15, 2) NOT NULL,
      to_amount DECIMAL(15, 2) NOT NULL,
      rate DECIMAL(18, 8) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_conversions (user_id, created_at),
      INDEX idx_conversion_date (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // User Currency Preferences
    `CREATE TABLE IF NOT EXISTS user_currency_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      base_currency VARCHAR(3) DEFAULT 'USD',
      preferred_currencies JSON DEFAULT NULL,
      auto_sync BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Portfolio Daily Metrics
    `CREATE TABLE IF NOT EXISTS portfolio_daily_metrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      metric_date DATE NOT NULL,
      total_value_cents BIGINT NOT NULL DEFAULT 0,
      total_invested_cents BIGINT NOT NULL DEFAULT 0,
      total_profit_cents BIGINT NOT NULL DEFAULT 0,
      return_percentage DECIMAL(10, 4) DEFAULT 0,
      diversification_score DECIMAL(5, 2) DEFAULT 0,
      risk_level VARCHAR(20),
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_date (user_id, metric_date),
      INDEX idx_user_metrics (user_id, metric_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

    // Transaction History
    `CREATE TABLE IF NOT EXISTS transaction_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      investment_id INT NOT NULL,
      transaction_type ENUM('compra', 'venta', 'dividendo', 'ajuste', 'split') NOT NULL,
      amount_cents BIGINT NOT NULL,
      quantity DECIMAL(15, 8),
      price_per_unit DECIMAL(15, 8),
      notes TEXT,
      transaction_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
      INDEX idx_investment_history (investment_id, transaction_date),
      INDEX idx_transaction_date (transaction_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  ];

  for (const table of tables) {
    try {
      await pool.execute(table);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }

  // Agregar campos a investments si no existen
  try {
    await pool.execute(`ALTER TABLE investments ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medio' AFTER status`);
  } catch (error) {
    if (!error.message.includes('Duplicate column name')) {
      throw error;
    }
  }

  try {
    await pool.execute(`ALTER TABLE investments ADD COLUMN sector VARCHAR(100) AFTER type`);
  } catch (error) {
    if (!error.message.includes('Duplicate column name')) {
      throw error;
    }
  }

  try {
    await pool.execute(`ALTER TABLE investments ADD COLUMN annual_return_percentage DECIMAL(8, 2) DEFAULT 0`);
  } catch (error) {
    if (!error.message.includes('Duplicate column name')) {
      throw error;
    }
  }
}

async function createInitialSnapshots() {
  try {
    // Obtener todos los usuarios con inversiones
    const [users] = await pool.execute(`
      SELECT DISTINCT user_id FROM investments WHERE status = 'active'
    `);

    for (const { user_id } of users) {
      // Crear snapshots para hoy si no existen
      const [investments] = await pool.execute(
        `SELECT id, current_amount_cents FROM investments WHERE user_id = ? AND status = 'active'`,
        [user_id]
      );

      for (const inv of investments) {
        try {
          await pool.execute(
            `INSERT IGNORE INTO investment_snapshots (investment_id, snapshot_date, value_cents)
             VALUES (?, CURDATE(), ?)`,
            [inv.id, inv.current_amount_cents]
          );
        } catch (error) {
          // Ignorar duplicados
        }
      }

      // Crear métrica diaria
      const [stats] = await pool.execute(
        `SELECT 
          COALESCE(SUM(current_amount_cents), 0) as total_value_cents,
          COALESCE(SUM(initial_amount_cents), 0) as total_invested_cents
         FROM investments WHERE user_id = ? AND status = 'active'`,
        [user_id]
      );

      const totalValue = stats[0].total_value_cents;
      const totalInvested = stats[0].total_invested_cents;
      const totalProfit = totalValue - totalInvested;
      const returnPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

      try {
        await pool.execute(
          `INSERT INTO portfolio_daily_metrics 
           (user_id, metric_date, total_value_cents, total_invested_cents, total_profit_cents, return_percentage, risk_level)
           VALUES (?, CURDATE(), ?, ?, ?, ?, 'medio')
           ON DUPLICATE KEY UPDATE
           total_value_cents = VALUES(total_value_cents)`,
          [user_id, totalValue, totalInvested, totalProfit, returnPercent]
        );
      } catch (error) {
        // Ignorar duplicados
      }
    }
  } catch (error) {
    console.error('Error creando snapshots:', error.message);
    // No fallar el script por esto
  }
}

// Ejecutar
initializeDatabase();
