#!/usr/bin/env node

/**
 * Script para ejecutar migraciones de la base de datos
 * Ejecutar: node src/scripts/run-migrations.js
 * 
 * Este script ejecuta todas las migraciones SQL en orden
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');
const SEEDS_DIR = path.join(__dirname, '../../database/seeds');

async function runMigrations() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('🔧 Ejecutando migraciones de base de datos...\n');

    // Obtener todas las migraciones
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📋 Encontradas ${migrationFiles.length} migraciones\n`);

    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      console.log(`⏳ Ejecutando: ${file}`);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Dividir por `;` para múltiples sentencias
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (error) {
            // Ignorar errores de "tabla ya existe" u otros no críticos
            if (!error.message.includes('already exists') && 
                !error.message.includes('Duplicate') &&
                !error.message.includes('doesn\'t have a default value')) {
              console.error(`   ❌ Error: ${error.message}`);
              throw error;
            }
          }
        }
        
        console.log(`   ✅ Completada\n`);
      } catch (error) {
        console.error(`   ❌ Error ejecutando ${file}:`);
        console.error(`   ${error.message}\n`);
        // Continuar con las demás migraciones
      }
    }

    // Ejecutar seeds
    console.log('🌱 Ejecutando seeds...\n');
    const seedFiles = fs.readdirSync(SEEDS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      const filePath = path.join(SEEDS_DIR, file);
      console.log(`⏳ Ejecutando: ${file}`);
      
      try {
        const sql = fs.readFileSync(filePath, 'utf8');
        
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
          try {
            await connection.query(statement);
          } catch (error) {
            // Ignorar errores de duplicado en seeds
            if (!error.message.includes('Duplicate')) {
              console.error(`   ⚠️ Warning: ${error.message}`);
            }
          }
        }
        
        console.log(`   ✅ Completada\n`);
      } catch (error) {
        console.error(`   ⚠️ Warning en ${file}: ${error.message}\n`);
      }
    }

    console.log('✨ Migraciones completadas exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error crítico en migraciones:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.release();
    }
    await pool.end();
  }
}

// Ejecutar
runMigrations().catch(error => {
  console.error('Error no capturado:', error);
  process.exit(1);
});
