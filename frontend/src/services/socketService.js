// Optional socket.io support
let io = null;
try {
  io = require('socket.io-client').default || require('socket.io-client');
} catch (e) {
  console.warn('socket.io-client not available, WebSocket features will be disabled');
}

let socket = null;

export const initializeSocket = (token) => {
  if (!io) {
    console.warn('socket.io-client not loaded');
    return null;
  }

  if (socket) {
    return socket;
  }

  socket = io('http://localhost:5000', {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket desconectado');
  });

  socket.on('error', (error) => {
    console.error('❌ Error WebSocket:', error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners
export const onRatesUpdate = (callback) => {
  if (socket) {
    socket.on('rates:update', callback);
  }
};

export const onAlertTriggered = (callback) => {
  if (socket) {
    socket.on('alert:triggered', callback);
  }
};

export const onPortfolioUpdate = (callback) => {
  if (socket) {
    socket.on('portfolio:update', callback);
  }
};

export const offRatesUpdate = () => {
  if (socket) {
    socket.off('rates:update');
  }
};

export const offAlertTriggered = () => {
  if (socket) {
    socket.off('alert:triggered');
  }
};

export const offPortfolioUpdate = () => {
  if (socket) {
    socket.off('portfolio:update');
  }
};
