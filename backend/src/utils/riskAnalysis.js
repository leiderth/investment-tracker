// backend/src/utils/riskAnalysis.js

/**
 * Utilidades para análisis de riesgo de inversiones
 */

/**
 * Calcula el nivel de riesgo basado en volatilidad
 * @param {number} volatilityPercentage - Volatilidad en porcentaje
 * @returns {string} - 'bajo', 'medio', 'alto'
 */
function getRiskLevelFromVolatility(volatilityPercentage) {
  if (volatilityPercentage <= 10) return 'bajo';
  if (volatilityPercentage <= 25) return 'medio';
  return 'alto';
}

/**
 * Calcula la desviación estándar (volatilidad) de una serie de valores
 * @param {number[]} values - Array de valores históricos
 * @returns {number} - Desviación estándar en porcentaje
 */
function calculateVolatility(values) {
  if (values.length < 2) return 0;

  // Calcular retornos logarítmicos
  const returns = [];
  for (let i = 1; i < values.length; i++) {
    const logReturn = Math.log(values[i] / values[i - 1]);
    returns.push(logReturn);
  }

  // Calcular media
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Calcular varianza
  const variance =
    returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) /
    returns.length;

  // Desviación estándar anualizada (252 días de trading)
  const volatility = Math.sqrt(variance * 252) * 100;

  return Math.round(volatility * 100) / 100;
}

/**
 * Calcula el máximo drawdown (caída máxima desde un pico)
 * @param {number[]} values - Array de valores históricos
 * @returns {number} - Drawdown máximo en porcentaje
 */
function calculateMaxDrawdown(values) {
  if (values.length < 2) return 0;

  let maxDrawdown = 0;
  let peakValue = values[0];

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peakValue) {
      peakValue = values[i];
    } else {
      const drawdown = ((peakValue - values[i]) / peakValue) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  return Math.round(maxDrawdown * 100) / 100;
}

/**
 * Calcula el índice de concentración de riesgo del portafolio
 * (Índice de Herfindahl-Hirschman)
 * @param {number[]} investmentValues - Array de valores de inversiones
 * @returns {number} - Índice HHI (0-10000)
 */
function calculateConcentrationIndex(investmentValues) {
  const totalValue = investmentValues.reduce((sum, val) => sum + val, 0);

  if (totalValue === 0) return 0;

  const weights = investmentValues.map((val) => val / totalValue);
  const hhi = weights.reduce((sum, weight) => sum + Math.pow(weight * 100, 2), 0);

  return Math.round(hhi);
}

/**
 * Evalúa el riesgo de concentración
 * @param {number} hhi - Índice HHI
 * @returns {object} - {level: string, message: string}
 */
function evaluateConcentrationRisk(hhi) {
  if (hhi < 1500) {
    return {
      level: 'bajo',
      message: 'Portafolio bien diversificado'
    };
  }
  if (hhi < 2500) {
    return {
      level: 'medio',
      message: 'Diversificación moderada - Considera rebalancear'
    };
  }
  return {
    level: 'alto',
    message: 'Alto riesgo de concentración - Recomendamos diversificar'
  };
}

/**
 * Calcula el Sharpe Ratio (rentabilidad ajustada al riesgo)
 * @param {number} returnPercentage - Retorno del activo en %
 * @param {number} volatilityPercentage - Volatilidad en %
 * @param {number} riskFreeRate - Tasa libre de riesgo en % (default: 4%)
 * @returns {number} - Sharpe Ratio
 */
function calculateSharpeRatio(
  returnPercentage,
  volatilityPercentage,
  riskFreeRate = 4
) {
  if (volatilityPercentage === 0) return 0;
  return (returnPercentage - riskFreeRate) / volatilityPercentage;
}

/**
 * Calcula la Calificación de Riesgo Ajustado (0-100)
 * @param {object} investment - Objeto de inversión
 * @returns {object} - {score: number, rating: string}
 */
function calculateRiskAdjustedScore(investment) {
  let score = 100;

  // Penalizar por volatilidad
  if (investment.volatility_percentage) {
    const volatilityPenalty = Math.min(investment.volatility_percentage * 2, 40);
    score -= volatilityPenalty;
  }

  // Penalizar por drawdown máximo
  if (investment.max_drawdown_percentage) {
    const drawdownPenalty = Math.min(investment.max_drawdown_percentage, 30);
    score -= drawdownPenalty;
  }

  // Bonificar por retorno positivo
  if (investment.actual_return_percentage > 0) {
    const returnBonus = Math.min(investment.actual_return_percentage / 2, 20);
    score += returnBonus;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    rating:
      score >= 80
        ? 'Excelente'
        : score >= 60
          ? 'Bueno'
          : score >= 40
            ? 'Aceptable'
            : 'Riesgoso'
  };
}

module.exports = {
  getRiskLevelFromVolatility,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateConcentrationIndex,
  evaluateConcentrationRisk,
  calculateSharpeRatio,
  calculateRiskAdjustedScore
};
