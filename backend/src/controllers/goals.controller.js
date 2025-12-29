// backend/src/controllers/goals.controller.js

const pool = require('../config/database');
const { toCents, fromCents } = require('../utils/currency');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * @route   GET /api/goals
 * @desc    Obtener todas las metas del usuario
 * @access  Private
 */
exports.getGoals = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, priority } = req.query;

  let query = `
    SELECT 
      id,
      name,
      description,
      target_amount_cents,
      current_amount_cents,
      monthly_savings_cents,
      deadline,
      status,
      priority,
      category,
      notes,
      ROUND((current_amount_cents / target_amount_cents) * 100, 2) as progress_percentage,
      DATEDIFF(deadline, CURDATE()) as days_remaining,
      created_at,
      updated_at
    FROM financial_goals
    WHERE user_id = ?
  `;

  const params = [userId];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (priority) {
    query += ' AND priority = ?';
    params.push(priority);
  }

  query += ' ORDER BY deadline ASC';

  const [goals] = await pool.execute(query, params);

  const formattedGoals = goals.map(goal => ({
    id: goal.id,
    name: goal.name,
    description: goal.description,
    target_amount: fromCents(goal.target_amount_cents),
    current_amount: fromCents(goal.current_amount_cents),
    monthly_savings: fromCents(goal.monthly_savings_cents),
    deadline: goal.deadline,
    status: goal.status,
    priority: goal.priority,
    category: goal.category,
    notes: goal.notes,
    progress_percentage: goal.progress_percentage || 0,
    days_remaining: goal.days_remaining,
    created_at: goal.created_at,
    updated_at: goal.updated_at
  }));

  logger.info('Metas obtenidas', { user_id: userId, count: formattedGoals.length });

  res.json({
    success: true,
    data: formattedGoals,
    total: formattedGoals.length
  });
});

/**
 * @route   GET /api/goals/:id
 * @desc    Obtener meta específica
 * @access  Private
 */
