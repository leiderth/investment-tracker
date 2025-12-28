const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/stats', dashboardController.getStats);
router.get('/evolution', dashboardController.getEvolution);
router.get('/risk-analysis', dashboardController.getRiskAnalysis);

module.exports = router;