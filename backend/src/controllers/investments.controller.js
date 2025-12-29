// backend/src/controllers/investments.controller.js

const pool = require('../config/database');
const { toCents, fromCents } = require('../utils/currency');

/**
 * @route   GET /api/investments
 * @desc    Obtener todas las inversiones del usuario autenticado
 * @access  Private
 */
exports.getInvestments = async (req, res) => {
  try {
    console.log('\n🔍 [getInvestments] ========== INICIANDO GETINVESTMENTS ==========');
    console.log('🔍 [getInvestments] req.user completo:', JSON.stringify(req.user, null, 2));
    console.log('🔍 [getInvestments] req.user.id:', req.user?.id);
    console.log('🔍 [getInvestments] req.headers.authorization:', req.headers.authorization ? 'SÍ' : '❌ FALTA');
    
    const userId = req.user?.id ?? req.user?.userId ?? null;
    console.log('🔍 [getInvestments] userId resuelto:', userId, typeof userId);
    
    if (!userId) {
      console.log('❌ [getInvestments] ERROR: Sin userId');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const { status } = req.query;

    let query = `
      SELECT 
        i.*,
        ROUND(((i.current_amount_cents - i.initial_amount_cents) / i.initial_amount_cents) * 100, 2) as actual_return_percentage,
        (i.current_amount_cents - i.initial_amount_cents) as profit_loss_cents
      FROM investments i
      WHERE i.user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.created_at DESC';

    console.log('📊 [getInvestments] Ejecutando query con userId:', userId, '| params:', params);
    const [investments] = await pool.query(query, params);

    console.log('📊 [getInvestments] Resultado de BD:', investments.length, 'inversiones encontradas');

    // Formatear respuesta CON CAMPOS DE RIESGO
    const formattedInvestments = investments.map(inv => ({
      id: inv.id,
      user_id: inv.user_id,
      type: inv.type,
      platform: inv.platform,
      initial_amount: fromCents(inv.initial_amount_cents),
      current_amount: fromCents(inv.current_amount_cents),
      expected_return_percentage: inv.expected_return_percentage,
      actual_return_percentage: inv.actual_return_percentage,
      profit_loss: fromCents(inv.profit_loss_cents),
      start_date: inv.start_date,
      end_date: inv.end_date,
      status: inv.status,
      notes: inv.notes,
      // ← CAMPOS DE RIESGO
      risk_level: inv.risk_level || 'medio',
      volatility_percentage: inv.volatility_percentage,
      max_drawdown_percentage: inv.max_drawdown_percentage,
      risk_notes: inv.risk_notes,
      created_at: inv.created_at,
      updated_at: inv.updated_at
    }));

    console.log('✅ [getInvestments] Enviando respuesta con', formattedInvestments.length, 'inversiones');
    res.json({
      investments: formattedInvestments,
      total: formattedInvestments.length
    });

  } catch (error) {
    console.error('❌ [getInvestments] Error al obtener inversiones:', error);
    res.status(500).json({ 
      error: 'Error al obtener las inversiones',
      details: error.message 
    });
  }
};

/**
 * @route   POST /api/investments
 * @desc    Crear nueva inversión CON GESTIÓN DE RIESGO
 * @access  Private
 */
exports.createInvestment = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      type,
      platform,
      initial_amount,
      initialAmount, // Compatibilidad con ambos nombres
      current_amount,
      expected_return_percentage,
      expectedReturn, // Compatibilidad
      start_date,
      startDate, // Compatibilidad
      end_date,
      endDate, // Compatibilidad
      notes,
      // ← NUEVOS CAMPOS DE RIESGO
      risk_level,
      riskLevel, // Compatibilidad
      volatility_percentage,
      max_drawdown_percentage,
      risk_notes
    } = req.body;

    const userId = req.user.id;

    // Compatibilidad con nombres en camelCase
    const finalInitialAmount = initial_amount || initialAmount;
    const finalStartDate = start_date || startDate;
    const finalEndDate = end_date || endDate;
    const finalExpectedReturn = expected_return_percentage || expectedReturn;
    const finalRiskLevel = risk_level || riskLevel;

    // Validaciones básicas
    if (!type || !platform || !finalInitialAmount || !finalStartDate) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: type, platform, initial_amount, start_date'
      });
    }

    if (finalInitialAmount <= 0) {
      return res.status(400).json({
        error: 'El monto inicial debe ser mayor a cero'
      });
    }

    // Asignar nivel de riesgo por defecto según tipo
    let assignedRiskLevel = 'medio';
    if (finalRiskLevel && ['bajo', 'medio', 'alto'].includes(finalRiskLevel)) {
      assignedRiskLevel = finalRiskLevel;
    } else {
      // Asignación automática según tipo de inversión
      const riskDefaults = {
        'CDT': 'bajo',
        'acciones': 'alto',
        'ETF': 'medio',
        'cripto': 'alto',
        'negocio': 'alto',
        'otro': 'medio'
      };
      assignedRiskLevel = riskDefaults[type] || 'medio';
    }

    await connection.beginTransaction();

    // Convertir montos a centavos
    const initialAmountCents = toCents(finalInitialAmount);
    const currentAmountCents = current_amount ? toCents(current_amount) : initialAmountCents;

    // Insertar inversión CON CAMPOS DE RIESGO
    const [result] = await connection.execute(
      `INSERT INTO investments (
        user_id, type, platform, 
        initial_amount_cents, current_amount_cents,
        expected_return_percentage, 
        start_date, end_date, 
        notes, status,
        risk_level, volatility_percentage, 
        max_drawdown_percentage, risk_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`,
      [
        userId,
        type,
        platform,
        initialAmountCents,
        currentAmountCents,
        finalExpectedReturn || null,
        finalStartDate,
        finalEndDate || null,
        notes || null,
        assignedRiskLevel,
        volatility_percentage || null,
        max_drawdown_percentage || null,
        risk_notes || null
      ]
    );

    const investmentId = result.insertId;

    // Crear snapshot inicial
    await connection.execute(
      `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date)
       VALUES (?, ?, ?)`,
      [investmentId, currentAmountCents, finalStartDate]
    );

    await connection.commit();

    console.log('✅ [createInvestment] Inversión creada con ID:', investmentId, '| Risk Level:', assignedRiskLevel);

    res.status(201).json({
      message: 'Inversión creada exitosamente',
      investment: {
        id: investmentId,
        type,
        platform,
        initial_amount: finalInitialAmount,
        current_amount: current_amount || finalInitialAmount,
        risk_level: assignedRiskLevel
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ [createInvestment] Error al crear inversión:', error);
    res.status(500).json({ 
      error: 'Error al crear la inversión',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

/**
 * @route   GET /api/investments/:id
 * @desc    Obtener una inversión específica CON DATOS DE RIESGO
 * @access  Private
 */
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [investments] = await pool.query(
      `SELECT 
        i.*,
        ROUND(((i.current_amount_cents - i.initial_amount_cents) / i.initial_amount_cents) * 100, 2) as actual_return_percentage,
        (i.current_amount_cents - i.initial_amount_cents) as profit_loss_cents
       FROM investments i 
       WHERE i.id = ? AND i.user_id = ?`,
      [id, userId]
    );

    if (investments.length === 0) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    const investment = investments[0];

    // Obtener transacciones asociadas
    const [transactions] = await pool.query(
      `SELECT * FROM transactions WHERE investment_id = ? ORDER BY date DESC`,
      [id]
    );

    res.json({
      ...investment,
      initial_amount: fromCents(investment.initial_amount_cents),
      current_amount: fromCents(investment.current_amount_cents),
      profit_loss: fromCents(investment.profit_loss_cents),
      transactions: transactions.map(t => ({
        ...t,
        amount: fromCents(t.amount_cents),
        balance_after: fromCents(t.balance_after_cents)
      }))
    });

  } catch (error) {
    console.error('❌ [getInvestmentById] Error obteniendo inversión:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
};

/**
 * @route   PUT /api/investments/:id
 * @desc    Actualizar inversión (valor actual Y/O datos de riesgo)
 * @access  Private
 */
exports.updateInvestment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { 
      current_amount,
      currentAmount, // Compatibilidad
      risk_level,
      riskLevel, // Compatibilidad
      volatility_percentage,
      max_drawdown_percentage,
      risk_notes,
      notes, 
      status 
    } = req.body;
    const userId = req.user.id;

    // Compatibilidad
    const finalCurrentAmount = current_amount !== undefined ? current_amount : currentAmount;
    const finalRiskLevel = risk_level || riskLevel;

    await connection.beginTransaction();

    // Verificar que existe y pertenece al usuario
    const [investments] = await connection.execute(
      'SELECT id, status FROM investments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (investments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    if (investments[0].status === 'closed' && status !== 'closed') {
      await connection.rollback();
      return res.status(400).json({
        error: 'No se puede actualizar una inversión cerrada'
      });
    }

    // Construir query dinámica
    const updates = [];
    const values = [];

    // Actualizar valor actual
    if (finalCurrentAmount !== undefined) {
      if (finalCurrentAmount < 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'El valor actual no puede ser negativo'
        });
      }

      const currentAmountCents = toCents(finalCurrentAmount);
      updates.push('current_amount_cents = ?');
      values.push(currentAmountCents);

      // Crear snapshot
      await connection.execute(
        `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date)
         VALUES (?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE value_cents = VALUES(value_cents)`,
        [id, currentAmountCents]
      );
    }

    // Actualizar risk_level
    if (finalRiskLevel !== undefined) {
      const validRiskLevels = ['bajo', 'medio', 'alto'];
      if (!validRiskLevels.includes(finalRiskLevel)) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Nivel de riesgo inválido. Usa: bajo, medio, alto'
        });
      }
      updates.push('risk_level = ?');
      values.push(finalRiskLevel);
    }

    // Actualizar volatility_percentage
    if (volatility_percentage !== undefined) {
      updates.push('volatility_percentage = ?');
      values.push(volatility_percentage);
    }

    // Actualizar max_drawdown_percentage
    if (max_drawdown_percentage !== undefined) {
      updates.push('max_drawdown_percentage = ?');
      values.push(max_drawdown_percentage);
    }

    // Actualizar risk_notes
    if (risk_notes !== undefined) {
      updates.push('risk_notes = ?');
      values.push(risk_notes);
    }

    // Actualizar notas generales
    if (notes !== undefined) {
      updates.push('notes = ?');
      values.push(notes);
    }

    // Actualizar status
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    // Agregar updated_at
    updates.push('updated_at = NOW()');
    values.push(id, userId);

    // Ejecutar actualización
    await connection.execute(
      `UPDATE investments SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    await connection.commit();

    console.log('✅ [updateInvestment] Inversión actualizada:', id);

    res.json({ message: 'Inversión actualizada exitosamente' });

  } catch (error) {
    await connection.rollback();
    console.error('❌ [updateInvestment] Error al actualizar inversión:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la inversión',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

/**
 * @route   DELETE /api/investments/:id
 * @desc    Cerrar inversión (soft delete)
 * @access  Private
 */
exports.deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que existe y pertenece al usuario
    const [investments] = await pool.query(
      'SELECT id, status FROM investments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (investments.length === 0) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    if (investments[0].status === 'closed') {
      return res.status(400).json({ error: 'La inversión ya está cerrada' });
    }

    // Soft delete: cambiar status a 'closed'
    await pool.query(
      `UPDATE investments 
       SET status = 'closed', updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    console.log('✅ [deleteInvestment] Inversión cerrada:', id);

    res.json({ message: 'Inversión cerrada exitosamente' });

  } catch (error) {
    console.error('❌ [deleteInvestment] Error al cerrar inversión:', error);
    res.status(500).json({ 
      error: 'Error al cerrar la inversión',
      details: error.message 
    });
  }
};

/**
 * @route   GET /api/investments/portfolio-analysis
 * @desc    Obtener análisis completo del portafolio con gráficos
 * @access  Private
 */
exports.getPortfolioAnalysis = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    // Obtener todas las inversiones del usuario
    const [investments] = await pool.query(
      `SELECT id, name, type, status, risk_level,
              initial_amount_cents, current_amount_cents, created_at 
       FROM investments 
       WHERE user_id = ? AND status != 'closed'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    // Calcular resumen
    const summary = {
      totalValue: 0,
      totalInvested: 0,
      investmentCount: investments.length,
    };

    // Agrupar por tipo
    const byType = {};
    const byStatus = {};
    const byRisk = {};
    const investmentDetails = [];

    investments.forEach(inv => {
      const currentValue = inv.current_amount_cents / 100;
      const investedAmount = inv.initial_amount_cents / 100;

      summary.totalValue += currentValue;
      summary.totalInvested += investedAmount;

      // Por tipo
      if (!byType[inv.type]) {
        byType[inv.type] = 0;
      }
      byType[inv.type] += currentValue;

      // Por estado
      if (!byStatus[inv.status]) {
        byStatus[inv.status] = 0;
      }
      byStatus[inv.status] += currentValue;

      // Por riesgo
      if (!byRisk[inv.risk_level]) {
        byRisk[inv.risk_level] = 0;
      }
      byRisk[inv.risk_level] += currentValue;

      // Detalle de inversión
      investmentDetails.push({
        id: inv.id,
        name: inv.name,
        type: inv.type,
        status: inv.status,
        riskLevel: inv.risk_level,
        amountInvested: investedAmount,
        currentValue: currentValue,
        annualReturn: 0, // Campo no disponible en tabla actual
        createdAt: inv.created_at,
      });
    });

    // Convertir objetos a arrays para gráficos
    const byTypeArray = Object.entries(byType).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    const byStatusArray = Object.entries(byStatus).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    const byRiskArray = Object.entries(byRisk).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Calcular métricas
    const profitLoss = summary.totalValue - summary.totalInvested;
    const returnPercentage = summary.totalInvested > 0 ? ((profitLoss / summary.totalInvested) * 100) : 0;
    
    // Diversificación (0-10): Más tipos = más diversificado
    const diversificationScore = Math.min((byTypeArray.length * 1.5) + (investments.length * 0.1), 10);

    // Necesidad de rebalanceo
    const maxAllocation = Math.max(...byTypeArray.map(x => x.value)) / summary.totalValue;
    const needsRebalancing = maxAllocation > 0.6; // Si un tipo es >60% del portafolio

    const metrics = {
      diversificationScore: parseFloat(diversificationScore.toFixed(1)),
      needsRebalancing,
      rebalanceRecommendations: [],
      riskDistribution: byRiskArray,
    };

    if (needsRebalancing) {
      const overweighted = byTypeArray.filter(x => (x.value / summary.totalValue) > 0.5);
      overweighted.forEach(item => {
        metrics.rebalanceRecommendations.push(
          `Reduce ${item.name} (${((item.value / summary.totalValue) * 100).toFixed(1)}% del portafolio)`
        );
      });
    }

    res.json({
      summary,
      byType: byTypeArray,
      byStatus: byStatusArray,
      byRisk: byRiskArray,
      investments: investmentDetails,
      metrics,
      performance: [], // Se puede agregar histórico si es necesario
    });

  } catch (error) {
    console.error('❌ [getPortfolioAnalysis] Error:', error);
    res.status(500).json({ error: 'Error al obtener análisis del portafolio', details: error.message });
  }
};

/**
 * @route   GET /api/investments/ai-recommendations
 * @desc    Obtener recomendaciones IA para el portafolio
 * @access  Private
 */
exports.getAIRecommendations = async (req, res) => {
  try {
    const FinancialAIService = require('../services/financialAIService');
    const AIRecommendationsService = require('../services/aiRecommendationsService');
    
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'No autenticado' });

    // Obtener datos del portafolio
    const [investments] = await pool.query(
      `SELECT id, name, type, status, risk_level,
              initial_amount_cents, current_amount_cents, created_at 
       FROM investments 
       WHERE user_id = ? AND status != 'closed'`,
      [userId]
    );

    // Preparar datos
    const summary = {
      totalValue: 0,
      totalInvested: 0,
      investmentCount: investments.length,
    };

    const investmentDetails = [];
    investments.forEach(inv => {
      const currentValue = inv.current_amount_cents / 100;
      const investedAmount = inv.initial_amount_cents / 100;
      summary.totalValue += currentValue;
      summary.totalInvested += investedAmount;

      investmentDetails.push({
        id: inv.id,
        name: inv.name,
        type: inv.type,
        status: inv.status,
        riskLevel: inv.risk_level,
        amountInvested: investedAmount,
        currentValue: currentValue,
      });
    });

    // Calcular métricas
    const diversificationScore = Math.min((Object.keys(
      investmentDetails.reduce((acc, inv) => ({ ...acc, [inv.type]: true }), {})
    ).length * 1.5) + (investments.length * 0.1), 10);

    const metrics = {
      diversificationScore: parseFloat(diversificationScore.toFixed(1)),
    };

    // Usar el nuevo servicio profesional de IA Financiera
    const technicalAnalysis = FinancialAIService.analyzeTextIndicators(investmentDetails);
    const fundamentalMetrics = FinancialAIService.analyzeFundamentalMetrics(investmentDetails, summary);
    const riskAssessment = FinancialAIService.assessRisks(investmentDetails, summary);
    const educationalRecommendations = FinancialAIService.generateEducationalRecommendations(
      investmentDetails, 
      summary, 
      { ...metrics, ...fundamentalMetrics }
    );
    const executiveSummary = FinancialAIService.generateExecutiveSummary(
      investmentDetails, 
      summary, 
      { ...metrics, ...fundamentalMetrics, ...riskAssessment }
    );

    // Mantener compatibilidad con antiguo servicio para datos adicionales
    const recommendations = AIRecommendationsService.analyzePortfolio(investmentDetails, metrics);
    const insights = AIRecommendationsService.generateInsights(investmentDetails, summary, metrics);
    const healthScore = AIRecommendationsService.calculateHealthScore(investmentDetails, metrics, summary);
    const actionItems = AIRecommendationsService.generateActionItems(investmentDetails, metrics, summary);

    res.json({
      // Nuevo análisis profesional
      disclaimer: FinancialAIService.LEGAL_DISCLAIMER,
      executiveSummary,
      technicalAnalysis,
      fundamentalMetrics,
      riskAssessment,
      educationalRecommendations,
      
      // Datos legacy por compatibilidad
      recommendations,
      insights,
      healthScore,
      actionItems,
      summary: {
        portfolioValue: summary.totalValue,
        investmentCount: summary.investmentCount,
      },
    });

  } catch (error) {
    console.error('❌ [getAIRecommendations] Error:', error);
    res.status(500).json({ error: 'Error al obtener recomendaciones', details: error.message });
  }
};