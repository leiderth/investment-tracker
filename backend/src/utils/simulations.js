/**
 * Calcula el valor futuro de una inversión
 * @param {number} principal - Monto inicial
 * @param {number} annualRate - Tasa anual (en %)
 * @param {number} years - Años de inversión
 * @param {number} frequency - Frecuencia de capitalización (12=mensual, 4=trimestral, 2=semestral, 1=anual)
 * @returns {number} Valor futuro
 */
function calculateFutureValue(principal, annualRate, years, frequency = 12) {
  const rate = annualRate / 100;
  const compoundPeriods = frequency * years;
  const ratePerPeriod = rate / frequency;
  
  return principal * Math.pow(1 + ratePerPeriod, compoundPeriods);
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
  
  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    
    projection.push({
      year,
      balance: Math.round(balance),
      totalInvested: principal + (monthlyContribution * 12 * year),
      earnings: balance - (principal + monthlyContribution * 12 * year)
    });
  }
  
  return projection;
}

/**
 * Compara escenarios de inversión
 * @param {Object} scenarios - Objeto con escenarios nombrados
 * @returns {Array} Comparación de escenarios
 */
function compareScenarios(scenarios) {
  const results = [];
  
  Object.entries(scenarios).forEach(([name, params]) => {
    const {
      principal,
      monthlyContribution = 0,
      annualRate,
      years
    } = params;
    
    const futureValue = calculateFutureValue(
      principal,
      annualRate,
      years,
      12 // Frecuencia mensual
    );
    
    const totalInvested = principal + (monthlyContribution * 12 * years);
    const earnings = futureValue - totalInvested;
    
    results.push({
      name,
      futureValue: Math.round(futureValue),
      totalInvested: Math.round(totalInvested),
      earnings: Math.round(earnings),
      earningsPercentage: ((earnings / totalInvested) * 100).toFixed(2),
      annualRate
    });
  });
  
  return results;
}

module.exports = {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  generateYearlyProjection,
  compareScenarios
};
