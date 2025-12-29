const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * @route   GET /api/profile
 * @desc    Obtener información del perfil del usuario autenticado
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(
      `SELECT id, email, name, phone, city, country, bio, birth_date, occupation, 
              created_at, updated_at FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Actualizar información del perfil del usuario
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, city, country, bio, birth_date, occupation } = req.body;

    // Validaciones
    if (name && name.length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }

    const [result] = await pool.execute(
      `UPDATE users SET 
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        city = COALESCE(?, city),
        country = COALESCE(?, country),
        bio = COALESCE(?, bio),
        birth_date = COALESCE(?, birth_date),
        occupation = COALESCE(?, occupation),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [name, phone, city, country, bio, birth_date, occupation, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener el perfil actualizado
    const [updatedUser] = await pool.execute(
      `SELECT id, email, name, phone, city, country, bio, birth_date, occupation,
              created_at, updated_at FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: updatedUser[0]
    });
  } catch (error) {
    logger.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

/**
 * @route   POST /api/profile/change-password
 * @desc    Cambiar la contraseña del usuario
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'La nueva contraseña debe ser diferente a la actual' });
    }

    // Obtener usuario actual
    const [users] = await pool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const user = users[0];
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Guardar en historial antes de actualizar
    await pool.execute(
      'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
      [userId, user.password_hash]
    );

    // Actualizar contraseña
    await pool.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    // Registrar en logs de seguridad
    await pool.execute(
      `INSERT INTO security_logs (user_id, action, details) 
       VALUES (?, ?, ?)`,
      [userId, 'change_password', JSON.stringify({ success: true, timestamp: new Date().toISOString() })]
    );

    res.json({
      success: true,
      message: '✅ Contraseña cambiada correctamente'
    });
  } catch (error) {
    logger.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};

/**
 * @route   POST /api/profile/upload-picture
 * @desc    Subir foto de perfil
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    console.log('📸 Subiendo foto de perfil para usuario:', userId);
    console.log('📦 Tamaño del archivo:', req.file.size, 'bytes');
    console.log('🖼️ Tipo MIME:', req.file.mimetype);

    // Guardar en base de datos
    const [result] = await pool.execute(
      'UPDATE users SET profile_picture = ? WHERE id = ?',
      [req.file.buffer, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Foto guardada exitosamente para usuario:', userId);

    res.json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      pictureUrl: `/api/profile/picture/${userId}`
    });
  } catch (error) {
    logger.error('Error subiendo foto de perfil:', error);
    res.status(500).json({ error: 'Error al subir la foto: ' + error.message });
  }
};

/**
 * @route   GET /api/profile/picture/:userId
 * @desc    Obtener foto de perfil
 * @access  Public
 */
exports.getProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('🔍 Obteniendo foto de perfil para usuario:', userId);

    const [users] = await pool.execute(
      'SELECT profile_picture FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (!users[0].profile_picture) {
      console.log('❌ Foto no encontrada para usuario:', userId);
      return res.status(404).json({ error: 'Foto no encontrada' });
    }

    console.log('✅ Foto encontrada. Tamaño:', users[0].profile_picture.length, 'bytes');
    
    // Determinar tipo MIME basado en el contenido
    const pictureData = users[0].profile_picture;
    let contentType = 'image/jpeg';
    
    // Detectar tipo de imagen por magic numbers
    if (Buffer.isBuffer(pictureData)) {
      if (pictureData[0] === 0xFF && pictureData[1] === 0xD8) {
        contentType = 'image/jpeg';
      } else if (pictureData[0] === 0x89 && pictureData[1] === 0x50) {
        contentType = 'image/png';
      } else if (pictureData[0] === 0x47 && pictureData[1] === 0x49) {
        contentType = 'image/gif';
      } else if (pictureData[0] === 0x52 && pictureData[1] === 0x49) {
        contentType = 'image/webp';
      }
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(pictureData);
  } catch (error) {
    logger.error('Error obteniendo foto de perfil:', error);
    res.status(500).json({ error: 'Error al obtener la foto: ' + error.message });
  }
};

/**
 * @route   GET /api/profile/security-logs
 * @desc    Obtener logs de seguridad del usuario
 * @access  Private
 */
exports.getSecurityLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit || 20;

    const [logs] = await pool.execute(
      `SELECT id, action, details, ip_address, created_at 
       FROM security_logs 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, parseInt(limit)]
    );

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    logger.error('Error obteniendo logs de seguridad:', error);
    res.status(500).json({ error: 'Error al obtener logs de seguridad' });
  }
};
