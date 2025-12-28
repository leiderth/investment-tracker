// backend/src/routes/simulations.routes.js

const express = require('express');
const router = express.Router();
const simulationsController = require('../controllers/simulations.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Calcular simulación (sin guardar)
router.post('/calculate', simulationsController.calculateSimulation);

// Comparar escenarios
router.post('/compare', simulationsController.compareScenarios);

// Calcular aporte mensual requerido
router.post('/required-contribution', simulationsController.calculateRequiredContribution);

// CRUD de simulaciones guardadas
router.post('/', simulationsController.saveSimulation);
router.get('/', simulationsController.getSimulations);
router.delete('/:id', simulationsController.deleteSimulation);

module.exports = router;