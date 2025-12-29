const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const dashboardCompleteController = require('../controllers/dashboard.complete.js');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Endpoint consolidado (NUEVO) - Retorna TODO
router.get('/complete', dashboardCompleteController.getCompleteDashboard);

// Endpoints individuales (compatibilidad)
router.get('/stats', dashboardController.getStats);
router.get('/evolution', dashboardController.getEvolution);
router.get('/risk', dashboardController.getRiskAnalysis);
router.get('/risk-analysis', dashboardController.getRiskAnalysis);
router.get('/advanced-metrics', dashboardController.getAdvancedMetrics);

// Crear snapshot manual
router.post('/snapshot', dashboardCompleteController.createSnapshot);

module.exports = router;