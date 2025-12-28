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
const riskRoutes = require('./routes/risk.routes');
const simulationsRoutes = require('./routes/simulations.routes');
const goalsRoutes = require('./routes/goals.routes');

// Importar middleware mejorado
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api', transactionsRoutes);
app.use('/api/simulations', simulationsRoutes); 

// Ruta de prueba (health check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'InvestTracker API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas (debe ser antes del error handler)
app.use(notFoundHandler);

// Manejo de errores global MEJORADO
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`, {
    database: process.env.DB_NAME,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('='.repeat(50));
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('❌ Error no manejado:', err);
  console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Excepción no capturada:', err);
  process.exit(1);
});