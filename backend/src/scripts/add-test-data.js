// Script para agregar datos de prueba
const pool = require('../config/database');

async function addTestData() {
  try {
    console.log('🔄 Agregando datos de prueba...');

    // Primero, eliminar inversiones anteriores del usuario 2
    await pool.execute('DELETE FROM investments WHERE user_id = 2');
    console.log('✅ Inversiones anteriores eliminadas');

    // Insertar 4 nuevas inversiones con diferentes retornos
    const investments = [
      {
        user_id: 2,
        type: 'CDT',
        platform: 'Bancolombia',
        initial_amount_cents: 100000000, // $1,000,000
        current_amount_cents: 103000000, // $1,030,000 (+3%)
        risk_level: 'LOW',
        status: 'active',
        currency: 'COP'
      },
      {
        user_id: 2,
        type: 'Fondo Mutualista',
        platform: 'Fiduciaria ABC',
        initial_amount_cents: 150000000, // $1,500,000
        current_amount_cents: 151500000, // $1,515,000 (+1%)
        risk_level: 'LOW',
        status: 'active',
        currency: 'COP'
      },
      {
        user_id: 2,
        type: 'Acciones',
        platform: 'Bolsa Colombiana',
        initial_amount_cents: 120000000, // $1,200,000
        current_amount_cents: 138000000, // $1,380,000 (+15%)
        risk_level: 'HIGH',
        status: 'active',
        currency: 'COP'
      },
      {
        user_id: 2,
        type: 'ETF',
        platform: 'Bolsa USA',
        initial_amount_cents: 80000000, // $800,000
        current_amount_cents: 72000000, // $720,000 (-10%)
        risk_level: 'MEDIUM',
        status: 'active',
        currency: 'USD'
      }
    ];

    for (const inv of investments) {
      await pool.execute(
        `INSERT INTO investments 
         (user_id, type, platform, initial_amount_cents, current_amount_cents, risk_level, status, currency) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inv.user_id,
          inv.type,
          inv.platform,
          inv.initial_amount_cents,
          inv.current_amount_cents,
          inv.risk_level,
          inv.status,
          inv.currency
        ]
      );
      console.log(`✅ ${inv.type} agregado`);
    }

    console.log('\n✅ Datos de prueba agregados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestData();
                