// backend/src/controllers/transactions.controller.js

const pool = require('../config/database');
const { toCents, fromCents } = require('../utils/currency');

/**
 * Crear una nueva transacción y actualizar el valor de la inversión
 * POST /api/investments/:investmentId/transactions
 */
exports.createTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { investmentId } = req.params;
    const { type, amount, date, description } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!type || !['deposit', 'withdrawal', 'dividend', 'fee'].includes(type)) {
      return res.status(400).json({ 
        error: 'Tipo de transacción inválido. Debe ser: deposit, withdrawal, dividend o fee' 
      });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser un número positivo' 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        error: 'La fecha es obligatoria' 
      });
    }

    // Convertir monto a centavos
    const amountCents = toCents(amount);

    await connection.beginTransaction();

    // Verificar que la inversión existe y pertenece al usuario
    const [investments] = await connection.query(
      'SELECT id, current_amount_cents, status FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, userId]
    );

    if (investments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    const investment = investments[0];

    if (investment.status === 'closed') {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'No se pueden agregar transacciones a una inversión cerrada' 
      });
    }

    // Calcular nuevo valor de la inversión según el tipo de transacción
    let newAmountCents = investment.current_amount_cents;

    switch (type) {
      case 'deposit':
        // Aporte adicional: suma al valor actual
        newAmountCents += amountCents;
        break;
      
      case 'withdrawal':
        // Retiro: resta del valor actual
        if (amountCents > investment.current_amount_cents) {
          await connection.rollback();
          return res.status(400).json({ 
            error: 'No puedes retirar más de lo que tienes invertido' 
          });
        }
        newAmountCents -= amountCents;
        break;
      
      case 'dividend':
        // Dividendo/Interés: suma al valor actual
        newAmountCents += amountCents;
        break;
      
      case 'fee':
        // Comisión/Fee: resta del valor actual
        if (amountCents > investment.current_amount_cents) {
          await connection.rollback();
          return res.status(400).json({ 
            error: 'La comisión no puede ser mayor al valor actual' 
          });
        }
        newAmountCents -= amountCents;
        break;
    }

    // Insertar la transacción
    const [result] = await connection.query(
      `INSERT INTO transactions 
       (investment_id, type, amount_cents, date, description, balance_after_cents) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [investmentId, type, amountCents, date, description || null, newAmountCents]
    );

    // Actualizar el valor actual de la inversión
    await connection.query(
      'UPDATE investments SET current_amount_cents = ?, updated_at = NOW() WHERE id = ?',
      [newAmountCents, investmentId]
    );

    // Crear snapshot automático
    await connection.query(
      `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value_cents = VALUES(value_cents)`,
      [investmentId, newAmountCents, date]
    );

    await connection.commit();

    // Obtener la transacción creada con formato
    const [transactions] = await connection.query(
      'SELECT * FROM transactions WHERE id = ?',
      [result.insertId]
    );

    const transaction = transactions[0];

    res.status(201).json({
      message: 'Transacción registrada exitosamente',
      transaction: {
        id: transaction.id,
        investment_id: transaction.investment_id,
        type: transaction.type,
        amount: fromCents(transaction.amount_cents),
        date: transaction.date,
        description: transaction.description,
        balance_after: fromCents(transaction.balance_after_cents),
        created_at: transaction.created_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear transacción:', error);
    res.status(500).json({ 
      error: 'Error al registrar la transacción',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtener todas las transacciones de una inversión
 * GET /api/investments/:investmentId/transactions
 */
exports.getTransactions = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.id;

    // Verificar que la inversión pertenece al usuario
    const [investments] = await pool.query(
      'SELECT id FROM investments WHERE id = ? AND user_id = ?',
      [investmentId, userId]
    );

    if (investments.length === 0) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    // Obtener transacciones ordenadas por fecha descendente
    const [transactions] = await pool.query(
      `SELECT 
        id,
        investment_id,
        type,
        amount_cents,
        date,
        description,
        balance_after_cents,
        created_at
       FROM transactions 
       WHERE investment_id = ? 
       ORDER BY date DESC, created_at DESC`,
      [investmentId]
    );

    // Formatear respuesta
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      investment_id: t.investment_id,
      type: t.type,
      amount: fromCents(t.amount_cents),
      date: t.date,
      description: t.description,
      balance_after: fromCents(t.balance_after_cents),
      created_at: t.created_at
    }));

    res.json({
      transactions: formattedTransactions,
      total: formattedTransactions.length
    });

  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener las transacciones',
      details: error.message 
    });
  }
};

/**
 * Eliminar una transacción
 * DELETE /api/transactions/:transactionId
 */
exports.deleteTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    await connection.beginTransaction();

    // Obtener la transacción y verificar permisos
    const [transactions] = await connection.query(
      `SELECT t.*, i.user_id, i.current_amount_cents, i.status
       FROM transactions t
       INNER JOIN investments i ON t.investment_id = i.id
       WHERE t.id = ?`,
      [transactionId]
    );

    if (transactions.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const transaction = transactions[0];

    if (transaction.user_id !== userId) {
      await connection.rollback();
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta transacción' });
    }

    if (transaction.status === 'closed') {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'No se pueden eliminar transacciones de inversiones cerradas' 
      });
    }

    // Revertir el efecto de la transacción en el valor actual
    let newAmountCents = transaction.current_amount_cents;

    switch (transaction.type) {
      case 'deposit':
      case 'dividend':
        // Si fue un ingreso, restamos
        newAmountCents -= transaction.amount_cents;
        break;
      
      case 'withdrawal':
      case 'fee':
        // Si fue un egreso, sumamos
        newAmountCents += transaction.amount_cents;
        break;
    }

    // Verificar que el nuevo valor no sea negativo
    if (newAmountCents < 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'No se puede eliminar esta transacción porque dejaría el saldo en negativo' 
      });
    }

    // Eliminar la transacción
    await connection.query('DELETE FROM transactions WHERE id = ?', [transactionId]);

    // Actualizar el valor de la inversión
    await connection.query(
      'UPDATE investments SET current_amount_cents = ?, updated_at = NOW() WHERE id = ?',
      [newAmountCents, transaction.investment_id]
    );

    // Actualizar snapshot de la fecha de la transacción
    await connection.query(
      `INSERT INTO investment_snapshots (investment_id, value_cents, snapshot_date) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value_cents = VALUES(value_cents)`,
      [transaction.investment_id, newAmountCents, transaction.date]
    );

    await connection.commit();

    res.json({ 
      message: 'Transacción eliminada exitosamente',
      new_balance: fromCents(newAmountCents)
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la transacción',
      details: error.message 
    });
  } finally {
    connection.release();
  }
};