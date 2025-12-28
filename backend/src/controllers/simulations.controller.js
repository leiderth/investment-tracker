// backend/src/controllers/simulations.controller.js

const pool = require('../config/database');
const { toCents, fromCents } = require('../utils/currency');
const {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  generateYearlyProjection,
  compareScenarios
} = require('../utils/simulations');

/**
 * Calcular simulación sin guardar
 * POST /api/simulations/calculate
 */
exports.calculateSimulation = async (req, res) => {
  try {
    const {
      initial_amount,
      monthly_contribution,
      annual_return_percentage,
      years,
      compound_frequency
    } = req.body;

    // Validaciones
    if (!initial_amount || !annual_return_percentage || !years) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: initial_amount, annual_return_percentage, years'
      });
    }

    if (initial_amount < 0 || years <= 0 || annual_return_percentage < 0) {
      return res.status(400).json({
        error: 'Los valores deben ser positivos'
      });
    }

    const principal = parseFloat(initial_amount);
    const monthlyContrib = parseFloat(monthly_contribution) || 0;
    const rate = parseFloat(annual_return_percentage) / 100;
    const yearsInt = parseInt(years);
    const frequency = compound_frequency || 'mensual';

    // Calcular resultado
    const result = calculateFutureValue(principal, monthlyContrib, rate, yearsInt, frequency);

    // Generar proyección año por año
    const projection = generateYearlyProjection(principal, monthlyContrib, rate, yearsInt);

    res.json({
      calculation: {
        initial_amount: principal,
        monthly_contribution: monthlyContrib,
        annual_return: annual_return_percentage,
        years: yearsInt,
        frequency,
        final_amount: result.finalAmount,
        total_contributions: result.totalContributions,
        total_earnings: result.totalEarnings,
        roi: result.roi.toFixed(2)
      },
      yearly_projection: projection
    });

  } catch (error) {
    console.error('Error al calcular simulación:', error);
    res.status(500).json({
      error: 'Error al calcular la simulación',
      details: error.message
    });
  }
};

/**
 * Comparar escenarios (conservador, moderado, agresivo)
 * POST /api/simulations/compare
 */
exports.compareScenarios = async (req, res) => {
  try {
    const { initial_amount, monthly_contribution, years } = req.body;

    if (!initial_amount || !years) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: initial_amount, years'
      });
    }

    const principal = parseFloat(initial_amount);
    const monthlyContrib = parseFloat(monthly_contribution) || 0;
    const yearsInt = parseInt(years);

    const comparison = compareScenarios(principal, monthlyContrib, yearsInt);

    res.json({
      comparison,
      input: {
        initial_amount: principal,
        monthly_contribution: monthlyContrib,
        years: yearsInt
      }
    });

  } catch (error) {
    console.error('Error al comparar escenarios:', error);
    res.status(500).json({
      error: 'Error al comparar escenarios',
      details: error.message
    });
  }
};

/**
 * Calcular aporte mensual necesario
 * POST /api/simulations/required-contribution
 */
exports.calculateRequiredContribution = async (req, res) => {
  try {
    const { target_amount, initial_amount, annual_return_percentage, years } = req.body;

    if (!target_amount || !annual_return_percentage || !years) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: target_amount, annual_return_percentage, years'
      });
    }

    const target = parseFloat(target_amount);
    const principal = parseFloat(initial_amount) || 0;
    const rate = parseFloat(annual_return_percentage) / 100;
    const yearsInt = parseInt(years);

    const requiredMonthly = calculateRequiredMonthlyContribution(target, principal, rate, yearsInt);

    // Calcular proyección con ese aporte
    const projection = generateYearlyProjection(principal, requiredMonthly, rate, yearsInt);

    res.json({
      target_amount: target,
      initial_amount: principal,
      annual_return: annual_return_percentage,
      years: yearsInt,
      required_monthly_contribution: requiredMonthly.toFixed(2),
      total_to_contribute: (requiredMonthly * 12 * yearsInt).toFixed(2),
      yearly_projection: projection
    });

  } catch (error) {
    console.error('Error al calcular aporte requerido:', error);
    res.status(500).json({
      error: 'Error al calcular el aporte requerido',
      details: error.message
    });
  }
};

/**
 * Guardar simulación
 * POST /api/simulations
 */
exports.saveSimulation = async (req, res) => {
  try {
    const {
      name,
      initial_amount,
      monthly_contribution,
      annual_return_percentage,
      years,
      compound_frequency,
      scenario_type
    } = req.body;

    const userId = req.user.id;

    // Validaciones
    if (!name || !initial_amount || !annual_return_percentage || !years) {
      return res.status(400).json({
        error: 'Faltan campos requeridos'
      });
    }

    const principal = parseFloat(initial_amount);
    const monthlyContrib = parseFloat(monthly_contribution) || 0;
    const rate = parseFloat(annual_return_percentage) / 100;
    const yearsInt = parseInt(years);

    // Calcular resultados
    const result = calculateFutureValue(principal, monthlyContrib, rate, yearsInt, compound_frequency || 'mensual');

    // Guardar en base de datos
    const [insertResult] = await pool.execute(
      `INSERT INTO simulations (
        user_id, name, initial_amount_cents, monthly_contribution_cents,
        annual_return_percentage, years, compound_frequency, scenario_type,
        final_amount_cents, total_contributions_cents, total_earnings_cents
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        toCents(principal),
        toCents(monthlyContrib),
        annual_return_percentage,
        yearsInt,
        compound_frequency || 'mensual',
        scenario_type || 'moderado',
        toCents(result.finalAmount),
        toCents(result.totalContributions),
        toCents(result.totalEarnings)
      ]
    );

    res.status(201).json({
      message: 'Simulación guardada exitosamente',
      simulation_id: insertResult.insertId,
      result: {
        final_amount: result.finalAmount,
        total_earnings: result.totalEarnings
      }
    });

  } catch (error) {
    console.error('Error al guardar simulación:', error);
    res.status(500).json({
      error: 'Error al guardar la simulación',
      details: error.message
    });
  }
};

/**
 * Obtener simulaciones guardadas
 * GET /api/simulations
 */
exports.getSimulations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [simulations] = await pool.query(
      `SELECT * FROM simulations WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const formatted = simulations.map(sim => ({
      id: sim.id,
      name: sim.name,
      initial_amount: fromCents(sim.initial_amount_cents),
      monthly_contribution: fromCents(sim.monthly_contribution_cents),
      annual_return_percentage: sim.annual_return_percentage,
      years: sim.years,
      compound_frequency: sim.compound_frequency,
      scenario_type: sim.scenario_type,
      final_amount: fromCents(sim.final_amount_cents),
      total_contributions: fromCents(sim.total_contributions_cents),
      total_earnings: fromCents(sim.total_earnings_cents),
      created_at: sim.created_at
    }));

    res.json({
      simulations: formatted,
      total: formatted.length
    });

  } catch (error) {
    console.error('Error al obtener simulaciones:', error);
    res.status(500).json({
      error: 'Error al obtener las simulaciones',
      details: error.message
    });
  }
};

/**
 * Eliminar simulación
 * DELETE /api/simulations/:id
 */
exports.deleteSimulation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM simulations WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Simulación no encontrada' });
    }

    res.json({ message: 'Simulación eliminada exitosamente' });

  } catch (error) {
    console.error('Error al eliminar simulación:', error);
    res.status(500).json({
      error: 'Error al eliminar la simulación',
      details: error.message
    });
  }
};