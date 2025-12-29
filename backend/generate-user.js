const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createUser() {
  try {
    // Generar hash para la contraseña "password123"
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    console.log('Hash generado:', passwordHash);
    console.log('Contraseña de prueba: password123');
    
    // Conectar a la base de datos y actualizar el usuario
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'investment_tracker'
    });
    
    await connection.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, 'leider.epalacios@gmail.com']
    );
    
    console.log('✅ Usuario actualizado correctamente');
    console.log('Email: leider.epalacios@gmail.com');
    console.log('Contraseña: password123');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createUser();
