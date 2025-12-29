// backend/src/utils/patrimonialEvolutionManager.js

const pool = require('../config/database');
const { fromCents } = require('./currency');

/**
 * Gestor de evolución patrimonial
 * Maneja snapshots diarios, histórico y cálculos de evolución
 */

class PatrimonialEvolutionManager {
  /**
   * Crear snapshot diario de inversiones del usuario
   */
  static async createDailySnapshot(userId) {
    try {
      // 1. Obtener todas las inversiones activas
      const [investments] = await pool.execute(
        `SELECT id, current_amount_cents FROM investments
         WHERE user_id = ? AND status = 'active'`,
        [userId]
      );

      if (investments.length === 0) return { message: 'Sin inversiones activas' };

      // 2. Crear snapshot para cada inversión
      for (const inv of investments) {
        await pool.execute(
          `INSERT IGNORE INTO investment_snapshots 
           (investment_id, snapshot_date, value_cents)
           VALUES (?, CURDATE(), ?)`,
          [inv.id, inv.current_amount_cents]
        );
      }

      // 3. Crear métrica diaria
      await this.createDailyMetric(userId);

      return { success: true, investmentsSnapshotted: investments.length };
    } catch (error) {
      console.error('Error creando snapshot:', error);
      throw error;
    }
  }

  /**
   * Crear métrica diaria del portafolio
   */
  static async createDailyMetric(userId) {
    try {
      // Obtener datos actuales
      const [stats] = await pool.execute(
        `SELECT 
          COALESCE(SUM(current_amount_cents), 0) as total_value_cents,
          COALESCE(SUM(initial_amount_cents), 0) as total_invested_cents
         FROM investments
         WHERE user_id = ? AND status = 'active'`,
        [userId]
      );

      const totalValue = stats[0].total_value_cents;
      const totalInvested = stats[0].total_invested_cents;
      const totalProfit = totalValue - totalInvested;
      const returnPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

      // Obtener nivel de riesgo
      const [riskData] = await pool.execute(
        `SELECT 
          CASE 
            WHEN AVG(CASE WHEN risk_level = 'alto' THEN 3 
                          WHEN risk_level = 'medio' THEN 2 
                          ELSE 1 END) >= 2.5 THEN 'alto'
            WHEN AVG(CASE WHEN risk_level = 'alto' THEN 3 
                          WHEN risk_level = 'medio' THEN 2 
                          ELSE 1 END) >= 1.5 THEN 'medio'
            ELSE 'bajo'
          END as avg_risk
         FROM investments
         WHERE user_id = ? AND status = 'active'`,
        [userId]
      );

      const riskLevel = riskData[0]?.avg_risk || 'medio';

      // Insertar métrica
      await pool.execute(
        `INSERT INTO portfolio_daily_metrics 
         (user_id, metric_date, total_value_cents, total_invested_cents, total_profit_cents, return_percentage, risk_level)
         VALUES (?, CURDATE(), ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         total_value_cents = VALUES(total_value_cents),
         total_invested_cents = VALUES(total_invested_cents),
         total_profit_cents = VALUES(total_profit_cents),
         return_percentage = VALUES(return_percentage),
         risk_level = VALUES(risk_level)`,
        [userId, totalValue, totalInvested, totalProfit, returnPercent, riskLevel]
      );

      return { success: true };
    } catch (error) {
      console.error('Error creando métrica:', error);
      throw error;
    }
  }

