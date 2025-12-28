// backend/src/routes/risk.routes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Análisis de riesgo del portafolio
router.get('/portfolio-analysis', dashboardController.getRiskAnalysis);

module.exports = router;
