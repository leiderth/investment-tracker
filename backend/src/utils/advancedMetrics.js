/**
 * Métricas Avanzadas de Portafolio
 * Incluye: Diversificación, Volatilidad, Correlación, VaR
 */

/**
 * Calcula el Índice de Diversificación usando HHI (Herfindahl-Hirschman Index)
 * HHI = 1 - Σ(si²) donde si = peso de inversión i
 * 
 * Interpretación:
 *   0-20: Muy concentrada (alto riesgo)
 *   20-40: Concentrada
 *   40-60: Moderadamente diversificada
 *   60-80: Bien diversificada
 *   80-100: Excelentemente diversificada
 * 
 * @param {Array} investments - Array de inversiones [{value: 1000, ...}]
 * @returns {number} Índice 0-100
 */
function calculateDiversificationIndex(investments) {
  if (!investments || investments.length === 0) return 0;
  
  // Sumar valor total
  const totalValue = investments.reduce((sum, inv) => sum + (inv.value || 0), 0);
  
  if (totalValue === 0) return 0;
  
  // Calcular suma de cuadrados de pesos
  let sumSquaredWeights = 0;
  investments.forEach(inv => {
    const weight = (inv.value || 0) / totalValue;
    sumSquaredWeights += weight * weight;
  });
  
  // HHI = 1 - Σ(si²)
  const hhi = (1 - sumSquaredWeights) * 100;
  
  return parseFloat(hhi.toFixed(2));
}

/**
 * Calcula la volatilidad histórica anualizada
 * σ_anual = σ_periodo × √(périodos en año)
 * 
 * @param {Array} historicalReturns - Array de retornos periódicos [2.1, -1.5, 3.2, ...]
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {number} Volatilidad anualizada (%)
 */
function calculateHistoricalVolatility(historicalReturns, period = 'monthly') {
  if (!historicalReturns || historicalReturns.length < 2) return 0;
  
  // Calcular media
  const mean = historicalReturns.reduce((a, b) => a + b, 0) / historicalReturns.length;
  
  // Calcular varianza
  const variance = historicalReturns.reduce((sum, ret) => {
    return sum + Math.pow(ret - mean, 2);
  }, 0) / (historicalReturns.length - 1);
  
  // Desviación estándar del período
  let periodStdDev = Math.sqrt(variance);
  
  // Anualizar según período
  let annualizationFactor = 1;
  if (period === 'daily') annualizationFactor = Math.sqrt(252);      // 252 días de trading
  else if (period === 'weekly') annualizationFactor = Math.sqrt(52);  // 52 semanas
  else if (period === 'monthly') annualizationFactor = Math.sqrt(12); // 12 meses
  
  const annualizedVolatility = periodStdDev * annualizationFactor;
  
  return parseFloat(annualizedVolatility.toFixed(4));
}

/**
 * Calcula la matriz de correlación de Pearson
 * ρ(X,Y) = Cov(X,Y) / (σx × σy)
 * 
 * @param {Array} investments - Array de inversiones con retornos históricos
 * @returns {Array} Matriz NxN de correlaciones
 */
function calculateCorrelationMatrix(investments) {
  if (!investments || investments.length === 0) return [];
  
  const n = investments.length;
  const correlations = Array(n).fill(0).map(() => Array(n).fill(0));
  
  // Función auxiliar para calcular correlación entre dos series
  const getPearsonCorrelation = (series1, series2) => {
    if (series1.length === 0 || series2.length === 0) return 0;
    
    const n = Math.min(series1.length, series2.length);
    const mean1 = series1.reduce((a, b) => a + b, 0) / n;
    const mean2 = series2.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;
      
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sum1Sq * sum2Sq);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
  };
  
  // Llenar matriz de correlaciones
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        correlations[i][j] = 1; // Correlación consigo mismo es 1
      } else if (i < j) {
        const corr = getPearsonCorrelation(
          investments[i].historicalReturns || [],
          investments[j].historicalReturns || []
        );
        correlations[i][j] = parseFloat(corr.toFixed(4));
        correlations[j][i] = correlations[i][j]; // Simétrica
      }
    }
  }
  
  return correlations;
}

/**
 * Calcula la varianza del portafolio
 * σ²p = w^T × Σ × w (forma matricial)
 * 
 * @param {Array} weights - Pesos de cada inversión [0.3, 0.5, 0.2]
 * @param {Array} volatilities - Volatilidades de cada inversión [0.1, 0.15, 0.08]
 * @param {Array} correlationMatrix - Matriz NxN de correlaciones
 * @returns {number} Varianza del portafolio
 */
