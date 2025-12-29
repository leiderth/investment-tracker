const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    // Primero, obtenemos la ruta del directorio de datos de MySQL
    // e intentamos eliminar los archivos directamente
    
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
    
    try {
      // Intentar eliminar la base de datos
      await conn.query('DROP DATABASE investment_tracker');
      console.log('✅ Base de datos eliminada');
    } catch (err) {
      if (err.code === 'ER_DB_DROP_EXISTS') {
        console.log('✅ Base de datos no existía');
      } else {
        console.warn('⚠️ Error al eliminar:', err.message);
      }
    }
    
    // Crear la nueva base de datos
    await conn.query('CREATE DATABASE investment_tracker');
    console.log('✅ Base de datos investment_tracker creada correctamente');
    
    await conn.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Si todo falla, al menos intentamos limpiar los archivos
    try {
      const xamppPath = 'C:\\xampp\\mysql\\data\\investment_tracker';
      if (fs.existsSync(xamppPath)) {
        console.log('Intentando eliminar carpeta de datos...');
        fs.rmSync(xamppPath, { recursive: true, force: true });
        console.log('✅ Carpeta de datos eliminada');
      }
    } catch (cleanErr) {
      console.error('No se pudo limpiar la carpeta:', cleanErr.message);
    }
    
    process.exit(1);
  }
})();
