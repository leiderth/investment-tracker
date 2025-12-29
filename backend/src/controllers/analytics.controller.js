// backend/src/controllers/analytics.controller.js

const pool = require('../config/database');
const { fromCents } = require('../utils/currency');
const PatrimonialEvolutionManager = require('../utils/patrimonialEvolutionManager');

/**
 * Obtener métricas avanzadas de análisis
 * GET /api/analytics/metrics
 */
exports.getAdvancedMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📊 [ANALYTICS] userId:', userId);

    // Obtener todas las inversiones
    const [investments] = await pool.execute(
      `SELECT * FROM investments 
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    console.log('📊 [ANALYTICS] Inversiones encontradas:', investments?.length || 0);

    if (!investments || investments.length === 0) {
      console.log('⚠️ [ANALYTICS] Sin inversiones, retornando estructura vacía');
      return res.json({
        success: true,
        data: {
          cagr: null,
          roi: { nominal: { total: 0, annualized: 0 }, real: { total: 0 } },
          profitabilityRatio: 0,
          diversification: null,
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          topPerformers: [],
          worstPerformers: [],
          sectorAnalysis: {},
          recommendation: 'Agrega inversiones para ver análisis completo'
        }
      });
    }

    // Calcular métricas generales
    const totalCapital = investments.reduce(
      (sum, inv) => sum + inv.initial_amount_cents,
      0
    );
    const currentValue = investments.reduce(
      (sum, inv) => sum + inv.current_amount_cents,
      0
    );
    const totalProfit = currentValue - totalCapital;
    const totalReturnPercent = totalCapital > 0 ? (totalProfit / totalCapital) * 100 : 0;

    // Calcular CAGR
    const cagr = calculateCAGR(investments);

    // Calcular ROI
    const roi = calculateROI(investments);

    // Ratio de rentabilidad
    const profitabilityRatio = totalCapital > 0 ? totalProfit / totalCapital : 0;

    // Diversificación
    const diversification = calculateDiversification(investments);

    // Volatilidad (usando PatrimonialEvolutionManager si hay datos)
    let volatility = 0;
    try {
      volatility = await PatrimonialEvolutionManager.getVolatility(userId, 90);
    } catch (error) {
      volatility = calculateVolatilityFallback(investments);
    }

    // Sharpe Ratio
    const riskFreeRate = 3.0; // Tasa libre de riesgo (3%)
    const sharpeRatio = volatility > 0 
      ? ((totalReturnPercent - riskFreeRate) / volatility)
      : 0;

    // Max Drawdown (estimado basado en volatilidad)
    const maxDrawdown = Math.min(
      totalReturnPercent * -0.2,
      -volatility * 0.5
    );

    // Top performers y worst performers
    const sorted = investments
      .map((inv) => ({
        ...inv,
        return: inv.initial_amount_cents > 0 
          ? ((inv.current_amount_cents - inv.initial_amount_cents) /
              inv.initial_amount_cents) * 100
          : 0
      }))
      .sort((a, b) => b.return - a.return);

    const topPerformers = sorted.slice(0, 3).map((inv) => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      platform: inv.platform,
      value: parseFloat(fromCents(inv.current_amount_cents).toFixed(2)),
      return: parseFloat(inv.return.toFixed(2)),
      invested: parseFloat(fromCents(inv.initial_amount_cents).toFixed(2))
    }));

    const worstPerformers = sorted.slice(-3).reverse().map((inv) => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      platform: inv.platform,
      value: parseFloat(fromCents(inv.current_amount_cents).toFixed(2)),
      return: parseFloat(inv.return.toFixed(2)),
      invested: parseFloat(fromCents(inv.initial_amount_cents).toFixed(2))
    }));

    // Análisis por sector
    const sectorAnalysis = calculateSectorAnalysis(investments);

    // Recomendación basada en métricas
    let recommendation = '';
    if (sharpeRatio > 1) {
      recommendation = '✅ Excelente relación riesgo-retorno';
    } else if (sharpeRatio > 0.5) {
      recommendation = '👍 Buena relación riesgo-retorno';
    } else if (sharpeRatio > 0) {
      recommendation = '⚠️ Considera rebalancear para mejorar retornos';
    } else {
      recommendation = '❌ Retornos negativos. Revisa tu estrategia';
    }

    res.json({
      success: true,
      data: {
        cagr,
        roi,
        profitabilityRatio: parseFloat((profitabilityRatio * 100).toFixed(2)),
        diversification,
        volatility: parseFloat(volatility.toFixed(2)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(4)),
        maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
        topPerformers,
        worstPerformers,
        sectorAnalysis,
        recommendation,
        summary: {
          totalInvested: parseFloat(fromCents(totalCapital).toFixed(2)),
          currentValue: parseFloat(fromCents(currentValue).toFixed(2)),
          totalProfit: parseFloat(fromCents(totalProfit).toFixed(2)),
          numberOfInvestments: investments.length,
          inflation: { estimatedPercentage: 3.2 }
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener métricas avanzadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener métricas avanzadas',
      details: error.message
    });
  }
};

/**
 * GET /api/analytics/kpis
 * KPIs resumidos para dashboard
 */
exports.getKPIs = async (req, res) => {
  try {
    const userId = req.user.id;

    const [investments] = await pool.query(
      `SELECT 
        current_amount_cents,
        initial_amount_cents,
        type,
        status,
        annual_return_percentage
       FROM investments 
       WHERE user_id = ?`,
      [userId]
    );

    if (investments.length === 0) {
      return res.json({
        success: true,
        data: {
          totalValue: 0,
          totalInvested: 0,
          totalReturn: 0,
          averageReturn: 0,
          bestPerformer: null,
          typeDistribution: {}
        }
      });
    }

    // Calcular KPIs
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount_cents, 0);
    const totalInvested = investments.reduce((sum, inv) => sum + inv.initial_amount_cents, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const averageReturn = investments.reduce((sum, inv) => sum + (inv.annual_return_percentage || 0), 0) / investments.length;

    // Mejor performer
    const sorted = investments.sort((a, b) => 
      ((b.current_amount_cents - b.initial_amount_cents) / b.initial_amount_cents) -
      ((a.current_amount_cents - a.initial_amount_cents) / a.initial_amount_cents)
    );
    
    const bestPerformer = sorted[0] ? {
      type: sorted[0].type,
      return: parseFloat((((sorted[0].current_amount_cents - sorted[0].initial_amount_cents) / sorted[0].initial_amount_cents) * 100).toFixed(2))
    } : null;

    // Distribución por tipo
    const typeDistribution = {};
    investments.forEach(inv => {
      if (!typeDistribution[inv.type]) {
        typeDistribution[inv.type] = 0;
      }
      typeDistribution[inv.type]++;
    });

    res.json({
      success: true,
      data: {
        totalValue: parseFloat(fromCents(totalValue).toFixed(2)),
        totalInvested: parseFloat(fromCents(totalInvested).toFixed(2)),
        totalReturn: parseFloat(fromCents(totalReturn).toFixed(2)),
        returnPercentage: parseFloat(returnPercentage.toFixed(2)),
        averageReturn: parseFloat(averageReturn.toFixed(2)),
        activeInvestments,
        bestPerformer,
        typeDistribution
      }
    });

  } catch (error) {
    console.error('Error obteniendo KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener KPIs',
      details: error.message
    });
  }
};

// ============ FUNCIONES AUXILIARES ============

/**
 * Calcula el CAGR (Crecimiento Anual Compuesto)
 */
function calculateCAGR(investments) {
  if (investments.length === 0) return null;

  let earliestDate = new Date(investments[0].start_date);
  let latestDate = new Date(investments[0].end_date || new Date());

  investments.forEach((inv) => {
    const startDate = new Date(inv.start_date);
    const endDate = new Date(inv.end_date || new Date());

    if (startDate < earliestDate) earliestDate = startDate;
    if (endDate > latestDate) latestDate = endDate;
  });

  const totalInitial = investments.reduce(
    (sum, inv) => sum + inv.initial_amount_cents,
    0
  );

  const totalFinal = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );

  const years = (latestDate - earliestDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (years === 0 || totalInitial === 0) {
    return {
      percentage: 0,
      years: years.toFixed(2)
    };
  }

  const cagr = (Math.pow(totalFinal / totalInitial, 1 / years) - 1) * 100;

  return {
    percentage: parseFloat(cagr.toFixed(2)),
    years: parseFloat(years.toFixed(2))
  };
}

/**
 * Calcula ROI nominal, anualizado y real
 */
function calculateROI(investments) {
  const totalCapital = investments.reduce(
    (sum, inv) => sum + inv.initial_amount_cents,
    0
  );
  const currentValue = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );
  const profit = currentValue - totalCapital;

  const nominalROI = totalCapital > 0 ? (profit / totalCapital) * 100 : 0;

  let earliestDate = new Date(investments[0].start_date);
  investments.forEach((inv) => {
    const startDate = new Date(inv.start_date);
    if (startDate < earliestDate) earliestDate = startDate;
  });

  const years = (new Date() - earliestDate) / (1000 * 60 * 60 * 24 * 365.25);
  const annualizedROI = years > 0
    ? (Math.pow(1 + nominalROI / 100, 1 / years) - 1) * 100
    : nominalROI;

  const inflationRate = 3.2;
  const realROI = nominalROI - inflationRate;

  return {
    nominal: {
      total: parseFloat(nominalROI.toFixed(2)),
      annualized: parseFloat(annualizedROI.toFixed(2))
    },
    real: {
      total: parseFloat(realROI.toFixed(2))
    }
  };
}

/**
 * Calcula diversificación e índice HHI
 */
function calculateDiversification(investments) {
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );

  const byType = {};
  investments.forEach((inv) => {
    if (!byType[inv.type]) {
      byType[inv.type] = { value: 0, percentage: 0 };
    }
    byType[inv.type].value += inv.current_amount_cents;
  });

  Object.keys(byType).forEach((type) => {
    byType[type].value = parseFloat(fromCents(byType[type].value).toFixed(2));
    byType[type].percentage = totalValue > 0
      ? parseFloat(((byType[type].value /
        parseFloat(fromCents(totalValue))) * 100).toFixed(2))
      : 0;
  });

  const weights = investments.map((inv) => inv.current_amount_cents / totalValue);
  const hhi = weights.reduce((sum, weight) => sum + Math.pow(weight * 100, 2), 0);

  return {
    byType,
    herfindahlIndex: Math.round(hhi),
    diversificationScore: parseFloat(Math.max(0, 100 - (hhi / 100)).toFixed(2))
  };
}

/**
 * Análisis por sector
 */
function calculateSectorAnalysis(investments) {
  const sectors = {};
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount_cents, 0);

  investments.forEach((inv) => {
    const sector = inv.sector || 'Sin categoría';
    if (!sectors[sector]) {
      sectors[sector] = {
        count: 0,
        value: 0,
        percentage: 0,
        avgReturn: 0
      };
    }
    sectors[sector].count++;
    sectors[sector].value += inv.current_amount_cents;
  });

  Object.keys(sectors).forEach(sector => {
    sectors[sector].percentage = parseFloat(((sectors[sector].value / totalValue) * 100).toFixed(2));
    sectors[sector].value = parseFloat(fromCents(sectors[sector].value).toFixed(2));
  });

  return sectors;
}

/**
 * Calcula volatilidad de fallback
 */
function calculateVolatilityFallback(investments) {
  let totalVolatility = 0;
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount_cents, 0);

  investments.forEach((inv) => {
    const weight = inv.current_amount_cents / totalValue;
    let typeVolatility = 0;

    switch (inv.type?.toLowerCase()) {
      case 'acciones':
        typeVolatility = 18;
        break;
      case 'bonos':
        typeVolatility = 5;
        break;
      case 'fondos':
      case 'etf':
        typeVolatility = 12;
        break;
      case 'criptomonedas':
        typeVolatility = 65;
        break;
      case 'efectivo':
      case 'ahorros':
        typeVolatility = 0;
        break;
      default:
        typeVolatility = 10;
    }

    totalVolatility += weight * typeVolatility;
  });

  return totalVolatility;
}

/**
 * Obtener métricas avanzadas de análisis
 * GET /api/analytics/metrics
 */
exports.getAdvancedMetrics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todas las inversiones
    const [investments] = await pool.query(
      `SELECT * FROM investments 
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    if (investments.length === 0) {
      return res.json({
        cagr: null,
        roi: { nominal: { total: 0, annualized: 0 }, real: { total: 0 } },
        profitabilityRatio: 0,
        diversification: null,
        volatility: 0,
        topPerformers: [],
        worstPerformers: [],
        inflation: { estimatedPercentage: 3.2 }
      });
    }

    // Calcular métricas generales
    const totalCapital = investments.reduce(
      (sum, inv) => sum + inv.initial_amount_cents,
      0
    );
    const currentValue = investments.reduce(
      (sum, inv) => sum + inv.current_amount_cents,
      0
    );
    const totalProfit = currentValue - totalCapital;
    const totalReturnPercent = totalCapital > 0 ? (totalProfit / totalCapital) * 100 : 0;

    // Calcular CAGR
    const cagr = calculateCAGR(investments);

    // Calcular ROI
    const roi = calculateROI(investments);

    // Ratio de rentabilidad
    const profitabilityRatio = totalCapital > 0 ? totalProfit / totalCapital : 0;

    // Diversificación
    const diversification = calculateDiversification(investments);

    // Volatilidad (usando PatrimonialEvolutionManager)
    let volatility = 0;
    try {
      volatility = await PatrimonialEvolutionManager.getVolatility(userId, 90);
    } catch (error) {
      console.log('Volatility calculation fallback - may not have enough data');
      volatility = calculateVolatilityFallback(investments);
    }

    // Top performers y worst performers
    const sorted = investments
      .map((inv) => ({
        ...inv,
        return: inv.initial_amount_cents > 0 
          ? ((inv.current_amount_cents - inv.initial_amount_cents) /
              inv.initial_amount_cents) * 100
          : 0
      }))
      .sort((a, b) => b.return - a.return);

    const topPerformers = sorted.slice(0, 3).map((inv) => ({
      id: inv.id,
      platform: inv.platform,
      type: inv.type,
      value: fromCents(inv.current_amount_cents),
      return: Math.round(inv.return * 100) / 100
    }));

    const worstPerformers = sorted.slice(-3).reverse().map((inv) => ({
      id: inv.id,
      platform: inv.platform,
      type: inv.type,
      value: fromCents(inv.current_amount_cents),
      return: Math.round(inv.return * 100) / 100
    }));

    res.json({
      cagr,
      roi,
      profitabilityRatio: Math.round(profitabilityRatio * 10000) / 10000,
      diversification,
      volatility: Math.round(volatility * 100) / 100,
      topPerformers,
      worstPerformers,
      inflation: { estimatedPercentage: 3.2 }
    });
  } catch (error) {
    console.error('Error al obtener métricas avanzadas:', error);
    res.status(500).json({
      error: 'Error al obtener métricas avanzadas',
      details: error.message
    });
  }
};

