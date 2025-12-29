// backend/src/services/socketService.js

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const connectedUsers = new Map(); // user_id -> socket_ids[]

/**
 * Initialize Socket.io server
 */
exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: 'http://localhost:5174',
      credentials: true,
    },
    reconnection: true,
  });

  // Middleware para autenticar
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Usuario ${socket.userId} conectado (socket: ${socket.id})`);

    // Rastrear usuario conectado
    if (!connectedUsers.has(socket.userId)) {
      connectedUsers.set(socket.userId, []);
    }
    connectedUsers.get(socket.userId).push(socket.id);

    // Unir a room del usuario
    socket.join(`user-${socket.userId}`);
    socket.join('rates-broadcast'); // Para tasas en vivo

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`❌ Usuario ${socket.userId} desconectado (socket: ${socket.id})`);
      
      const userSockets = connectedUsers.get(socket.userId);
      if (userSockets) {
        const idx = userSockets.indexOf(socket.id);
        if (idx > -1) {
          userSockets.splice(idx, 1);
        }
        if (userSockets.length === 0) {
          connectedUsers.delete(socket.userId);
        }
      }
    });

    // Error handler
    socket.on('error', (error) => {
      console.error(`❌ Error en socket ${socket.id}:`, error);
    });
  });

  return io;
};

/**
 * Get Socket.io instance
 */
exports.getIO = () => {
  return io;
};

/**
 * Broadcast tasas actualizadas a todos los usuarios conectados
 */
exports.broadcastRatesUpdate = (rates) => {
  if (io) {
    io.to('rates-broadcast').emit('rates:update', {
      rates,
      timestamp: new Date(),
    });
    console.log('📊 Tasas actualizadas - broadcast enviado');
  }
};

/**
 * Notificar a un usuario específico sobre una alerta
 */
exports.notifyAlertTriggered = (userId, alertData) => {
  if (io) {
    io.to(`user-${userId}`).emit('alert:triggered', {
      alert: alertData,
      timestamp: new Date(),
    });
    console.log(`🔔 Alerta enviada a usuario ${userId}`);
  }
};

/**
 * Notificar actualización del portafolio
 */
exports.notifyPortfolioUpdate = (userId, portfolioData) => {
  if (io) {
    io.to(`user-${userId}`).emit('portfolio:update', {
      portfolio: portfolioData,
      timestamp: new Date(),
    });
    console.log(`💼 Portafolio actualizado - usuario ${userId}`);
  }
};

/**
 * Check if user is connected
 */
exports.isUserConnected = (userId) => {
  const sockets = connectedUsers.get(userId);
  return sockets && sockets.length > 0;
};

/**
 * Get connected users count
 */
exports.getConnectedUsersCount = () => {
  return connectedUsers.size;
};
