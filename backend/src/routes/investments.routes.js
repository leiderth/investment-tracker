const express = require('express');
const router = express.Router();
const investmentsController = require('../controllers/investments.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', investmentsController.createInvestment);
router.get('/', investmentsController.getInvestments);
router.get('/:id', investmentsController.getInvestmentById);
router.put('/:id', investmentsController.updateInvestment);
router.delete('/:id', investmentsController.deleteInvestment);

module.exports = router;