/**
 * Calcula volatilidad de fallback basada en inversiones actuales
 */
function calculateVolatilityFallback(investments) {
  // Si no hay datos históricos, usar una estimación basada en tipo de inversión
  let totalVolatility = 0;
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_amount_cents, 0);

  investments.forEach((inv) => {
    const weight = inv.current_amount_cents / totalValue;
    
    // Volatilidad típica por tipo de inversión
    let typeVolatility = 0;
    switch (inv.type?.toLowerCase()) {
      case 'acciones':
        typeVolatility = 18; // 18% anual
        break;
      case 'bonos':
        typeVolatility = 5; // 5% anual
        break;
      case 'fondos':
      case 'etf':
        typeVolatility = 12; // 12% anual
        break;
      case 'criptomonedas':
        typeVolatility = 65; // 65% anual
        break;
      case 'efectivo':
      case 'ahorros':
        typeVolatility = 0; // 0% volatility
        break;
      default:
        typeVolatility = 10; // 10% default
    }
    
    totalVolatility += weight * typeVolatility;
  });

  return totalVolatility;
}

/**
 * Calcula el CAGR (Crecimiento Anual Compuesto)
 */
function calculateCAGR(investments) {
  if (investments.length === 0) return null;

  // Encontrar fecha más antigua y más reciente
  let earliestDate = new Date(investments[0].start_date);
  let latestDate = new Date(investments[0].end_date || new Date());

  investments.forEach((inv) => {
    const startDate = new Date(inv.start_date);
    const endDate = new Date(inv.end_date || new Date());

    if (startDate < earliestDate) earliestDate = startDate;
    if (endDate > latestDate) latestDate = endDate;
  });

  // Calcular valor inicial total
  const totalInitial = investments.reduce(
    (sum, inv) => sum + inv.initial_amount_cents,
    0
  );

  // Calcular valor final
  const totalFinal = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );

  // Calcular años
  const years = (latestDate - earliestDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (years === 0 || totalInitial === 0) {
    return {
      percentage: 0,
      years: years.toFixed(2)
    };
  }

  const cagr = (Math.pow(totalFinal / totalInitial, 1 / years) - 1) * 100;

  return {
    percentage: Math.round(cagr * 100) / 100,
    years: years.toFixed(2)
  };
}

