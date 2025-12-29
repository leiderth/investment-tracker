// backend/src/controllers/dashboard.complete.js
// Versión completa con TODOS los endpoints consolidados

const pool = require('../config/database');
const { fromCents, toCents } = require('../utils/currency');
const PatrimonialEvolutionManager = require('../utils/patrimonialEvolutionManager');
const ExchangeRatesManager = require('../utils/exchangeRatesManager');

/**
 * @route   GET /api/dashboard/complete
 * @desc    Obtener TODOS los datos del dashboard en un solo endpoint
 * @access  Private
 * 
 * Retorna:
 * - stats: Resumen principal (patrimonio, capital, ganancia)
 * - evolution: Evolución histórica (último mes)
 * - riskAnalysis: Análisis de riesgos
 * - topInvestments: Top 5 inversiones
 * - byType: Distribución por tipo
 * - advancedMetrics: Métricas avanzadas (volatilidad, Sharpe, etc)
 * - currencies: Portafolio en múltiples monedas
 */
exports.getCompleteDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30, currencies = ['USD', 'EUR', 'COP'] } = req.query;

    // Ejecutar todas las consultas en paralelo con manejo de errores individual
    const results = await Promise.allSettled([
      // 1. Stats generales
      getStatsData(userId),
      
      // 2. Evolución patrimonial - Deshabilitado (tabla no existe)
      Promise.resolve([]),
      
      // 3. Análisis de riesgo
      getRiskAnalysisData(userId),
      
      // 4. Top 5 inversiones
      getTopInvestmentsData(userId),
      
      // 5. Distribución por tipo
      getByTypeData(userId),
      
      // 6. Métricas avanzadas
      getAdvancedMetricsData(userId),
      
      // 7. Portafolio en múltiples monedas - Deshabilitado (tabla no existe)
      Promise.resolve({})
    ]);

    // Extraer valores con fallbacks
    const [statsResult, evolutionResult, riskResult, topResult, byTypeResult, metricsResult, currencyResult] = results;

    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {};
    const evolution = evolutionResult.status === 'fulfilled' ? evolutionResult.value : [];
    const riskAnalysis = riskResult.status === 'fulfilled' ? riskResult.value : {};
    const topInvestments = topResult.status === 'fulfilled' ? topResult.value : [];
    const byType = byTypeResult.status === 'fulfilled' ? byTypeResult.value : [];
    const advancedMetrics = metricsResult.status === 'fulfilled' ? metricsResult.value : {};
    const currencyData = currencyResult.status === 'fulfilled' ? currencyResult.value : {};

    // Log de errores si los hay
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error en promesa ${index}:`, result.reason);
      }
      if (result.status === 'fulfilled') {
        console.log(`Promesa ${index} exitosa:`, result.value ? '✓ datos' : '⚠ vacío');
      }
    });

    // Retornar todo consolidado
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        stats,
        evolution,
        riskAnalysis,
        topInvestments,
        byType,
        advancedMetrics,
        currencies: currencyData
      }
    });

  } catch (error) {
    console.error('Error en dashboard completo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cargar dashboard completo',
      details: error.message
    });
  }
};

/**
 * Helper: Obtener datos generales de stats
 */
async function getStatsData(userId) {
  try {
    console.log('🔍 getStatsData - userId:', userId);
    const [results] = await pool.execute(
      `SELECT 
        COUNT(*) as totalInvestments,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeInvestments,
        COALESCE(SUM(CASE WHEN status = 'active' THEN initial_amount_cents ELSE 0 END), 0) as totalCapitalCents,
        COALESCE(SUM(CASE WHEN status = 'active' THEN current_amount_cents ELSE 0 END), 0) as totalPatrimonyCents,
        COALESCE(SUM(CASE WHEN status = 'active' THEN current_amount_cents - initial_amount_cents ELSE 0 END), 0) as totalProfitCents
       FROM investments
       WHERE user_id = ?`,
      [userId]
    );

    const data = results[0] || {};
    console.log('📊 getStatsData - data:', data);

    const totalCapital = fromCents(data.totalCapitalCents || 0);
    const totalPatrimony = fromCents(data.totalPatrimonyCents || 0);
    const totalProfit = fromCents(data.totalProfitCents || 0);
    const returnPercentage = totalCapital > 0 ? ((totalProfit / totalCapital) * 100) : 0;

    return {
      totalInvestments: data.totalInvestments || 0,
      activeInvestments: data.activeInvestments || 0,
      totalCapital: parseFloat(totalCapital.toFixed(2)),
      totalPatrimony: parseFloat(totalPatrimony.toFixed(2)),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      returnPercentage: parseFloat(returnPercentage.toFixed(2)),
      healthStatus: returnPercentage > 15 ? 'excellent' : returnPercentage > 5 ? 'good' : returnPercentage > 0 ? 'fair' : 'poor'
    };
  } catch (error) {
    console.error('❌ Error en getStatsData:', error.message);
    return {
      totalInvestments: 0,
      activeInvestments: 0,
      totalCapital: 0,
      totalPatrimony: 0,
      totalProfit: 0,
      returnPercentage: 0,
      healthStatus: 'no-data'
    };
  }
}

/**
 * Helper: Obtener análisis de riesgo
 */
async function getRiskAnalysisData(userId) {
  try {
    console.log('🔍 getRiskAnalysisData - userId:', userId);
    const [riskDistribution] = await pool.execute(
      `SELECT 
        risk_level,
        COUNT(*) as count,
        SUM(current_amount_cents) as total_cents
       FROM investments
       WHERE user_id = ? AND status = 'active'
       GROUP BY risk_level`,
      [userId]
    );

    const [totals] = await pool.execute(
      `SELECT 
        SUM(current_amount_cents) as total_portfolio_cents,
        COUNT(*) as total_investments
       FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    console.log('📊 getRiskAnalysisData - riskDistribution:', riskDistribution?.length || 0, 'items');

    const totalPortfolio = totals[0]?.total_portfolio_cents || 0;
    const totalInvestments = totals[0]?.total_investments || 0;

    if (totalInvestments === 0) {
      return {
        total_investments: 0,
        total_value: 0,
        risk_score: 0,
        risk_level: 'sin datos',
        diversification_score: 0,
        risk_distribution: { bajo: 0, medio: 0, alto: 0 }
      };
    }

    const riskLevels = ['bajo', 'medio', 'alto'];
    const risk_distribution = {};
    const riskWeights = { bajo: 2, medio: 5, alto: 8 };
    let riskScore = 0;

    riskLevels.forEach(level => {
      const found = riskDistribution.find(d => d?.risk_level === level);
      const percentage = found ? parseFloat(((found.total_cents / totalPortfolio) * 100).toFixed(2)) : 0;
      risk_distribution[level] = percentage;
      riskScore += (percentage / 100) * (riskWeights[level] || 5);
    });

    return {
      total_investments: totalInvestments,
      total_value: parseFloat(fromCents(totalPortfolio).toFixed(2)),
      risk_score: parseFloat(riskScore.toFixed(2)),
      risk_level: riskScore < 3 ? 'bajo' : riskScore > 6 ? 'alto' : 'medio',
      diversification_score: Math.min(100, (Math.log(totalInvestments + 1) / Math.log(10)) * 50),
      risk_distribution
    };
  } catch (error) {
    console.error('❌ Error en getRiskAnalysisData:', error.message);
    return {
      total_investments: 0,
      total_value: 0,
      risk_score: 0,
      risk_level: 'sin datos',
      diversification_score: 0,
      risk_distribution: { bajo: 0, medio: 0, alto: 0 }
    };
  }
}

