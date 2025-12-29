// backend/src/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// Crear la aplicación Express PRIMERO
const app = express();

// Crear servidor HTTP para Socket.io
const server = http.createServer(app);

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
const analyticsRoutes = require('./routes/analytics.routes');
const currencyRoutes = require('./routes/currency.routes');
const marketRoutes = require('./routes/market.routes');
const chatRoutes = require('./routes/chat.routes');

// Importar servicios
const ExternalRatesService = require('./utils/externalRatesService');
const { initializeSocket } = require('./services/socketService');

// Importar middleware mejorado
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); // Chat primero - sin autenticación requerida
app.use('/api/investments', investmentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api', transactionsRoutes); // Esto aplica autenticación a las otras rutas
app.use('/api/simulations', simulationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/market', marketRoutes); 

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

server.listen(PORT, async () => {
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`, {
    database: process.env.DB_NAME,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log('='.repeat(50));
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('✅ WebSocket Server iniciado');
  console.log('='.repeat(50));

  // Inicializar Socket.io
  initializeSocket(server);

  // Activar actualización automática de tasas de cambio (cada 60 minutos)
  try {
    console.log('💱 Iniciando servicio de tasas de cambio en tiempo real...');
    ExternalRatesService.startAutoUpdate(60);
    console.log('✅ Servicio de tasas activado (actualización cada 60 minutos)');
  } catch (error) {
    console.error('⚠️ Error al iniciar servicio de tasas:', error.message);
  }
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