  /**
   * Obtener evolución patrimonial (últimos N días)
   */
  static async getEvolution(userId, daysBack = 30) {
    try {
      const [snapshots] = await pool.execute(
        `SELECT 
          pdm.metric_date as date,
          pdm.total_value_cents as value_cents,
          pdm.total_invested_cents as invested_cents,
          pdm.total_profit_cents as profit_cents,
          pdm.return_percentage as return_pct
         FROM portfolio_daily_metrics pdm
         WHERE pdm.user_id = ?
         AND pdm.metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         ORDER BY pdm.metric_date ASC`,
        [userId, daysBack]
      );

      // Si no hay datos, obtener datos de inversiones actuales
      if (snapshots.length === 0) {
        const [current] = await pool.execute(
          `SELECT 
            COALESCE(SUM(current_amount_cents), 0) as total_value_cents,
            COALESCE(SUM(initial_amount_cents), 0) as total_invested_cents
           FROM investments
           WHERE user_id = ? AND status = 'active'`,
          [userId]
        );

        return [{
          date: new Date().toISOString().split('T')[0],
          value: fromCents(current[0].total_value_cents),
          invested: fromCents(current[0].total_invested_cents),
          profit: fromCents(current[0].total_value_cents - current[0].total_invested_cents),
          returnPercentage: current[0].total_invested_cents > 0 
            ? (((current[0].total_value_cents - current[0].total_invested_cents) / current[0].total_invested_cents) * 100)
            : 0
        }];
      }

      // Transformar datos
      return snapshots.map(snap => ({
        date: snap.date,
        value: fromCents(snap.value_cents),
        invested: fromCents(snap.invested_cents),
        profit: fromCents(snap.profit_cents),
        returnPercentage: parseFloat(snap.return_pct) || 0
      }));
    } catch (error) {
      console.error('Error obteniendo evolución:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de período
   */
  static async getPeriodStats(userId, startDate, endDate) {
    try {
      const [stats] = await pool.execute(
        `SELECT 
          MIN(total_value_cents) as min_value_cents,
          MAX(total_value_cents) as max_value_cents,
          AVG(total_value_cents) as avg_value_cents,
          SUM(total_profit_cents) as total_profit_cents,
          AVG(return_percentage) as avg_return_pct,
          MAX(return_percentage) as max_return_pct,
          MIN(return_percentage) as min_return_pct
         FROM portfolio_daily_metrics
         WHERE user_id = ?
         AND metric_date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
      );

      const data = stats[0];
      return {
        period: { start: startDate, end: endDate },
        minValue: fromCents(data.min_value_cents),
        maxValue: fromCents(data.max_value_cents),
        avgValue: fromCents(data.avg_value_cents),
        totalProfit: fromCents(data.total_profit_cents),
        averageReturn: parseFloat(data.avg_return_pct) || 0,
        maxReturn: parseFloat(data.max_return_pct) || 0,
        minReturn: parseFloat(data.min_return_pct) || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener comparativa mes a mes
   */
  static async getMonthlyComparison(userId, months = 12) {
    try {
      const [data] = await pool.execute(
        `SELECT 
          DATE_FORMAT(metric_date, '%Y-%m') as month,
          MAX(total_value_cents) as final_value_cents,
          MIN(total_value_cents) as initial_value_cents
         FROM portfolio_daily_metrics
         WHERE user_id = ?
         AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
         GROUP BY DATE_FORMAT(metric_date, '%Y-%m')
         ORDER BY month ASC`,
        [userId, months]
      );

      return data.map(row => ({
        month: row.month,
        endValue: fromCents(row.final_value_cents),
        startValue: fromCents(row.initial_value_cents),
        monthlyGain: fromCents(row.final_value_cents - row.initial_value_cents),
        monthlyReturn: row.initial_value_cents > 0
          ? (((row.final_value_cents - row.initial_value_cents) / row.initial_value_cents) * 100)
          : 0
      }));
    } catch (error) {
      console.error('Error obteniendo comparativa:', error);
      throw error;
    }
  }

  /**
   * Obtener volatilidad (desviación estándar)
   */
  static async getVolatility(userId, daysBack = 30) {
    try {
      const [data] = await pool.execute(
        `SELECT return_percentage as returns
         FROM portfolio_daily_metrics
         WHERE user_id = ?
         AND metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
         AND return_percentage IS NOT NULL`,
        [userId, daysBack]
      );

      if (data.length < 2) return 0;

      const returns = data.map(d => parseFloat(d.returns));
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);

      return parseFloat(stdDev.toFixed(4));
    } catch (error) {
      console.error('Error calculando volatilidad:', error);
      throw error;
    }
  }

  /**
   * Registrar transacción
   */
  static async recordTransaction(investmentId, type, amount, quantity, pricePerUnit, date, notes) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO transaction_history 
         (investment_id, transaction_type, amount_cents, quantity, price_per_unit, transaction_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [investmentId, type, amount, quantity, pricePerUnit, date, notes]
      );

      return { success: true, transactionId: result.insertId };
    } catch (error) {
      console.error('Error registrando transacción:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de transacciones
   */
  static async getTransactionHistory(investmentId, limit = 100) {
    try {
      const [transactions] = await pool.execute(
        `SELECT * FROM transaction_history
         WHERE investment_id = ?
         ORDER BY transaction_date DESC
         LIMIT ?`,
        [investmentId, limit]
      );

      return transactions;
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      throw error;
    }
  }
}

module.exports = PatrimonialEvolutionManager;
