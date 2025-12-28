/**
 * Utilidades avanzadas de análisis financiero
 * Incluye CAGR, Sharpe Ratio, análisis de volatilidad y más
 */

/**
 * Calcula CAGR (Compound Annual Growth Rate)
 * CAGR = (Valor Final / Valor Inicial)^(1/años) - 1
 * 
 * @param {number} beginningValue - Valor inicial
 * @param {number} endingValue - Valor final
 * @param {number} years - Años transcurridos
 * @returns {number} CAGR como porcentaje
 */
function calculateCAGR(beginningValue, endingValue, years) {
  if (beginningValue <= 0 || years <= 0) return 0;
  if (endingValue < beginningValue) return -100; // Pérdida total
  
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
}

/**
 * Calcula el ROI (Retorno sobre Inversión)
 * ROI = (Ganancias / Inversión Total) * 100
 * 
 * @param {number} totalInvested - Total aportado
 * @param {number} finalValue - Valor final
 * @returns {number} ROI como porcentaje
 */
function calculateROI(totalInvested, finalValue) {
  if (totalInvested <= 0) return 0;
  return ((finalValue - totalInvested) / totalInvested) * 100;
}

/**
 * Calcula Sharpe Ratio (retorno ajustado por riesgo)
 * Sharpe = (Retorno - Tasa Libre de Riesgo) / Desviación Estándar
 * 
 * @param {number} portfolioReturn - Retorno del portafolio (%)
 * @param {number} riskFreeRate - Tasa libre de riesgo (%), default 3%
 * @param {number} volatility - Volatilidad/Desviación estándar (%)
 * @returns {number} Sharpe Ratio
 */
function calculateSharpeRatio(portfolioReturn, riskFreeRate = 3, volatility) {
  if (!volatility || volatility === 0) return 0;
  return (portfolioReturn - riskFreeRate) / volatility;
}

/**
 * Calcula desviación estándar de rendimientos
 * Útil para medir volatilidad
 * 
 * @param {Array} returns - Array de retornos periódicos
 * @returns {number} Desviación estándar
 */
function calculateVolatility(returns) {
  if (!returns || returns.length < 2) return 0;
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length;
  
  return Math.sqrt(variance);
}

/**
 * Calcula Value at Risk (VaR) - Riesgo de pérdida máxima
 * Muestra el peor escenario con cierto nivel de confianza
 * 
 * @param {Array} returns - Array de retornos históricos
 * @param {number} confidenceLevel - Nivel de confianza (default 95%)
 * @returns {number} Pérdida máxima esperada (%)
 */
function calculateValueAtRisk(returns, confidenceLevel = 95) {
  if (!returns || returns.length === 0) return 0;
  
  const sorted = [...returns].sort((a, b) => a - b);
  const index = Math.floor((100 - confidenceLevel) / 100 * sorted.length);
  
  return sorted[index] || 0;
}

/**
 * Análisis de sensibilidad de una inversión
 * Muestra cómo cambia el resultado con variación en tasa de retorno
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} baseRate - Tasa base (%)
 * @param {number} years - Años
 * @param {number} variationPercent - Variación a probar (default ±5%)
 * @returns {Object} Análisis de sensibilidad
 */
function sensitivityAnalysis(principal, monthlyContribution, baseRate, years, variationPercent = 5) {
  const calculateFV = (rate) => {
    const monthlyRate = rate / 100 / 12;
    let balance = principal;
    
    for (let month = 0; month < years * 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    
    return balance;
  };
  
  const downRate = baseRate - variationPercent;
  const upRate = baseRate + variationPercent;
  
  const baseValue = calculateFV(baseRate);
  const downValue = calculateFV(Math.max(0, downRate));
  const upValue = calculateFV(upRate);
  
  return {
    base: {
      rate: baseRate,
      value: Math.round(baseValue)
    },
    pessimistic: {
      rate: Math.max(0, downRate),
      value: Math.round(downValue),
      variance: Math.round(downValue - baseValue)
    },
    optimistic: {
      rate: upRate,
      value: Math.round(upValue),
      variance: Math.round(upValue - baseValue)
    },
    range: Math.round(upValue - downValue)
  };
}

/**
 * Proyección detallada mes a mes
 * Más preciso que proyección anual
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual (%)
 * @param {number} years - Años
 * @returns {Array} Array con datos de cada mes
 */
function monthlyProjection(principal, monthlyContribution, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const projection = [];
  
  let balance = principal;
  let totalContributed = principal;
  
  for (let month = 1; month <= years * 12; month++) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContribution;
    totalContributed += monthlyContribution;
    
    projection.push({
      month,
      year: Math.ceil(month / 12),
      balance: Math.round(balance),
      interest: Math.round(interest),
      totalContributed: Math.round(totalContributed),
      earnings: Math.round(balance - totalContributed),
      roi: totalContributed > 0 ? ((balance - totalContributed) / totalContributed * 100).toFixed(2) : 0
    });
  }
  
  return projection;
}

