const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'investment-tracker',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de conexión al arrancar
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL exitosa - Base de datos: investment-tracker');
    connection.release();
  } catch (err) {
    console.error('❌ Error conectando a MySQL:', err.message);
    console.error('Verifica que:');
    console.error('1. XAMPP/MySQL esté corriendo');
    console.error('2. La base de datos "investment-tracker" exista');
    console.error('3. Las credenciales en .env sean correctas');
  }
})();

module.exports = pool;