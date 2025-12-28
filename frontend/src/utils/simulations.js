// backend/src/utils/simulations.js

/**
 * Calcular valor futuro con interés compuesto
 * FV = P * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual (en decimal, ej: 0.10 para 10%)
 * @param {number} years - Años de inversión
 * @param {string} frequency - Frecuencia de capitalización
 */
function calculateFutureValue(principal, monthlyContribution, annualRate, years, frequency = 'mensual') {
  let n; // Número de períodos de capitalización
  let r; // Tasa por período
  
  switch (frequency) {
    case 'diario':
      n = years * 365;
      r = annualRate / 365;
      break;
    case 'mensual':
      n = years * 12;
      r = annualRate / 12;
      break;
    case 'anual':
      n = years;
      r = annualRate;
      break;
    default:
      n = years * 12;
      r = annualRate / 12;
  }

  // Valor futuro del capital inicial
  const fvPrincipal = principal * Math.pow(1 + r, n);
  
  // Valor futuro de los aportes mensuales (anualidad ordinaria)
  let fvContributions = 0;
  if (monthlyContribution > 0 && r > 0) {
    // Convertir aportes mensuales a la frecuencia correcta
    const contributionPerPeriod = frequency === 'mensual' 
      ? monthlyContribution 
      : monthlyContribution * (12 / (frequency === 'anual' ? 1 : 365));
    
    fvContributions = contributionPerPeriod * ((Math.pow(1 + r, n) - 1) / r);
  }

  const totalFutureValue = fvPrincipal + fvContributions;
  const totalContributions = principal + (monthlyContribution * 12 * years);
  const totalEarnings = totalFutureValue - totalContributions;

  return {
    finalAmount: totalFutureValue,
    totalContributions,
    totalEarnings,
    roi: ((totalEarnings / totalContributions) * 100)
  };
}

/**
 * Calcular aporte mensual necesario para alcanzar una meta
 * PMT = (FV * r) / ((1 + r)^n - 1) - (P * r * (1 + r)^n) / ((1 + r)^n - 1)
 * 
 * @param {number} targetAmount - Meta financiera
 * @param {number} principal - Capital inicial
 * @param {number} annualRate - Tasa anual
 * @param {number} years - Años disponibles
 */
function calculateRequiredMonthlyContribution(targetAmount, principal, annualRate, years) {
  const n = years * 12; // Períodos mensuales
  const r = annualRate / 12; // Tasa mensual

  if (r === 0) {
    // Sin interés, solo dividir la diferencia
    return (targetAmount - principal) / n;
  }

  // Calcular valor futuro del principal
  const fvPrincipal = principal * Math.pow(1 + r, n);
  
  // Diferencia que debe cubrirse con aportes
  const difference = targetAmount - fvPrincipal;
  
  if (difference <= 0) {
    return 0; // Ya se alcanza la meta con el capital inicial
  }

  // Calcular aporte mensual requerido
  const monthlyContribution = (difference * r) / (Math.pow(1 + r, n) - 1);
  
  return monthlyContribution;
}

/**
 * Generar proyección año por año
 * 
 * @param {number} principal - Capital inicial
 * @param {number} monthlyContribution - Aporte mensual
 * @param {number} annualRate - Tasa anual
 * @param {number} years - Años totales
 */
function generateYearlyProjection(principal, monthlyContribution, annualRate, years) {
  const projection = [];
  let currentBalance = principal;
  let totalContributions = principal;
  
  const monthlyRate = annualRate / 12;
  
  for (let year = 1; year <= years; year++) {
    // Calcular mes a mes durante el año
    for (let month = 1; month <= 12; month++) {
      // Agregar aporte mensual
      currentBalance += monthlyContribution;
      totalContributions += monthlyContribution;
      
      // Aplicar interés
      currentBalance *= (1 + monthlyRate);
    }
    
    const earnings = currentBalance - totalContributions;
    
    projection.push({
      year,
      balance: Math.round(currentBalance * 100) / 100,
      contributions: Math.round(totalContributions * 100) / 100,
      earnings: Math.round(earnings * 100) / 100,
      roi: totalContributions > 0 ? ((earnings / totalContributions) * 100).toFixed(2) : 0
    });
  }
  
  return projection;
}

/**
 * Comparar múltiples escenarios
 */
function compareScenarios(principal, monthlyContribution, years) {
  const scenarios = {
    conservador: { rate: 0.06, label: 'Conservador (6%)' },
    moderado: { rate: 0.10, label: 'Moderado (10%)' },
    agresivo: { rate: 0.15, label: 'Agresivo (15%)' }
  };

  const comparison = {};

  Object.keys(scenarios).forEach(key => {
    const scenario = scenarios[key];
    const result = calculateFutureValue(principal, monthlyContribution, scenario.rate, years);
    
    comparison[key] = {
      label: scenario.label,
      rate: (scenario.rate * 100).toFixed(0),
      ...result
    };
  });

  return comparison;
}

module.exports = {
  calculateFutureValue,
  calculateRequiredMonthlyContribution,
  generateYearlyProjection,
  compareScenarios
};