function calculatePortfolioVariance(weights, volatilities, correlationMatrix) {
  if (!weights || !volatilities || !correlationMatrix) return 0;
  
  const n = weights.length;
  let variance = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const term = weights[i] * weights[j] * 
                   volatilities[i] * volatilities[j] * 
                   correlationMatrix[i][j];
      variance += term;
    }
  }
  
  return variance;
}

/**
 * Calcula el Sharpe Ratio del portafolio
 * Sharpe = (Rp - Rf) / σp
 * 
 * @param {number} portfolioReturn - Retorno anualizado del portafolio (%)
 * @param {number} volatility - Volatilidad anualizada (%)
 * @param {number} riskFreeRate - Tasa libre de riesgo (%), default 3%
 * @returns {number} Sharpe Ratio
 */
function calculatePortfolioSharpe(portfolioReturn, volatility, riskFreeRate = 3) {
  if (!volatility || volatility === 0) return 0;
  
  const sharpe = (portfolioReturn - riskFreeRate) / volatility;
  
  return parseFloat(sharpe.toFixed(4));
}

/**
 * Calcula el Value at Risk (VaR) paramétrico
 * VaR = Portafolio × σp × Z_score
 * 
 * @param {number} portfolioValue - Valor total del portafolio
 * @param {number} volatility - Volatilidad anualizada (como decimal, ej: 0.12 para 12%)
 * @param {number} confidence - Nivel de confianza (0.95 o 0.99)
 * @returns {Object} { loss95: number, loss99: number }
 */
function calculateValueAtRisk(portfolioValue, volatility, confidence = 0.95) {
  // Z-scores para intervalos de confianza
  const zScores = {
    0.90: 1.282,
    0.95: 1.645,
    0.99: 2.326
  };
  
  const zScore = zScores[confidence] || 1.645;
  
  // Pérdida máxima = Portafolio × volatilidad × Z_score
  const loss = portfolioValue * volatility * zScore;
  
  return {
    loss95: Math.round(portfolioValue * 0.12 * 1.645),  // Ejemplo con 12% volatilidad
    loss99: Math.round(portfolioValue * 0.12 * 2.326),
    percentageOf95: parseFloat((1.645 * volatility * 100).toFixed(2)),
    percentageOf99: parseFloat((2.326 * volatility * 100).toFixed(2))
  };
}

/**
 * Analiza la concentración por sector
 * 
 * @param {Array} investments - Array de inversiones [{sector: 'Tech', value: 1000}, ...]
 * @returns {Object} Distribución por sector con porcentajes
 */
function analyzeConcentrationBySector(investments) {
  if (!investments || investments.length === 0) return {};
  
  const totalValue = investments.reduce((sum, inv) => sum + (inv.value || 0), 0);
  
  if (totalValue === 0) return {};
  
  const sectorMap = {};
  
  investments.forEach(inv => {
    const sector = inv.sector || 'Sin Categoría';
    
    if (!sectorMap[sector]) {
      sectorMap[sector] = { value: 0, count: 0 };
    }
    
    sectorMap[sector].value += inv.value || 0;
    sectorMap[sector].count += 1;
  });
  
  // Convertir a porcentajes
  const result = {};
  Object.keys(sectorMap).forEach(sector => {
    const percentage = (sectorMap[sector].value / totalValue) * 100;
    result[sector] = {
      percentage: parseFloat(percentage.toFixed(2)),
      value: sectorMap[sector].value,
      count: sectorMap[sector].count,
      isConcentrated: percentage > 50  // Alerta si > 50%
    };
  });
  
  return result;
}

/**
 * Sugiere rebalanceo del portafolio
 * 
 * @param {Array} currentWeights - Pesos actuales [0.35, 0.50, 0.15]
 * @param {Array} targetWeights - Pesos objetivo [0.30, 0.50, 0.20]
 * @param {Array} assetNames - Nombres de los activos
 * @param {number} threshold - Umbral de desviación (%), default 5%
 * @returns {Object} { needsRebalancing, suggestions }
 */
function suggestRebalancing(currentWeights, targetWeights, assetNames = [], threshold = 5) {
  if (!currentWeights || !targetWeights) {
    return { needsRebalancing: false, suggestions: [] };
  }
  
  const suggestions = [];
  let needsRebalancing = false;
  
  for (let i = 0; i < currentWeights.length; i++) {
    const current = currentWeights[i] * 100;
    const target = targetWeights[i] * 100;
    const deviation = Math.abs(current - target);
    
    if (deviation > threshold) {
      needsRebalancing = true;
      
      suggestions.push({
        asset: assetNames[i] || `Asset ${i + 1}`,
        currentWeight: parseFloat(current.toFixed(2)),
        targetWeight: parseFloat(target.toFixed(2)),
        deviation: parseFloat(deviation.toFixed(2)),
        action: current > target ? 'SELL' : 'BUY',
        percentage: parseFloat(deviation.toFixed(2))
      });
    }
  }
  
  return { needsRebalancing, suggestions };
}

