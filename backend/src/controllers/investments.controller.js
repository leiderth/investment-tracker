const pool = require('../config/database');
const { tocents, fromCents } = require('../utils/currency');

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

    // Formatear respuesta
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
      created_at: inv.created_at
    }));

    console.log('✅ [getInvestments] Enviando respuesta con', formattedInvestments.length, 'inversiones');
    res.json({
      investments: formattedInvestments,
      total: formattedInvestments.length
    });

  } catch (error) {
    console.error('Error al obtener inversiones:', error);
    res.status(500).json({ 
      error: 'Error al obtener las inversiones',
      details: error.message 
    });
  }
};

/**
 * @route   POST /api/investments
 * @desc    Crear nueva inversión
 * @access  Private
 */
exports.createInvestment = async (req, res) => {
  try {
    const {
      type,
      platform,
      initialAmount,
      expectedReturn,
      startDate,
      endDate,
      notes,
      riskLevel
    } = req.body;

    const userId = req.user.id;

    // Validaciones
    if (!type || !platform || !initialAmount || !startDate) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: type, platform, initialAmount, startDate'
      });
    }

    if (initialAmount <= 0) {
      return res.status(400).json({
        error: 'El monto inicial debe ser mayor a cero'
      });
    }

    // Validar risk_level
    const validRiskLevels = ['bajo', 'medio', 'alto'];
    const finalRiskLevel = riskLevel && validRiskLevels.includes(riskLevel) 
      ? riskLevel 
      : 'medio';

    const initialAmountCents = tocents(initialAmount);

    const [result] = await pool.execute(
      `INSERT INTO investments (
        user_id, type, platform, initial_amount_cents, current_amount_cents,
        expected_return_percentage, start_date, end_date, notes, risk_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        type,
        platform,
        initialAmountCents,
        initialAmountCents,
        expectedReturn || null,
        startDate,
        endDate || null,
        notes || null,
        finalRiskLevel
      ]
    );

    // Crear snapshot inicial
    await pool.execute(
      `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date)
       VALUES (?, ?, ?)`,
      [result.insertId, initialAmountCents, startDate]
    );

    res.status(201).json({
      message: 'Inversión creada exitosamente',
      investmentId: result.insertId
    });

  } catch (error) {
    console.error('Error al crear inversión:', error);
    res.status(500).json({ error: 'Error al crear la inversión' });
  }
};

/**
 * @route   GET /api/investments/:id
 * @desc    Obtener una inversión específica
 * @access  Private
 */
exports.getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [investments] = await pool.query(
      `SELECT * FROM investments WHERE id = ? AND user_id = ?`,
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
      transactions: transactions.map(t => ({
        ...t,
        amount: fromCents(t.amount_cents)
      }))
    });

  } catch (error) {
    console.error('Error obteniendo inversión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * @route   PUT /api/investments/:id
 * @desc    Actualizar inversión (valor actual o risk_level)
 * @access  Private
 */
exports.updateInvestment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;
    const { currentAmount, riskLevel, notes, status } = req.body;
    const userId = req.user.id;

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

    // Actualizar risk_level si se proporciona
    if (riskLevel) {
      const validRiskLevels = ['bajo', 'medio', 'alto'];
      if (!validRiskLevels.includes(riskLevel)) {
        await connection.rollback();
        return res.status(400).json({
          error: 'Nivel de riesgo inválido. Usa: bajo, medio, alto'
        });
      }

      await connection.execute(
        'UPDATE investments SET risk_level = ?, updated_at = NOW() WHERE id = ?',
        [riskLevel, id]
      );
    }

    // Actualizar valor actual si se proporciona
    if (currentAmount !== undefined) {
      if (currentAmount < 0) {
        await connection.rollback();
        return res.status(400).json({
          error: 'El valor actual no puede ser negativo'
        });
      }

      const currentAmountCents = tocents(currentAmount);

      await connection.execute(
        'UPDATE investments SET current_amount_cents = ?, updated_at = NOW() WHERE id = ?',
        [currentAmountCents, id]
      );

      // Crear snapshot
      await connection.execute(
        `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date)
         VALUES (?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE value_cents = VALUES(value_cents)`,
        [id, currentAmountCents]
      );
    }

    // Actualizar notas si se proporcionan
    if (notes !== undefined) {
      await connection.execute(
        'UPDATE investments SET notes = ?, updated_at = NOW() WHERE id = ?',
        [notes, id]
      );
    }

    // Actualizar status si se proporciona
    if (status !== undefined) {
      await connection.execute(
        'UPDATE investments SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
    }

    await connection.commit();

    res.json({ message: 'Inversión actualizada exitosamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al actualizar inversión:', error);
    res.status(500).json({ error: 'Error al actualizar la inversión' });
  } finally {
    connection.release();
  }
};

/**
 * @route   DELETE /api/investments/:id
 * @desc    Eliminar una inversión
 * @access  Private
 */
exports.deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar que existe y pertenece al usuario
    const [investments] = await pool.query(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (investments.length === 0) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    // Eliminar snapshots asociados
    await pool.query(
      'DELETE FROM investment_snapshots WHERE investment_id = ?',
      [id]
    );

    // Eliminar transacciones asociadas
    await pool.query(
      'DELETE FROM transactions WHERE investment_id = ?',
      [id]
    );

    // Eliminar inversión
    await pool.query(
      'DELETE FROM investments WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Inversión eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando inversión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
