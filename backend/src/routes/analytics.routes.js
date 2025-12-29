// backend/src/routes/analytics.routes.js

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener métricas avanzadas
router.get('/metrics', analyticsController.getAdvancedMetrics);

module.exports = router;