/**
 * Calcula ROI nominal y real
 */
function calculateROI(investments) {
  const totalCapital = investments.reduce(
    (sum, inv) => sum + inv.initial_amount_cents,
    0
  );
  const currentValue = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );
  const profit = currentValue - totalCapital;

  // ROI nominal
  const nominalROI = totalCapital > 0 ? (profit / totalCapital) * 100 : 0;

  // Calcular años para retorno anualizado
  let earliestDate = new Date(investments[0].start_date);
  investments.forEach((inv) => {
    const startDate = new Date(inv.start_date);
    if (startDate < earliestDate) earliestDate = startDate;
  });

  const years = (new Date() - earliestDate) / (1000 * 60 * 60 * 24 * 365.25);
  const annualizedROI = years > 0
    ? (Math.pow(1 + nominalROI / 100, 1 / years) - 1) * 100
    : nominalROI;

  // ROI real (ajustado por inflación estimada - 3.2%)
  const inflationRate = 3.2;
  const realROI = nominalROI - inflationRate;

  return {
    nominal: {
      total: Math.round(nominalROI * 100) / 100,
      annualized: Math.round(annualizedROI * 100) / 100
    },
    real: {
      total: Math.round(realROI * 100) / 100
    }
  };
}

/**
 * Calcula índices de diversificación
 */
function calculateDiversification(investments) {
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_amount_cents,
    0
  );

  // Diversificación por tipo
  const byType = {};
  investments.forEach((inv) => {
    if (!byType[inv.type]) {
      byType[inv.type] = { value: 0, percentage: 0 };
    }
    byType[inv.type].value += inv.current_amount_cents;
  });

  Object.keys(byType).forEach((type) => {
    byType[type].value = fromCents(byType[type].value);
    byType[type].percentage = totalValue > 0
      ? Math.round((byType[type].value /
        fromCents(totalValue)) * 10000) / 100
      : 0;
  });

  // Índice de Herfindahl-Hirschman
  const weights = investments.map((inv) => inv.current_amount_cents / totalValue);
  const hhi = weights.reduce((sum, weight) => sum + Math.pow(weight * 100, 2), 0);

  return {
    byType,
    herfindahlIndex: Math.round(hhi)
  };
}
