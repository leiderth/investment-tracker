// backend/src/middleware/validation.js

const { Validator, ValidationError } = require('../utils/validator');

/**
 * Middleware para validar inversiones
 */
exports.validateInvestmentData = (req, res, next) => {
  const errors = Validator.validateInvestment(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware para validar metas financieras
 */
exports.validateGoalData = (req, res, next) => {
  const errors = Validator.validateFinancialGoal(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware para validar transacciones
 */
exports.validateTransactionData = (req, res, next) => {
  const errors = Validator.validateTransaction(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware para validar simulaciones
 */
exports.validateSimulationData = (req, res, next) => {
  const errors = Validator.validateSimulation(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware para validar análisis de metas
 */
exports.validateGoalAnalysisData = (req, res, next) => {
  const errors = Validator.validateGoalAnalysis(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};

/**
 * Middleware para validar análisis de sensibilidad
 */
exports.validateSensitivityAnalysisData = (req, res, next) => {
  const errors = Validator.validateSensitivityAnalysis(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validación fallida',
      details: errors
    });
  }
  
  next();
};