/**
 * Análisis de breakeven (punto de equilibrio)
 * Cuándo el monto invertido iguala al inicial (retorna 0%)
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @returns {number} Mes en que se alcanza breakeven
 */
function calculateBreakeven(principal, monthlyContribution) {
  if (monthlyContribution === 0) return Infinity;
  
  // Meses hasta que los aportes igualen el principal
  return Math.ceil(principal / monthlyContribution);
}

/**
 * Proyección con diferentes frecuencias de aporte
 * 
 * @param {number} principal - Capital inicial
 * @param {number} contribution - Aporte
 * @param {number} annualRate - Tasa anual (%)
 * @param {number} years - Años
 * @param {string} frequency - 'mensual', 'trimestral', 'semestral', 'anual'
 * @returns {Object} Resultados para cada frecuencia
 */
function compareContributionFrequencies(principal, contribution, annualRate, years) {
  const calculateByFrequency = (freq) => {
    const frequencies = {
      'mensual': { months: 1, adjust: 1 },
      'trimestral': { months: 3, adjust: 3 },
      'semestral': { months: 6, adjust: 6 },
      'anual': { months: 12, adjust: 12 }
    };
    
    const f = frequencies[freq] || frequencies['mensual'];
    const monthlyRate = annualRate / 100 / 12;
    
    let balance = principal;
    const totalMonths = years * 12;
    
    for (let month = 1; month <= totalMonths; month++) {
      balance = balance * (1 + monthlyRate);
      
      if (month % f.months === 0) {
        balance += contribution;
      }
    }
    
    const totalContributed = principal + (contribution * (totalMonths / f.months));
    
    return {
      frequency: freq,
      finalValue: Math.round(balance),
      totalContributed: Math.round(totalContributed),
      earnings: Math.round(balance - totalContributed),
      roi: ((balance - totalContributed) / totalContributed * 100).toFixed(2)
    };
  };
  
  return {
    mensual: calculateByFrequency('mensual'),
    trimestral: calculateByFrequency('trimestral'),
    semestral: calculateByFrequency('semestral'),
    anual: calculateByFrequency('anual')
  };
}

/**
 * Verifica si una meta es alcanzable
 * 
 * @param {number} targetAmount - Monto objetivo
 * @param {number} currentAmount - Monto actual ahorrado
 * @param {number} monthlyContribution - Aporte mensual actual
 * @param {number} monthsRemaining - Meses hasta deadline
 * @param {number} expectedAnnualReturn - Retorno anual esperado (%)
 * @returns {Object} Análisis de viabilidad
 */
function analyzeGoalFeasibility(targetAmount, currentAmount, monthlyContribution, monthsRemaining, expectedAnnualReturn = 5) {
  const monthlyRate = expectedAnnualReturn / 100 / 12;
  
  // Proyectar valor actual con aportes continuos
  let projectedValue = currentAmount;
  for (let month = 0; month < monthsRemaining; month++) {
    projectedValue = projectedValue * (1 + monthlyRate) + monthlyContribution;
  }
  
  const difference = targetAmount - projectedValue;
  const isAchievable = difference <= 0;
  
  // Si no es alcanzable, calcular aporte necesario
  let requiredMonthly = monthlyContribution;
  if (!isAchievable && monthsRemaining > 0) {
    const monthlyRateDecimal = expectedAnnualReturn / 100 / 12;
    const futureValueCurrent = currentAmount * Math.pow(1 + monthlyRateDecimal, monthsRemaining);
    const needed = targetAmount - futureValueCurrent;
    
    if (monthlyRateDecimal === 0) {
      requiredMonthly = needed / monthsRemaining;
    } else {
      const annuityFactor = (Math.pow(1 + monthlyRateDecimal, monthsRemaining) - 1) / monthlyRateDecimal;
      requiredMonthly = needed / annuityFactor;
    }
  }
  
  return {
    isAchievable,
    projectedValue: Math.round(projectedValue),
    targetAmount,
    difference: Math.round(difference),
    requiredMonthly: Math.round(requiredMonthly * 100) / 100,
    currentMonthly: monthlyContribution,
    monthsRemaining,
    riskLevel: isAchievable ? 'baja' : 'alta',
    confidence: isAchievable ? 100 : Math.max(0, Math.round((projectedValue / targetAmount) * 100))
  };
}

module.exports = {
  calculateCAGR,
  calculateROI,
  calculateSharpeRatio,
  calculateVolatility,
  calculateValueAtRisk,
  sensitivityAnalysis,
  monthlyProjection,
  calculateBreakeven,
  compareContributionFrequencies,
  analyzeGoalFeasibility
};
