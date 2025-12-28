// backend/src/utils/logger.js

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');

// Crear carpeta de logs si no existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Niveles de log
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

/**
 * Colores para consola
 */
const Colors = {
  ERROR: '\x1b[31m',    // Rojo
  WARN: '\x1b[33m',     // Amarillo
  INFO: '\x1b[36m',     // Cyan
  DEBUG: '\x1b[35m',    // Magenta
  TRACE: '\x1b[37m',    // Blanco
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.currentLevel = LogLevel.DEBUG;
  }

  /**
   * Formatea mensaje de log
   */
  format(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const context = typeof message === 'string' ? message : JSON.stringify(message);
    
    return {
      timestamp,
      level,
      message: context,
      data: typeof data === 'object' ? data : {},
      env: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Escribe en archivo
   */
  writeToFile(level, formatted) {
    const logFile = path.join(LOG_DIR, `${level.toLowerCase()}.log`);
    const allLogsFile = path.join(LOG_DIR, 'all.log');

    const content = JSON.stringify(formatted) + '\n';

    try {
      fs.appendFileSync(logFile, content);
      fs.appendFileSync(allLogsFile, content);
    } catch (err) {
      console.error('Error escribiendo log:', err);
    }
  }

  /**
   * Log a consola con colores
   */
  logToConsole(level, formatted) {
    const color = Colors[level] || '';
    const timestamp = formatted.timestamp;
    const message = formatted.message;
    const dataStr = Object.keys(formatted.data).length > 0 
      ? JSON.stringify(formatted.data, null, 2) 
      : '';

    console.log(
      `${color}[${timestamp}] ${level}:${Colors.RESET} ${message}${dataStr ? '\n' + dataStr : ''}`
    );
  }

  /**
   * Log genérico
   */
  log(level, message, data = {}) {
    const formatted = this.format(level, message, data);
    this.logToConsole(level, formatted);
    this.writeToFile(level, formatted);
  }

  /**
   * Log de error
   */
  error(message, data = {}) {
    this.log(LogLevel.ERROR, message, data);
  }

  /**
   * Log de advertencia
   */
  warn(message, data = {}) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log de información
   */
  info(message, data = {}) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log de debug
   */
  debug(message, data = {}) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log de trace (muy detallado)
   */
  trace(message, data = {}) {
    this.log(LogLevel.TRACE, message, data);
  }

  /**
   * Log de request HTTP
   */
  logRequest(method, path, statusCode, duration, userId = null) {
    this.info(`${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`,
      user_id: userId
    });
  }

  /**
   * Log de SQL query (para debugging)
   */
  logQuery(query, params = [], duration = 0) {
    if (process.env.NODE_ENV === 'development') {
      this.debug('SQL Query', {
        query,
        params,
        duration: `${duration}ms`
      });
    }
  }
}

module.exports = new Logger();
