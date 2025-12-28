const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar JWT en las peticiones
 */
function authenticateToken(req, res, next) {
  // Allow preflight requests through (CORS) without authentication
  if (req.method === 'OPTIONS') return next();
  
  // Obtener token del header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  console.log('🔐 [AUTH] Authorization header:', authHeader ? 'presente' : 'falta');
  console.log('🔐 [AUTH] Token:', token ? 'presente' : 'falta');

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) || {};
    console.log('🔐 [AUTH] Token decodificado:', JSON.stringify(decoded));
    
    req.user = decoded;
    const resolvedId = decoded?.id ?? decoded?.userId ?? decoded?.sub ?? decoded?.user?.id;
    if (resolvedId) {
      req.user.id = resolvedId;
    }
    
    console.log('🔐 [AUTH] req.user.id final:', req.user.id);
    next();
  } catch (error) {
    console.error('🔐 [AUTH] Error verificando token:', error.message);
  }
}

module.exports = { authenticateToken };