const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  try {
    // Conexión sin especificar la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a MySQL');

    // Crear la base de datos
    await connection.query(`CREATE DATABASE IF NOT EXISTS investment_tracker`);
    console.log('✅ Base de datos creada/verificada');

    // Seleccionar la base de datos
    await connection.query('USE investment_tracker');

    // Crear tabla de usuarios
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) UNIQUE NOT NULL,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`country\` VARCHAR(100),
        \`currency\` VARCHAR(10) DEFAULT 'USD',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla usuarios creada');

    // Crear tabla de inversiones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`investments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`amount\` DECIMAL(15, 2) NOT NULL,
        \`currency\` VARCHAR(10) DEFAULT 'USD',
        \`purchase_date\` DATE NOT NULL,
        \`current_value\` DECIMAL(15, 2),
        \`notes\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY \`fk_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_investments_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla inversiones creada');

    // Crear tabla de transacciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`transactions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`investment_id\` INT NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`amount\` DECIMAL(15, 2) NOT NULL,
        \`price\` DECIMAL(15, 2),
        \`date\` DATE NOT NULL,
        \`notes\` TEXT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY \`fk_investment_id\` (\`investment_id\`),
        CONSTRAINT \`fk_transactions_investment\` FOREIGN KEY (\`investment_id\`) REFERENCES \`investments\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla transacciones creada');

    // Crear tabla de metas (sin constraint de FK primero)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`goals\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`target_amount\` DECIMAL(15, 2) NOT NULL,
        \`current_amount\` DECIMAL(15, 2) DEFAULT 0,
        \`deadline\` DATE,
        \`priority\` VARCHAR(50) DEFAULT 'medium',
        \`status\` VARCHAR(50) DEFAULT 'active',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla metas creada');

    // Crear tabla de simulaciones
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`simulations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`initial_amount\` DECIMAL(15, 2) NOT NULL,
        \`annual_return\` DECIMAL(5, 2) DEFAULT 0,
        \`years\` INT DEFAULT 10,
        \`final_amount\` DECIMAL(15, 2),
        \`scenario_type\` VARCHAR(50) DEFAULT 'conservative',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla simulaciones creada');

    // Crear tabla de tasas de cambio
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`exchange_rates\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`from_currency\` VARCHAR(10) NOT NULL,
        \`to_currency\` VARCHAR(10) NOT NULL,
        \`rate\` DECIMAL(18, 6) NOT NULL,
        \`source\` VARCHAR(50) DEFAULT 'API',
        \`recorded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_pair\` (\`from_currency\`, \`to_currency\`),
        INDEX \`idx_from\` (\`from_currency\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla exchange_rates creada');

    // Crear tabla de histórico de tasas de cambio
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`exchange_rate_history\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`from_currency\` VARCHAR(10) NOT NULL,
        \`to_currency\` VARCHAR(10) NOT NULL,
        \`rate\` DECIMAL(18, 6) NOT NULL,
        \`recorded_date\` DATE NOT NULL,
        \`recorded_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_daily_pair\` (\`from_currency\`, \`to_currency\`, \`recorded_date\`),
        INDEX \`idx_from_currency\` (\`from_currency\`),
        INDEX \`idx_recorded_date\` (\`recorded_date\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla exchange_rate_history creada');

    console.log('\n✅ Base de datos inicializada correctamente');
    await connection.end();

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
