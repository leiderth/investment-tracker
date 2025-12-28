/**
 * Calcula el valor futuro de una inversión con aportes mensuales
 * Fórmula: FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
 * Donde: P = principal, PMT = aporte mensual, r = tasa mensual, n = períodos
 * 
 * @param {number} principal - Monto inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual (en %)
 * @param {number} years - Años de inversión
 * @param {string} frequency - Frecuencia de capitalización (mensual, trimestral, semestral, anual)
 * @returns {Object} Objeto con resultados detallados
 */
function calculateFutureValue(principal, monthlyContribution = 0, annualRate, years, frequency = 'mensual') {
  const monthlyRate = (annualRate / 100) / 12;
  const totalMonths = years * 12;
  
  // Valor futuro del principal
  const fvPrincipal = principal * Math.pow(1 + monthlyRate, totalMonths);
  
  // Valor futuro de los aportes mensuales
  let fvContributions = 0;
  if (monthlyContribution > 0) {
    fvContributions = monthlyContribution * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  }
  
  const finalAmount = fvPrincipal + fvContributions;
  const totalContributions = principal + (monthlyContribution * totalMonths);
  const totalEarnings = finalAmount - totalContributions;
  const roi = totalContributions > 0 ? (totalEarnings / totalContributions) * 100 : 0;
  
  return {
    finalAmount: Math.round(finalAmount),
    totalContributions: Math.round(totalContributions),
    totalEarnings: Math.round(totalEarnings),
    roi: roi.toFixed(2),
    fvPrincipal: Math.round(fvPrincipal),
    fvContributions: Math.round(fvContributions)
  };
}

/**
 * Calcula el aporte mensual requerido para alcanzar una meta
 * @param {number} targetAmount - Monto objetivo
 * @param {number} initialAmount - Monto inicial
 * @param {number} annualRate - Tasa anual (en %)
 * @param {number} years - Años para alcanzar la meta
 * @returns {number} Aporte mensual requerido
 */
function calculateRequiredMonthlyContribution(targetAmount, initialAmount, annualRate, years) {
  const monthlyRate = (annualRate / 100) / 12;
  const months = years * 12;
  
  // Valor futuro del monto inicial
  const futureInitial = initialAmount * Math.pow(1 + monthlyRate, months);
  
  // Monto faltante
  const needed = targetAmount - futureInitial;
  
  if (needed <= 0) return 0;
  
  // Fórmula: PMT = FV / [((1 + r)^n - 1) / r]
  const denominator = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  
  return needed / denominator;
}

/**
 * Genera proyección anual de una inversión
 * @param {number} principal - Monto inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual (en %)
 * @param {number} years - Años de proyección
 * @returns {Array} Proyección por año
 */
function generateYearlyProjection(principal, monthlyContribution, annualRate, years) {
  const monthlyRate = (annualRate / 100) / 12;
  const projection = [];
  
  let balance = principal;
  let totalContributed = principal;
  
  for (let year = 1; year <= years; year++) {
    // Calcular mes a mes para mayor precisión
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      totalContributed += monthlyContribution;
    }
    
    const earnings = balance - totalContributed;
    const roi = totalContributed > 0 ? ((earnings / totalContributed) * 100).toFixed(2) : 0;
    
    projection.push({
      year,
      balance: Math.round(balance),
      totalContributed: Math.round(totalContributed),
      earnings: Math.round(earnings),
      roi: parseFloat(roi),
      monthlyRate: monthlyRate * 100
    });
  }
  
  return projection;
}

/**
 * Genera proyección mes a mes (más detallada)
 * @param {number} principal - Monto inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual (en %)
 * @param {number} years - Años de proyección
 * @returns {Array} Proyección mes a mes
 */
function generateMonthlyProjection(principal, monthlyContribution, annualRate, years) {
  const monthlyRate = (annualRate / 100) / 12;
  const projection = [];
  
  let balance = principal;
  let totalContributed = principal;
  
  for (let month = 1; month <= years * 12; month++) {
    const interest = balance * monthlyRate;
    balance = balance + interest + monthlyContribution;
    totalContributed += monthlyContribution;
    
    // Solo guardar cada 3 meses para no generar array muy grande
    if (month % 3 === 0 || month === 1) {
      const earnings = balance - totalContributed;
      const roi = totalContributed > 0 ? ((earnings / totalContributed) * 100).toFixed(2) : 0;
      
      projection.push({
        month,
        year: Math.ceil(month / 12),
        balance: Math.round(balance),
        interest: Math.round(interest),
        totalContributed: Math.round(totalContributed),
        earnings: Math.round(earnings),
        roi: parseFloat(roi)
      });
    }
  }
  
  return projection;
}

/**
 * Compara escenarios de inversión (conservador, moderado, agresivo)
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} years - Años de inversión
 * @returns {Array} Comparación de escenarios
 */
function compareScenarios(principal, monthlyContribution, years) {
  const scenarios = [
    {
      name: 'Conservador',
      rate: 4, // 4% anual
      emoji: '🛡️',
      description: 'Bajo riesgo, retornos moderados'
    },
    {
      name: 'Moderado',
      rate: 8, // 8% anual
      emoji: '⚖️',
      description: 'Riesgo equilibrado'
    },
    {
      name: 'Agresivo',
      rate: 12, // 12% anual
      emoji: '🚀',
      description: 'Alto riesgo, retornos potencialmente mayores'
    }
  ];
  
  return scenarios.map(scenario => {
    const result = calculateFutureValue(principal, monthlyContribution, scenario.rate, years);
    
    return {
      name: scenario.name,
      emoji: scenario.emoji,
      description: scenario.description,
      annualRate: scenario.rate,
      finalValue: result.finalAmount,
      totalInvested: result.totalContributions,
      earnings: result.totalEarnings,
      roi: parseFloat(result.roi),
      projection: generateYearlyProjection(principal, monthlyContribution, scenario.rate, years)
    };
  });
}

/**
 * Análisis de sensibilidad para una simulación
 * Muestra cómo cambia el resultado si varía la tasa de retorno
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} baseRate - Tasa base (%)
 * @param {number} years - Años
 * @param {number} variation - Variación a probar (default ±2%)
 * @returns {Object} Análisis de sensibilidad
 */
function performSensitivityAnalysis(principal, monthlyContribution, baseRate, years, variation = 2) {
  const downRate = Math.max(0, baseRate - variation);
  const upRate = baseRate + variation;
  
  const baseResult = calculateFutureValue(principal, monthlyContribution, baseRate, years);
  const downResult = calculateFutureValue(principal, monthlyContribution, downRate, years);
  const upResult = calculateFutureValue(principal, monthlyContribution, upRate, years);
  
  const range = upResult.finalAmount - downResult.finalAmount;
  const rangePercentage = baseResult.finalAmount > 0 ? ((range / baseResult.finalAmount) * 100).toFixed(2) : 0;
  
  return {
    base: {
      rate: baseRate,
      finalValue: baseResult.finalAmount,
      roi: parseFloat(baseResult.roi)
    },
    pessimistic: {
      rate: downRate,
      finalValue: downResult.finalAmount,
      roi: parseFloat(downResult.roi),
      variance: downResult.finalAmount - baseResult.finalAmount
    },
    optimistic: {
      rate: upRate,
      finalValue: upResult.finalAmount,
      roi: parseFloat(upResult.roi),
      variance: upResult.finalAmount - baseResult.finalAmount
    },
    range: range,
    rangePercentage: rangePercentage
  };
}

module.exports = {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  generateYearlyProjection,
  generateMonthlyProjection,
  compareScenarios,
  performSensitivityAnalysis
};
