/**
 * Currency Alerts Controller
 * Maneja alertas de cambio de tasas
 */

const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   POST /api/currency/alerts
 * @desc    Crear una nueva alerta de tasa de cambio
 * @access  Private
 * @body    { from_currency, to_currency, alert_type, target_value }
 */
exports.createAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from_currency, to_currency, alert_type, target_value } = req.body;

    if (!from_currency || !to_currency || !alert_type || target_value === undefined) {
      return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
    }

    const [result] = await pool.execute(
      `INSERT INTO currency_alerts (user_id, from_currency, to_currency, alert_type, target_value)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, from_currency.toUpperCase(), to_currency.toUpperCase(), alert_type, target_value]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        user_id: userId,
        from_currency: from_currency.toUpperCase(),
        to_currency: to_currency.toUpperCase(),
        alert_type,
        target_value,
        is_active: true,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error creando alerta:', error);
    res.status(500).json({ error: 'Error creando alerta' });
  }
};

/**
 * @route   GET /api/currency/alerts
 * @desc    Obtener alertas del usuario
 * @access  Private
 */
exports.getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const [alerts] = await pool.execute(
      `SELECT * FROM currency_alerts 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error obteniendo alertas:', error);
    res.status(500).json({ error: 'Error obteniendo alertas' });
  }
};

/**
 * @route   PUT /api/currency/alerts/:id
 * @desc    Actualizar una alerta
 * @access  Private
 */
exports.updateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { target_value, alert_type, is_active } = req.body;

    // Verificar que la alerta pertenece al usuario
    const [check] = await pool.execute(
      `SELECT id FROM currency_alerts WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    const updates = [];
    const values = [];

    if (target_value !== undefined) {
      updates.push('target_value = ?');
      values.push(target_value);
    }

    if (alert_type !== undefined) {
      updates.push('alert_type = ?');
      values.push(alert_type);
    }

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE currency_alerts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Alerta actualizada'
    });
  } catch (error) {
    logger.error('Error actualizando alerta:', error);
    res.status(500).json({ error: 'Error actualizando alerta' });
  }
};

/**
 * @route   DELETE /api/currency/alerts/:id
 * @desc    Eliminar una alerta
 * @access  Private
 */
exports.deleteAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que la alerta pertenece al usuario
    const [check] = await pool.execute(
      `SELECT id FROM currency_alerts WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    await pool.execute(
      `DELETE FROM currency_alerts WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Alerta eliminada'
    });
  } catch (error) {
    logger.error('Error eliminando alerta:', error);
    res.status(500).json({ error: 'Error eliminando alerta' });
  }
};

/**
 * @route   GET /api/currency/alerts/:id/logs
 * @desc    Obtener historial de disparos de una alerta
 * @access  Private
 */
exports.getAlertLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que la alerta pertenece al usuario
    const [check] = await pool.execute(
      `SELECT id FROM currency_alerts WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    const [logs] = await pool.execute(
      `SELECT * FROM currency_alert_logs 
       WHERE alert_id = ? 
       ORDER BY triggered_at DESC 
       LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Error obteniendo logs de alerta:', error);
    res.status(500).json({ error: 'Error obteniendo logs' });
  }
};

/**
 * SERVICIO INTERNO: Verificar alertas y dispararlas
 * Se ejecuta automáticamente cuando se actualizan tasas
 */
exports.checkAndTriggerAlerts = async (baseCurrency, rates) => {
  try {
    // Obtener todas las alertas activas para esta base
    const [alerts] = await pool.execute(
      `SELECT * FROM currency_alerts 
       WHERE from_currency = ? AND is_active = TRUE`,
      [baseCurrency]
    );

    for (const alert of alerts) {
      const currentRate = rates[alert.to_currency];
      
      if (!currentRate) continue;

      let shouldTrigger = false;
      let message = '';

      switch (alert.alert_type) {
        case 'above':
          if (currentRate >= alert.target_value) {
            shouldTrigger = true;
            message = `Tasa de ${alert.from_currency}/${alert.to_currency} alcanzó ${currentRate} (≥ ${alert.target_value})`;
          }
          break;

        case 'below':
          if (currentRate <= alert.target_value) {
            shouldTrigger = true;
            message = `Tasa de ${alert.from_currency}/${alert.to_currency} cayó a ${currentRate} (≤ ${alert.target_value})`;
          }
          break;

        case 'change_percent':
          // Obtener última tasa registrada
          const [lastRate] = await pool.execute(
            `SELECT rate FROM exchange_rates 
             WHERE from_currency = ? AND to_currency = ? 
             ORDER BY recorded_at DESC LIMIT 1`,
            [alert.from_currency, alert.to_currency]
          );

          if (lastRate.length > 0) {
            const previousRate = lastRate[0].rate;
            const percentChange = ((currentRate - previousRate) / previousRate) * 100;

            if (Math.abs(percentChange) >= Math.abs(alert.target_value)) {
              shouldTrigger = true;
              message = `Tasa de ${alert.from_currency}/${alert.to_currency} cambió ${percentChange.toFixed(2)}% (objetivo: ${alert.target_value}%)`;
            }
          }
          break;
      }

      if (shouldTrigger) {
        // Registrar disparo
        await pool.execute(
          `INSERT INTO currency_alert_logs (alert_id, rate_value, message)
           VALUES (?, ?, ?)`,
          [alert.id, currentRate, message]
        );

        // Actualizar última vez disparada
        await pool.execute(
          `UPDATE currency_alerts SET last_triggered_at = NOW() WHERE id = ?`,
          [alert.id]
        );

        console.log(`🔔 Alerta disparada #${alert.id}: ${message}`);
      }
    }
  } catch (error) {
    logger.error('Error verificando alertas:', error);
  }
};