exports.getGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const [goals] = await pool.execute(
    `SELECT * FROM financial_goals WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  if (goals.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Meta no encontrada'
    });
  }

  const goal = goals[0];

  res.json({
    success: true,
    data: {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      target_amount: fromCents(goal.target_amount_cents),
      current_amount: fromCents(goal.current_amount_cents),
      monthly_savings: fromCents(goal.monthly_savings_cents),
      deadline: goal.deadline,
      status: goal.status,
      priority: goal.priority,
      category: goal.category,
      notes: goal.notes,
      created_at: goal.created_at,
      updated_at: goal.updated_at
    }
  });
});

/**
 * @route   POST /api/goals
 * @desc    Crear nueva meta financiera
 * @access  Private
 */
exports.createGoal = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    name,
    description,
    target_amount,
    current_amount,
    monthly_savings,
    deadline,
    priority = 'media',
    category,
    notes
  } = req.body;

  // Normalizar valores: convertir strings vacíos a 0
  const normalizedCurrentAmount = (current_amount === '' || current_amount === null || current_amount === undefined) ? 0 : parseFloat(current_amount);
  const normalizedMonthlySavings = (monthly_savings === '' || monthly_savings === null || monthly_savings === undefined) ? 0 : parseFloat(monthly_savings);

  const targetCents = toCents(target_amount);
  const currentCents = toCents(normalizedCurrentAmount);
  const savingsCents = toCents(normalizedMonthlySavings);

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insertar meta
    const [result] = await connection.execute(
      `INSERT INTO financial_goals (
        user_id, name, description, target_amount_cents, 
        current_amount_cents, monthly_savings_cents, 
        deadline, priority, category, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, name, description, targetCents,
        currentCents, savingsCents,
        deadline, priority, category, notes
      ]
    );

    // Registrar progreso inicial
    await connection.execute(
      `INSERT INTO goal_progress (goal_id, current_amount_cents, progress_percentage)
       VALUES (?, ?, ?)`,
      [result.insertId, currentCents, (currentCents / targetCents) * 100]
    );

    await connection.commit();

    logger.info('Meta creada', { user_id: userId, goal_id: result.insertId, name });

    res.status(201).json({
      success: true,
      message: 'Meta creada exitosamente',
      data: {
        id: result.insertId,
        name,
        description,
        target_amount,
        current_amount,
        monthly_savings,
        deadline,
        priority,
        category,
        notes
      }
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Actualizar meta
 * @access  Private
 */
exports.updateGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    name,
    description,
    target_amount,
    current_amount,
    monthly_savings,
    deadline,
    status,
    priority,
    category,
    notes
  } = req.body;

  // Verificar que la meta pertenece al usuario
  const [existing] = await pool.execute(
    'SELECT id FROM financial_goals WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Meta no encontrada'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (target_amount !== undefined) {
      updates.push('target_amount_cents = ?');
      params.push(toCents(target_amount));
    }
    if (current_amount !== undefined) {
      updates.push('current_amount_cents = ?');
      params.push(toCents(current_amount));
    }
    if (monthly_savings !== undefined) {
      updates.push('monthly_savings_cents = ?');
      params.push(toCents(monthly_savings));
    }
    if (deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(deadline);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(category);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: 'No hay datos para actualizar'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, userId);

    await connection.execute(
      `UPDATE financial_goals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    // Registrar progreso si se actualizó current_amount
    if (current_amount !== undefined) {
      await connection.execute(
        `INSERT INTO goal_progress (goal_id, current_amount_cents, progress_percentage)
         VALUES (?, ?, (SELECT ROUND((? / target_amount_cents) * 100, 2) FROM financial_goals WHERE id = ?))`,
        [id, toCents(current_amount), toCents(current_amount), id]
      );
    }

    await connection.commit();

    logger.info('Meta actualizada', { user_id: userId, goal_id: id });

    res.json({
      success: true,
      message: 'Meta actualizada exitosamente'
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Eliminar meta
 * @access  Private
 */
exports.deleteGoal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const [result] = await pool.execute(
    'DELETE FROM financial_goals WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      error: 'Meta no encontrada'
    });
  }

  logger.info('Meta eliminada', { user_id: userId, goal_id: id });

  res.json({
    success: true,
    message: 'Meta eliminada exitosamente'
  });
});

/**
 * @route   GET /api/goals/:id/progress
 * @desc    Obtener histórico de progreso
 * @access  Private
 */
exports.getGoalProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Verificar que la meta pertenece al usuario
  const [existing] = await pool.execute(
    'SELECT id FROM financial_goals WHERE id = ? AND user_id = ?',
    [id, userId]
  );

  if (existing.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Meta no encontrada'
    });
  }

  const [progress] = await pool.execute(
    `SELECT 
      id,
      current_amount_cents,
      progress_percentage,
      recorded_at
    FROM goal_progress
    WHERE goal_id = ?
    ORDER BY recorded_at ASC`,
    [id]
  );

  const formattedProgress = progress.map(p => ({
    id: p.id,
    current_amount: fromCents(p.current_amount_cents),
    progress_percentage: p.progress_percentage,
    recorded_at: p.recorded_at
  }));

  res.json({
    success: true,
    data: formattedProgress
  });
});

/**
 * @route   POST /api/goals/:id/add-progress
 * @desc    Agregar progreso a una meta
 * @access  Private
 */
exports.addProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'El monto debe ser mayor a cero'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Obtener meta actual
    const [goals] = await connection.execute(
      'SELECT id, current_amount_cents, target_amount_cents FROM financial_goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (goals.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Meta no encontrada'
      });
    }

    const goal = goals[0];
    const amountCents = toCents(amount);
    const newCurrentAmount = goal.current_amount_cents + amountCents;

    // Actualizar meta
    await connection.execute(
      'UPDATE financial_goals SET current_amount_cents = ? WHERE id = ?',
      [newCurrentAmount, id]
    );

    // Registrar progreso
    const progressPercentage = (newCurrentAmount / goal.target_amount_cents) * 100;
    await connection.execute(
      'INSERT INTO goal_progress (goal_id, current_amount_cents, progress_percentage) VALUES (?, ?, ?)',
      [id, newCurrentAmount, progressPercentage]
    );

    await connection.commit();

    logger.info('Progreso agregado a meta', { user_id: userId, goal_id: id, amount });

    res.json({
      success: true,
      message: 'Progreso registrado',
      data: {
        new_current_amount: fromCents(newCurrentAmount),
        progress_percentage: progressPercentage.toFixed(2)
      }
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

/**
 * @route   POST /api/goals/:id/analyze-feasibility
 * @desc    Analizar viabilidad de una meta
 * @access  Private
 */
exports.analyzeGoalFeasibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { annual_return_percentage = 5 } = req.body;

  const [goals] = await pool.execute(
    `SELECT * FROM financial_goals WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  if (goals.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Meta no encontrada'
    });
  }

  const goal = goals[0];
  const targetAmount = goal.target_amount_cents;
  const currentAmount = goal.current_amount_cents;
  const monthlyContribution = goal.monthly_savings_cents;
  const deadline = new Date(goal.deadline);
  const today = new Date();
  
  // Calcular meses restantes
  const monthsRemaining = Math.floor(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  if (monthsRemaining <= 0) {
    return res.json({
      success: true,
      data: {
        goal_id: id,
        goal_name: goal.name,
        deadline_passed: true,
        message: 'La fecha límite de esta meta ya ha pasado'
      }
    });
  }

  // Fórmula: FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  const monthlyRate = (annual_return_percentage / 100) / 12;
  
  // Valor futuro del monto actual
  const futureValueCurrent = currentAmount * Math.pow(1 + monthlyRate, monthsRemaining);
  
  // Valor futuro de los aportes mensuales
  let futureValueContributions = 0;
  if (monthlyContribution > 0 && monthlyRate > 0) {
    futureValueContributions = monthlyContribution * 
      (Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate;
  } else if (monthlyContribution > 0) {
    futureValueContributions = monthlyContribution * monthsRemaining;
  }

  const projectedValue = futureValueCurrent + futureValueContributions;
  const difference = targetAmount - projectedValue;
  const isAchievable = difference <= 0;

  // Calcular aporte mensual requerido si no es alcanzable
  let requiredMonthly = monthlyContribution;
  if (!isAchievable && monthsRemaining > 0) {
    const needed = targetAmount - futureValueCurrent;
    
    if (monthlyRate === 0) {
      requiredMonthly = needed / monthsRemaining;
    } else {
      const annuityFactor = (Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate;
      requiredMonthly = needed / annuityFactor;
    }
  }

  // Calcular riesgo basado en progreso vs tiempo
  const timeProgress = ((goal.created_at ? 
    Math.floor((today.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 0) / monthsRemaining) * 100;
  const amountProgress = (currentAmount / targetAmount) * 100;
  
  let riskLevel = 'baja';
  if (amountProgress < 25 && timeProgress > 50) {
    riskLevel = 'alta';
  } else if (amountProgress < 50 && timeProgress > 75) {
    riskLevel = 'media';
  }

  logger.info('Análisis de viabilidad de meta', { 
    user_id: userId, 
    goal_id: id, 
    is_achievable: isAchievable,
    risk_level: riskLevel 
  });

  res.json({
    success: true,
    data: {
      goal_id: id,
      goal_name: goal.name,
      target_amount: fromCents(targetAmount),
      current_amount: fromCents(currentAmount),
      projected_value: fromCents(Math.round(projectedValue)),
      is_achievable: isAchievable,
      difference: fromCents(Math.round(difference)),
      months_remaining: monthsRemaining,
      current_monthly_contribution: fromCents(monthlyContribution),
      required_monthly_contribution: fromCents(Math.round(Math.max(0, requiredMonthly))),
      expected_annual_return: annual_return_percentage,
      risk_level: riskLevel,
      confidence: Math.max(0, Math.round((projectedValue / targetAmount) * 100)),
      recommendation: isAchievable 
        ? `¡Excelente! Alcanzarás tu meta de ${fromCents(targetAmount)} en ${monthsRemaining} meses`
        : `Necesitas ahorrar ${fromCents(Math.max(0, requiredMonthly))} mensualmente para alcanzar tu meta`,
      analysis: {
        time_progress_percentage: Math.round(timeProgress),
        amount_progress_percentage: Math.round(amountProgress),
        additional_monthly_needed: Math.max(0, fromCents(Math.round(requiredMonthly - monthlyContribution)))
      }
    }
  });
});