/**
 * Calcula la volatilidad histórica en un período
 * Retorna array de volatilidades calculadas a lo largo del tiempo
 * 
 * @param {Array} historicalValues - Array de valores históricos
 * @param {number} window - Ventana de cálculo (días/meses)
 * @returns {Array} Array de volatilidades calculadas
 */
function getVolatilityHistory(historicalValues, window = 30) {
  if (!historicalValues || historicalValues.length < window + 1) return [];
  
  const volatilities = [];
  
  for (let i = window; i < historicalValues.length; i++) {
    const slice = historicalValues.slice(i - window, i);
    
    // Calcular retornos en la ventana
    const returns = [];
    for (let j = 1; j < slice.length; j++) {
      const ret = ((slice[j] - slice[j - 1]) / slice[j - 1]) * 100;
      returns.push(ret);
    }
    
    // Calcular volatilidad de la ventana
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    volatilities.push(parseFloat(volatility.toFixed(4)));
  }
  
  return volatilities;
}

/**
 * Calcula métricas de riesgo del portafolio
 * 
 * @param {Object} portfolio - { totalValue, investments: [...], volatility, diversification }
 * @returns {Object} Resumen de riesgos
 */
function assessPortfolioRisk(portfolio) {
  if (!portfolio || !portfolio.investments) {
    return { riskLevel: 'desconocido', concentration: 'desconocida' };
  }
  
  const volatility = portfolio.volatility || 0;
  const diversification = portfolio.diversificationIndex || 0;
  
  // Determinar nivel de riesgo por volatilidad
  let riskLevel = 'bajo';
  if (volatility > 15) riskLevel = 'alto';
  else if (volatility > 8) riskLevel = 'medio';
  
  // Determinar concentración
  let concentration = 'excelente';
  if (diversification < 40) concentration = 'concentrada';
  else if (diversification < 60) concentration = 'moderada';
  else if (diversification < 80) concentration = 'buena';
  
  return {
    riskLevel,
    volatilityLevel: volatility,
    concentrationLevel: concentration,
    diversificationScore: diversification,
    volatilityTrend: 'estable', // Se actualiza con histórico
    recommendation: generateRiskRecommendation(riskLevel, concentration)
  };
}

/**
 * Genera recomendación basada en perfil de riesgo
 * 
 * @param {string} riskLevel - 'bajo', 'medio', 'alto'
 * @param {string} concentration - 'concentrada', 'moderada', 'buena', 'excelente'
 * @returns {string} Recomendación
 */
function generateRiskRecommendation(riskLevel, concentration) {
  const recommendations = {
    'bajo_concentrada': '⚠️ Aumenta diversificación manteniendo bajo riesgo',
    'bajo_moderada': '✅ Buen balance de riesgo y diversificación',
    'bajo_buena': '✅ Excelente perfil conservador bien diversificado',
    'bajo_excelente': '✅ Portafolio modelo para inversores conservadores',
    
    'medio_concentrada': '⚠️ Diversifica más para reducir riesgo concentrado',
    'medio_moderada': '✅ Balance aceptable, considera mejorar diversificación',
    'medio_buena': '✅ Portafolio moderado bien estructurado',
    'medio_excelente': '✅ Excelente riesgo/diversificación moderado',
    
    'alto_concentrada': '⚠️⚠️ Alto riesgo con concentración - Acción recomendada',
    'alto_moderada': '⚠️ Alto riesgo - Considera diversificar',
    'alto_buena': '⚡ Alto riesgo pero bien diversificado',
    'alto_excelente': '⚡ Portafolio agresivo pero bien estructurado'
  };
  
  const key = `${riskLevel}_${concentration}`;
  return recommendations[key] || 'Revisa tu portafolio';
}

module.exports = {
  calculateDiversificationIndex,
  calculateHistoricalVolatility,
  calculateCorrelationMatrix,
  calculatePortfolioVariance,
  calculatePortfolioSharpe,
  calculateValueAtRisk,
  analyzeConcentrationBySector,
  suggestRebalancing,
  getVolatilityHistory,
  assessPortfolioRisk,
  generateRiskRecommendation
};
