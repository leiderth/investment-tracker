/**
 * Currency Routes
 * Rutas para manejo de monedas y tasas de cambio
 */

const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currency.controller');
const currencyAlertsController = require('../controllers/currency-alerts.controller');
const { authenticateToken } = require('../middleware/auth');

// ==========================================
// RUTAS PÚBLICAS (sin autenticación)
// ==========================================

// Obtener todas las tasas de cambio
router.get('/rates', currencyController.getAllRates);

// Obtener tasa específica
router.get('/rate/:from/:to', currencyController.getRate);

// Convertir cantidad
router.post('/convert', currencyController.convert);

// Obtener historial de tasas
router.get('/history/:from/:to', currencyController.getHistory);

// Obtener monedas soportadas
router.get('/supported', currencyController.getSupportedCurrencies);

// Forzar actualización de tasas en tiempo real
router.post('/refresh-rates', currencyController.refreshRates);

// Obtener histórico de tasas para gráficos
router.get('/rate-history', currencyController.getRateHistory);

// Obtener histórico de tasas populares
router.get('/popular-history', currencyController.getPopularHistory);

// ==========================================
// RUTAS PRIVADAS (requieren autenticación)
// ==========================================

// Obtener preferencias de moneda del usuario
router.get('/user-preferences', authenticateToken, currencyController.getUserPreferences);

// Actualizar preferencias de moneda
router.put('/user-preferences', authenticateToken, currencyController.updateUserPreferences);

// Obtener portafolio en múltiples monedas
router.get('/portfolio', authenticateToken, currencyController.getPortfolioInCurrencies);

// Convertir portafolio a moneda diferente
router.post('/portfolio/convert', authenticateToken, currencyController.convertPortfolioTo);

// Actualizar tasa de cambio (Admin)
router.put('/rate/:from/:to', authenticateToken, currencyController.updateRate);

// ==========================================
// RUTAS DE HISTORIAL DE CONVERSIONES (privadas)
// ==========================================

// Registrar conversión
router.post('/record-conversion', authenticateToken, currencyController.recordConversion);

// Obtener historial de conversiones
router.get('/conversions', authenticateToken, currencyController.getConversionHistory);

// Obtener estadísticas de conversiones
router.get('/conversions/stats', authenticateToken, currencyController.getConversionStats);

// ==========================================
// RUTAS DE ALERTAS (privadas)
// ==========================================

// Crear alerta
router.post('/alerts', authenticateToken, currencyAlertsController.createAlert);

// Obtener alertas del usuario
router.get('/alerts', authenticateToken, currencyAlertsController.getUserAlerts);

// Actualizar alerta
router.put('/alerts/:id', authenticateToken, currencyAlertsController.updateAlert);

// Eliminar alerta
router.delete('/alerts/:id', authenticateToken, currencyAlertsController.deleteAlert);

// Obtener historial de disparos de alerta
router.get('/alerts/:id/logs', authenticateToken, currencyAlertsController.getAlertLogs);

module.exports = router;
