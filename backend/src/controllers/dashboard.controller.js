const pool = require('../config/database');
const { fromCents } = require('../utils/currency');
const PatrimonialEvolutionManager = require('../utils/patrimonialEvolutionManager');
const logger = require('../utils/logger');

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas generales del dashboard
 * @access  Private
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Obtener resumen principal
    const [summaryResults] = await pool.execute(
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

    const summaryStats = summaryResults[0];
    const totalCapital = fromCents(summaryStats.totalCapitalCents);
    const totalPatrimony = fromCents(summaryStats.totalPatrimonyCents);
    const totalProfit = fromCents(summaryStats.totalProfitCents);

    const generalReturn = totalCapital > 0
      ? parseFloat(((totalProfit / totalCapital) * 100).toFixed(2))
      : 0;

    const summary = {
      totalInvestments: summaryStats.totalInvestments,
      activeInvestments: summaryStats.activeInvestments,
      totalCapital,
      totalPatrimony,
      totalProfit,
      generalReturn
    };

    // 2. Obtener distribución por tipo
    const [byTypeResults] = await pool.execute(
      `SELECT 
        type,
        COUNT(*) as count,
        COALESCE(SUM(current_amount_cents), 0) as total_cents,
        CAST(COALESCE(AVG((current_amount_cents - initial_amount_cents) / initial_amount_cents * 100), 0) AS DECIMAL(10,2)) as avg_return
       FROM investments
       WHERE user_id = ? AND status = 'active'
       GROUP BY type`,
      [userId]
    );

    const byType = byTypeResults.map(row => ({
      type: row.type,
      count: row.count,
      total: fromCents(row.total_cents),
      avgReturn: Number(row.avg_return)
    }));

    // 3. Obtener top 5 inversiones
    const [topResults] = await pool.execute(
      `SELECT 
        id,
        type,
        platform,
        current_amount_cents,
        initial_amount_cents,
        CAST((current_amount_cents - initial_amount_cents) / initial_amount_cents * 100 AS DECIMAL(10,2)) as return_percentage
       FROM investments
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC
       LIMIT 5`,
      [userId]
    );

    const topInvestments = topResults.map(row => ({
      id: row.id,
      type: row.type,
      platform: row.platform,
      currentAmount: fromCents(row.current_amount_cents),
      returnPercentage: Number(row.return_percentage)
    }));

    // Retornar estructura que espera el frontend
    res.json({
      summary,
      byType,
      topInvestments
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * @route   GET /api/dashboard/evolution
 * @desc    Obtener evolución del patrimonio (últimos 30 días)
 * @access  Private
 */
exports.getEvolution = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Usar el manager de evolución
    const evolution = await PatrimonialEvolutionManager.getEvolution(userId, parseInt(days));

    // Retornar como array
    res.json(evolution);

  } catch (error) {
    logger.error('Error obteniendo evolución:', error);
    res.status(500).json({ error: 'Error al obtener evolución patrimonial' });
  }
};

/**
 * @route   GET /api/dashboard/risk-analysis
 * @desc    Análisis de riesgo del portafolio
 * @access  Private
 */
exports.getRiskAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Obtener distribución por nivel de riesgo
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

    // 2. Calcular totales
    const [totals] = await pool.execute(
      `SELECT 
        SUM(current_amount_cents) as total_portfolio_cents,
        COUNT(*) as total_investments
       FROM investments
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    const totalPortfolio = totals[0].total_portfolio_cents || 0;
    const totalInvestments = totals[0].total_investments || 0;

    // Si no hay inversiones, retornar estructura vacía
    if (totalInvestments === 0) {
      return res.json({
        total_investments: 0,
        total_value: 0,
        risk_score: 0,
        risk_level: 'medio',
        diversification_score: 0,
        risk_distribution: {
          bajo: { percentage: 0, count: 0, value: 0 },
          medio: { percentage: 0, count: 0, value: 0 },
          alto: { percentage: 0, count: 0, value: 0 }
        },
        recommendations: []
      });
    }

    // 3. Construir distribución por nivel de riesgo
    const riskLevels = ['bajo', 'medio', 'alto'];
    const risk_distribution = {};
    
    riskLevels.forEach(level => {
      const found = riskDistribution.find(d => d.risk_level === level);
      risk_distribution[level] = {
        percentage: found ? parseFloat(((found.total_cents / totalPortfolio) * 100).toFixed(2)) : 0,
        count: found ? found.count : 0,
        value: found ? fromCents(found.total_cents) : 0
      };
    });

    // 4. Calcular score de riesgo ponderado (0-10)
    const riskWeights = { bajo: 2, medio: 5, alto: 8 };
    let riskScore = 0;
    
    Object.keys(risk_distribution).forEach(level => {
      riskScore += (risk_distribution[level].percentage / 100) * riskWeights[level];
    });
    riskScore = parseFloat(riskScore.toFixed(2));

    // 5. Determinar nivel de riesgo general
    let risk_level = 'medio';
    if (riskScore < 3) risk_level = 'bajo';
    else if (riskScore > 6) risk_level = 'alto';

    // 6. Calcular diversificación
    const diversificationScore = Math.min(
      100,
      (Math.log(totalInvestments + 1) / Math.log(10)) * 50
    );

    // 7. Generar recomendaciones
    const recommendations = [];

    // Si más del 70% está en alto riesgo
    if (risk_distribution.alto.percentage > 70) {
      recommendations.push({
        type: 'warning',
        title: '⚠️ Alto Riesgo Concentrado',
        message: `${risk_distribution.alto.percentage}% de tu portafolio está en inversiones de ALTO riesgo. Considera diversificar hacia inversiones más conservadoras.`
      });
    }

    // Si todo está en un solo nivel
    const nonZeroLevels = Object.values(risk_distribution).filter(d => d.percentage > 0).length;
    if (nonZeroLevels === 1 && totalInvestments > 1) {
      recommendations.push({
        type: 'info',
        title: '💡 Diversifica tu portafolio',
        message: 'Tu portafolio no está diversificado por riesgo. Considera incluir inversiones de diferentes niveles.'
      });
    }

    // Si no hay inversiones de bajo riesgo
    if (totalInvestments >= 3 && risk_distribution.bajo.percentage === 0) {
      recommendations.push({
        type: 'info',
        title: '🔒 Agrega estabilidad',
        message: 'No tienes inversiones de bajo riesgo. Considera agregar CDTs o bonos para estabilidad.'
      });
    }

    // Si hay buena diversificación
    if (nonZeroLevels === 3) {
      recommendations.push({
        type: 'success',
        title: '✅ Buen equilibrio',
        message: `Tu portafolio está bien diversificado con presencia en los tres niveles de riesgo.`
      });
    }

    res.json({
      total_investments: totalInvestments,
      total_value: fromCents(totalPortfolio),
      risk_score: riskScore,
      risk_level,
      diversification_score: parseFloat(diversificationScore.toFixed(2)),
      risk_distribution,
      recommendations
    });

  } catch (error) {
    console.error('Error en análisis de riesgo:', error);
    res.status(500).json({ error: 'Error al analizar el riesgo' });
  }
};

/**
 * @route   GET /api/dashboard/advanced-metrics
 * @desc    Obtener métricas avanzadas de KPIs
 * @access  Private
 */
exports.getAdvancedMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      calculateDiversificationIndex,
      calculateHistoricalVolatility,
      calculateCorrelationMatrix,
      calculatePortfolioVariance,
      calculatePortfolioSharpe,
      calculateValueAtRisk,
      analyzeConcentrationBySector,
      assessPortfolioRisk
    } = require('../utils/advancedMetrics');

    // 1. Obtener inversiones activas
    const [investments] = await pool.execute(
      `SELECT 
        id,
        name,
        type,
        sector,
        initial_amount_cents,
        current_amount_cents,
        annual_return_percentage,
        status
       FROM investments
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    if (investments.length === 0) {
      return res.json({
        success: true,
        data: {
          diversificationIndex: 0,
          volatility: {
            historical: 0,
            period: 'monthly',
            dataPoints: 0
          },
          correlationMatrix: [],
          portfolioVariance: 0,
          sharpeRatio: 0,
          valueAtRisk: {
            loss95: 0,
            loss99: 0,
            percentageOf95: 0,
            percentageOf99: 0
          },
          sectorConcentration: {},
          riskMetrics: {
            portfolioRiskLevel: 'bajo',
            concentration: 'desconocida',
            volatilityTrend: 'sin datos'
          },
          message: 'Sin inversiones activas'
        }
      });
    }

    // 2. Convertir a formato de cálculo
    const investmentData = investments.map(inv => ({
      id: inv.id,
      name: inv.name,
      type: inv.type,
      sector: inv.sector || 'Sin Categoría',
      value: inv.current_amount_cents / 100,
      initialValue: inv.initial_amount_cents / 100,
      annualReturn: inv.annual_return_percentage || 10,
      historicalReturns: Array(12).fill(inv.annual_return_percentage / 12 || 0.83) // Simulado por ahora
    }));

    // 3. Calcular total del portafolio
    const totalValue = investmentData.reduce((sum, inv) => sum + inv.value, 0);
    const totalInitialValue = investmentData.reduce((sum, inv) => sum + inv.initialValue, 0);
    const totalReturn = totalValue - totalInitialValue;
    const totalReturnPercentage = (totalReturn / totalInitialValue) * 100;

    // 4. Calcular índice de diversificación (HHI)
    const diversificationIndex = calculateDiversificationIndex(investmentData);

    // 5. Calcular volatilidad histórica
    const historicalReturns = investmentData.map(inv => inv.annualReturn);
    const volatility = calculateHistoricalVolatility(historicalReturns, 'monthly');

    // 6. Matriz de correlación
    const correlationMatrix = calculateCorrelationMatrix(investmentData);

    // 7. Varianza del portafolio
    const weights = investmentData.map(inv => inv.value / totalValue);
    const volatilities = investmentData.map(inv => (inv.annualReturn / 100) * 0.25); // Estimar volatilidad
    const portfolioVariance = calculatePortfolioVariance(weights, volatilities, correlationMatrix);

    // 8. Sharpe Ratio
    const sharpeRatio = calculatePortfolioSharpe(totalReturnPercentage, volatility);

    // 9. Value at Risk
    const valueAtRisk = calculateValueAtRisk(totalValue, volatility / 100);

    // 10. Concentración por sector
    const sectorConcentration = analyzeConcentrationBySector(investmentData);

    // 11. Evaluación de riesgo
    const riskMetrics = assessPortfolioRisk({
      totalValue,
      investments: investmentData,
      volatility,
      diversificationIndex
    });

    // 12. Sugerencias de rebalanceo (si aplicable)
    const targetWeights = Array(investmentData.length).fill(1 / investmentData.length);
    
    res.json({
      success: true,
      data: {
        diversificationIndex: parseFloat(diversificationIndex.toFixed(2)),
        volatility: {
          historical: parseFloat(volatility.toFixed(4)),
          period: 'monthly',
          dataPoints: investmentData.length,
          interpretation: volatility > 15 ? 'Alta' : volatility > 8 ? 'Media' : 'Baja'
        },
        correlationMatrix,
        portfolioVariance: parseFloat(portfolioVariance.toFixed(6)),
        sharpeRatio: parseFloat(sharpeRatio.toFixed(4)),
        valueAtRisk: {
          loss95: Math.round(valueAtRisk.loss95),
          loss99: Math.round(valueAtRisk.loss99),
          percentageOf95: valueAtRisk.percentageOf95,
          percentageOf99: valueAtRisk.percentageOf99,
          interpretation: `Con 95% confianza, máxima pérdida: ${valueAtRisk.percentageOf95.toFixed(2)}%`
        },
        sectorConcentration,
        portfolioSummary: {
          totalValue: parseFloat(totalValue.toFixed(2)),
          totalInvested: parseFloat(totalInitialValue.toFixed(2)),
          totalProfit: parseFloat(totalReturn.toFixed(2)),
          totalReturnPercentage: parseFloat(totalReturnPercentage.toFixed(2)),
          numberOfInvestments: investmentData.length
        },
        riskMetrics
      }
    });

  } catch (error) {
    console.error('Error al obtener métricas avanzadas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al calcular métricas avanzadas',
      details: error.message
    });
  }
};
// ✅ Asegúrate de tener estos exports