/**
 * Helper: Obtener top 5 inversiones (CON DATOS REALES)
 */
async function getTopInvestmentsData(userId) {
  try {
    console.log('🔍 [TOP INVESTMENTS] Buscando inversiones para user:', userId);
    
    const [results] = await pool.execute(
      `SELECT 
        id,
        type,
        platform,
        current_amount_cents,
        initial_amount_cents,
        risk_level
       FROM investments
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC
       LIMIT 10`,
      [userId]
    );

    console.log('📊 [TOP INVESTMENTS] Encontradas:', results?.length || 0, 'inversiones');

    if (!results || results.length === 0) {
      console.log('⚠️ [TOP INVESTMENTS] Sin inversiones activas');
      return [];
    }

    const topInvestments = results.map((row, index) => {
      const current = fromCents(row?.current_amount_cents || 0);
      const initial = fromCents(row?.initial_amount_cents || 0);
      const profit = current - initial;
      const returnPct = initial > 0 ? ((profit / initial) * 100) : 0;

      return {
        id: row?.id,
        name: `${row?.type} - ${row?.platform || 'Sin plataforma'}`,
        type: row?.type,
        platform: row?.platform,
        currentAmount: parseFloat(current.toFixed(2)),
        initialAmount: parseFloat(initial.toFixed(2)),
        returnPercentage: parseFloat(returnPct.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        value: parseFloat(current.toFixed(2)),
        riskLevel: row?.risk_level
      };
    });

    console.log('✅ [TOP INVESTMENTS] Retornando:', topInvestments.length, 'inversiones');
    return topInvestments;

  } catch (error) {
    console.error('❌ [TOP INVESTMENTS] Error:', error.message);
    return [];
  }
}

/**
 * Helper: Obtener distribución por tipo (CON DATOS REALES)
 */
async function getByTypeData(userId) {
  try {
    console.log('🔍 [BY TYPE] Buscando distribución para user:', userId);
    
    const [results] = await pool.execute(
      `SELECT 
        type,
        COUNT(*) as count,
        SUM(current_amount_cents) as total_cents,
        SUM(initial_amount_cents) as initial_cents,
        AVG(CASE 
          WHEN initial_amount_cents > 0 
          THEN ((current_amount_cents - initial_amount_cents) / initial_amount_cents) * 100 
          ELSE 0 
        END) as avg_return
       FROM investments
       WHERE user_id = ? AND status = 'active'
       GROUP BY type
       ORDER BY total_cents DESC`,
      [userId]
    );

    console.log('📊 [BY TYPE] Encontrados:', results?.length || 0, 'tipos');

    if (!results || results.length === 0) {
      console.log('⚠️ [BY TYPE] Sin inversiones');
      return [];
    }

    const totalPortfolio = results.reduce((sum, row) => sum + (row?.total_cents || 0), 0);
    console.log('💰 [BY TYPE] Total portafolio:', totalPortfolio, 'centavos');

    const byType = results.map(row => {
      const total = fromCents(row?.total_cents || 0);
      const avgReturn = parseFloat(row?.avg_return || 0); // Convert to number first
      const percentage = totalPortfolio > 0 ? ((row?.total_cents || 0) / totalPortfolio) * 100 : 0;

      return {
        type: row?.type,
        count: row?.count || 0,
        total: parseFloat(total.toFixed(2)),
        avgReturn: isNaN(avgReturn) ? 0 : parseFloat(avgReturn.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(2))
      };
    });

    console.log('✅ [BY TYPE] Retornando:', byType.length, 'tipos');
    return byType;

  } catch (error) {
    console.error('❌ [BY TYPE] Error:', error.message, error.stack);
    return [];
  }
}

/**
 * Helper: Obtener métricas avanzadas (CON DATOS REALES)
 */
async function getAdvancedMetricsData(userId) {
  try {
    console.log('🔍 [ADVANCED METRICS] Buscando inversiones para user:', userId);
    
    const [investments] = await pool.execute(
      `SELECT 
        id, type,
        initial_amount_cents,
        current_amount_cents
       FROM investments
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    console.log('📊 [ADVANCED METRICS] Encontradas:', investments?.length || 0, 'inversiones');

    if (!investments || investments.length === 0) {
      console.log('⚠️ [ADVANCED METRICS] Sin inversiones');
      return {
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        diversificationScore: 0,
        numberOfInvestments: 0
      };
    }

    const totalValue = investments.reduce((sum, inv) => sum + (inv?.current_amount_cents || 0), 0);
    const totalInitial = investments.reduce((sum, inv) => sum + (inv?.initial_amount_cents || 0), 0);
    const totalProfit = totalValue - totalInitial;
    const totalReturn = totalInitial > 0 ? ((totalProfit / totalInitial) * 100) : 0;

    console.log(`💰 [ADVANCED METRICS] Inicial: ${totalInitial}, Actual: ${totalValue}, Retorno: ${totalReturn}%`);

    // Volatilidad calculada de los retornos individuales
    let volatility = 0;
    if (investments.length > 1) {
      const returns = investments.map(inv => {
        const initial = inv?.initial_amount_cents || 0;
        const current = inv?.current_amount_cents || 0;
        return initial > 0 ? ((current - initial) / initial) * 100 : 0;
      });
      
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
      volatility = Math.sqrt(variance);
    } else {
      volatility = Math.abs(totalReturn) * 0.5;
    }

    const riskFreeRate = 3.0;
    const sharpeRatio = volatility > 0 ? (totalReturn - riskFreeRate) / volatility : totalReturn > 0 ? 1 : 0;

    // Max Drawdown
    const maxDrawdown = investments.length > 0 ? 
      Math.min(...investments.map(inv => {
        const initial = inv?.initial_amount_cents || 0;
        const current = inv?.current_amount_cents || 0;
        return initial > 0 ? ((current - initial) / initial) * 100 : 0;
      })) : 0;

    // Diversificación (HHI)
    const weights = investments.map(inv => (inv?.current_amount_cents || 0) / totalValue);
    const hhi = weights.reduce((sum, w) => sum + Math.pow(w * 100, 2), 0);
    const diversificationScore = Math.max(0, 100 - (hhi / 100));

    const result = {
      volatility: parseFloat(volatility.toFixed(2)),
      sharpeRatio: parseFloat(sharpeRatio.toFixed(4)),
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      diversificationScore: parseFloat(diversificationScore.toFixed(2)),
      numberOfInvestments: investments.length
    };

    console.log('✅ [ADVANCED METRICS] Retornando:', result);
    return result;

  } catch (error) {
    console.error('❌ [ADVANCED METRICS] Error:', error.message, error.stack);
    return {
      volatility: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      diversificationScore: 0,
      numberOfInvestments: 0
    };
  }
}

/**
 * Helper: Obtener portafolio en múltiples monedas
 */
async function getCurrencyPortfolioData(userId, currencies) {
  try {
    const [totalValue] = await pool.execute(
      `SELECT COALESCE(SUM(current_amount_cents), 0) as total
       FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const baseAmount = totalValue[0].total / 100; // Convertir de centavos a pesos/dólares

    const result = {
      baseCurrency: 'USD',
      baseAmount: parseFloat(baseAmount.toFixed(2)),
      conversions: {}
    };

    // Intentar convertir a cada moneda solicitada
    for (const currency of currencies) {
      try {
        if (currency === 'USD') {
          result.conversions[currency] = parseFloat(baseAmount.toFixed(2));
        } else {
          const converted = await ExchangeRatesManager.convert(baseAmount, 'USD', currency);
          // convert retorna {original, converted, rate}
          result.conversions[currency] = converted.converted || baseAmount;
        }
      } catch (error) {
        console.warn(`Error convirtiendo a ${currency}:`, error.message);
        result.conversions[currency] = baseAmount; // Fallback a USD
      }
    }

    return result;
  } catch (error) {
    console.error('Error en getCurrencyPortfolioData:', error);
    return {
      baseCurrency: 'USD',
      baseAmount: 0,
      conversions: {
        USD: 0,
        EUR: 0,
        COP: 0
      }
    };
  }
}

// ========================================
// ENDPOINTS INDIVIDUALES (mantener compatibilidad)
// ========================================

/**
 * @route   GET /api/dashboard/stats
 * @desc    Estadísticas generales (compatibilidad)
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await getStatsData(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @route   GET /api/dashboard/evolution
 * @desc    Evolución patrimonial
 */
exports.getEvolution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const evolution = await PatrimonialEvolutionManager.getEvolution(userId, parseInt(days));
    res.json({ success: true, data: evolution });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @route   GET /api/dashboard/risk
 * @desc    Análisis de riesgo
 */
exports.getRiskAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const riskAnalysis = await getRiskAnalysisData(userId);
    res.json({ success: true, data: riskAnalysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * @route   POST /api/dashboard/snapshot
 * @desc    Crear snapshot manual del portafolio actual
 */
exports.createSnapshot = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [investments] = await pool.execute(
      `SELECT id, current_amount_cents FROM investments WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    let created = 0;
    for (const inv of investments) {
      try {
        await pool.execute(
          `INSERT IGNORE INTO investment_snapshots (investment_id, snapshot_date, value_cents)
           VALUES (?, CURDATE(), ?)`,
          [inv.id, inv.current_amount_cents]
        );
        created++;
      } catch (error) {
        // Ignorar duplicados
      }
    }

    res.json({
      success: true,
      message: `Snapshot creado: ${created} inversiones registradas`,
      snapshotsCreated: created
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
