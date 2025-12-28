// backend/src/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Crear la aplicación Express PRIMERO
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas DESPUÉS de crear app
const authRoutes = require('./routes/auth.routes');
const investmentsRoutes = require('./routes/investments.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const transactionsRoutes = require('./routes/transactions.routes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', transactionsRoutes);

// Ruta de prueba (health check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'InvestTracker API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});