// backend/src/routes/transactions.routes.js

const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de transacciones por inversión
router.post('/investments/:investmentId/transactions', transactionsController.createTransaction);
router.get('/investments/:investmentId/transactions', transactionsController.getTransactions);

// Ruta para eliminar transacción individual
router.delete('/transactions/:transactionId', transactionsController.deleteTransaction);

module.exports = router;