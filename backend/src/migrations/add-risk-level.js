// backend/src/migrations/add-risk-level.js

const pool = require('../config/database');

async function addRiskLevelField() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n🔄 Verificando estructura de tabla investments...');
    
    // Verificar si la columna risk_level existe
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'investments' AND COLUMN_NAME = 'risk_level'"
    );

    if (columns.length === 0) {
      console.log('📝 Agregando columna risk_level...');
      
      await connection.execute(`
        ALTER TABLE investments 
        ADD COLUMN risk_level VARCHAR(20) DEFAULT 'medio' 
        AFTER expected_return_percentage
      `);
      
      console.log('✅ Columna risk_level agregada exitosamente');
    } else {
      console.log('✅ Columna risk_level ya existe');
    }

    // Agregar otras columnas de riesgo si no existen
    const [volatilityCol] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'investments' AND COLUMN_NAME = 'volatility_percentage'"
    );
    
    if (volatilityCol.length === 0) {
      console.log('📝 Agregando columna volatility_percentage...');
      await connection.execute(`
        ALTER TABLE investments 
        ADD COLUMN volatility_percentage DECIMAL(5,2) DEFAULT NULL
      `);
      console.log('✅ Columna volatility_percentage agregada');
    }

    const [drawdownCol] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'investments' AND COLUMN_NAME = 'max_drawdown_percentage'"
    );
    
    if (drawdownCol.length === 0) {
      console.log('📝 Agregando columna max_drawdown_percentage...');
      await connection.execute(`
        ALTER TABLE investments 
        ADD COLUMN max_drawdown_percentage DECIMAL(5,2) DEFAULT NULL
      `);
      console.log('✅ Columna max_drawdown_percentage agregada');
    }

    const [riskNotesCol] = await connection.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'investments' AND COLUMN_NAME = 'risk_notes'"
    );
    
    if (riskNotesCol.length === 0) {
      console.log('📝 Agregando columna risk_notes...');
      await connection.execute(`
        ALTER TABLE investments 
        ADD COLUMN risk_notes TEXT DEFAULT NULL
      `);
      console.log('✅ Columna risk_notes agregada');
    }

    console.log('\n✅ Verificación de estructura completada');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Las columnas ya existen');
    } else {
      console.error('❌ Error en migración:', error.message);
      throw error;
    }
  } finally {
    connection.release();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  addRiskLevelField()
    .then(() => {
      console.log('\n🎉 Migración completada');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Migración fallida:', err);
      process.exit(1);
    });
}

module.exports = addRiskLevelField;
