// backend/src/controllers/simulations.controller.js

const pool = require('../config/database');
const { toCents, fromCents } = require('../utils/currency');
const {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  generateYearlyProjection,
  generateMonthlyProjection,
  compareScenarios,
  performSensitivityAnalysis
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
    if (initial_amount === undefined || annual_return_percentage === undefined || years === undefined) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: initial_amount, annual_return_percentage, years',
        code: 'MISSING_FIELDS'
      });
    }

    const principal = parseFloat(initial_amount);
    const monthlyContrib = parseFloat(monthly_contribution) || 0;
    const rate = parseFloat(annual_return_percentage);
    const yearsInt = parseInt(years);

    if (principal < 0 || yearsInt <= 0 || yearsInt > 50 || rate < 0 || rate > 100) {
      return res.status(400).json({
        error: 'Valores inválidos: initial_amount >= 0, annual_return_percentage 0-100, years 1-50',
        code: 'INVALID_VALUES'
      });
    }

    if (monthlyContrib < 0) {
      return res.status(400).json({
        error: 'El aporte mensual debe ser no negativo',
        code: 'INVALID_CONTRIBUTION'
      });
    }

    // Calcular resultado
    const result = calculateFutureValue(principal, monthlyContrib, rate, yearsInt);

    // Generar proyecciones
    const yearlyProjection = generateYearlyProjection(principal, monthlyContrib, rate, yearsInt);
    
    // Análisis de sensibilidad
    const sensitivity = performSensitivityAnalysis(principal, monthlyContrib, rate, yearsInt, 2);

    res.json({
      calculation: {
        initial_amount: principal,
        monthly_contribution: monthlyContrib,
        annual_return_percentage: rate,
        years: yearsInt,
        final_amount: result.finalAmount,
        total_contributions: result.totalContributions,
        total_earnings: result.totalEarnings,
        roi: parseFloat(result.roi),
        monthly_average_growth: (result.totalEarnings / (yearsInt * 12)).toFixed(2)
      },
      yearly_projection: yearlyProjection,
      sensitivity_analysis: sensitivity
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

    if (initial_amount === undefined || years === undefined) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: initial_amount, years',
        code: 'MISSING_FIELDS'
      });
    }

    const principal = parseFloat(initial_amount);
    const monthlyContrib = parseFloat(monthly_contribution) || 0;
    const yearsInt = parseInt(years);

    if (principal < 0 || yearsInt <= 0 || yearsInt > 50) {
      return res.status(400).json({
        error: 'Valores inválidos: initial_amount >= 0, years 1-50',
        code: 'INVALID_VALUES'
      });
    }

    if (monthlyContrib < 0) {
      return res.status(400).json({
        error: 'El aporte mensual debe ser no negativo',
        code: 'INVALID_CONTRIBUTION'
      });
    }

    // Generar escenarios
    const scenarios = compareScenarios(principal, monthlyContrib, yearsInt);

    // Transformar escenarios a objeto con claves de escenario
    const comparison = {
      conservador: {
        finalAmount: scenarios[0].finalValue,
        totalInvested: scenarios[0].totalInvested,
        totalEarnings: scenarios[0].earnings,
        roi: scenarios[0].roi,
        annualRate: scenarios[0].annualRate,
        projection: scenarios[0].projection
      },
      moderado: {
        finalAmount: scenarios[1].finalValue,
        totalInvested: scenarios[1].totalInvested,
        totalEarnings: scenarios[1].earnings,
        roi: scenarios[1].roi,
        annualRate: scenarios[1].annualRate,
        projection: scenarios[1].projection
      },
      agresivo: {
        finalAmount: scenarios[2].finalValue,
        totalInvested: scenarios[2].totalInvested,
        totalEarnings: scenarios[2].earnings,
        roi: scenarios[2].roi,
        annualRate: scenarios[2].annualRate,
        projection: scenarios[2].projection
      }
    };

    res.json({
      scenarios,
      comparison,
      input: {
        initial_amount: principal,
        monthly_contribution: monthlyContrib,
        years: yearsInt
      },
      bestScenario: scenarios[scenarios.length - 1].name,
      difference: scenarios[scenarios.length - 1].finalValue - scenarios[0].finalValue,
      recommendation: 'Elige el escenario que se adapte a tu perfil de riesgo'
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
 * Calcular aporte mensual necesario para alcanzar una meta
 * POST /api/simulations/required-contribution
 */
exports.calculateRequiredContribution = async (req, res) => {
  try {
    const { target_amount, initial_amount, annual_return_percentage, years } = req.body;

    if (target_amount === undefined || annual_return_percentage === undefined || years === undefined) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: target_amount, annual_return_percentage, years',
        code: 'MISSING_FIELDS'
      });
    }

    const target = parseFloat(target_amount);
    const principal = parseFloat(initial_amount) || 0;
    const rate = parseFloat(annual_return_percentage);
    const yearsInt = parseInt(years);

    if (target <= 0 || yearsInt <= 0 || yearsInt > 50 || rate < 0 || rate > 100 || principal < 0) {
      return res.status(400).json({
        error: 'Valores inválidos: target_amount > 0, initial_amount >= 0, annual_return_percentage 0-100, years 1-50',
        code: 'INVALID_VALUES'
      });
    }

    const requiredMonthly = calculateRequiredMonthlyContribution(target, principal, rate, yearsInt);

    // Calcular proyección con ese aporte
    const projection = generateYearlyProjection(principal, requiredMonthly, rate, yearsInt);
    
    // Verificar si es alcanzable
    const finalValue = projection[projection.length - 1]?.balance || 0;
    const isAchievable = Math.abs(finalValue - target) < 1; // Con margen de 1 unidad

    res.json({
      target_amount: target,
      initial_amount: principal,
      annual_return_percentage: rate,
      years: yearsInt,
      required_monthly_contribution: Math.max(0, requiredMonthly),
      total_to_contribute: Math.max(0, requiredMonthly * 12 * yearsInt),
      is_achievable: isAchievable,
      final_projected_value: finalValue,
      yearly_projection: projection,
      analysis: {
        months: yearsInt * 12,
        total_contributed: principal + Math.max(0, requiredMonthly * 12 * yearsInt),
        total_earnings: Math.max(0, finalValue - (principal + Math.max(0, requiredMonthly * 12 * yearsInt))),
        roi: finalValue > 0 ? (((finalValue - principal) / principal) * 100).toFixed(2) : 0
      }
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