// backend/src/routes/goals.routes.js

const express = require('express');
const router = express.Router();
const goalsController = require('../controllers/goals.controller');
const { authenticateToken } = require('../middleware/auth');
const { validateGoalData } = require('../middleware/validation');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// CRUD básico
router.get('/', goalsController.getGoals);
router.get('/:id', goalsController.getGoal);
router.post('/', validateGoalData, goalsController.createGoal);
router.put('/:id', goalsController.updateGoal);
router.delete('/:id', goalsController.deleteGoal);

// Progreso
router.get('/:id/progress', goalsController.getGoalProgress);
router.post('/:id/add-progress', goalsController.addProgress);

// Análisis avanzado
router.post('/:id/analyze-feasibility', goalsController.analyzeGoalFeasibility);

module.exports = router;
