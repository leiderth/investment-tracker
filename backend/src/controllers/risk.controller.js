// backend/src/controllers/risk.controller.js

const pool = require('../config/database');
const {
  calculateConcentrationIndex,
  evaluateConcentrationRisk,
  calculateRiskAdjustedScore,
  calculateSharpeRatio
} = require('../utils/riskAnalysis');
const { fromCents } = require('../utils/currency');

/**
 * Análisis de riesgo del portafolio completo
 * GET /api/risk/portfolio-analysis
 */
exports.getPortfolioRiskAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener todas las inversiones activas del usuario
    const [investments] = await pool.query(
      `SELECT 
        id,
        type,
        platform,
        initial_amount_cents,
        current_amount_cents,
        expected_return_percentage,
        actual_return_percentage,
        risk_level,
        volatility_percentage,
        max_drawdown_percentage,
        status
       FROM investments 
       WHERE user_id = ? AND status = 'active'
       ORDER BY current_amount_cents DESC`,
      [userId]
    );

    if (investments.length === 0) {
      return res.json({
        portfolioRisk: 'N/A',
        totalValue: 0,
        investments: [],
        concentrationAnalysis: null,
        recommendedActions: []
      });
    }

    // Calcular valor total del portafolio
    const totalValue = investments.reduce(
      (sum, inv) => sum + inv.current_amount_cents,
      0
    );

    // Calcular valores en dinero para análisis
    const investmentValues = investments.map((inv) =>
      Math.max(inv.current_amount_cents, 0)
    );

    // Calcular índice de concentración
    const hhi = calculateConcentrationIndex(investmentValues);
    const concentrationRisk = evaluateConcentrationRisk(hhi);

    // Calcular riesgo promedio ponderado
    let portfolioVolatility = 0;
    let portfolioMaxDrawdown = 0;
    let portfolioExpectedReturn = 0;

    investments.forEach((inv) => {
      const weight = inv.current_amount_cents / totalValue;
      if (inv.volatility_percentage) {
        portfolioVolatility += (inv.volatility_percentage * weight) / 100;
      }
      if (inv.max_drawdown_percentage) {
        portfolioMaxDrawdown += (inv.max_drawdown_percentage * weight) / 100;
      }
      if (inv.expected_return_percentage) {
        portfolioExpectedReturn += (inv.expected_return_percentage * weight) / 100;
      }
    });

    // Calcular Sharpe Ratio del portafolio
    const sharpeRatio = calculateSharpeRatio(
      portfolioExpectedReturn,
      portfolioVolatility
    );

    // Determinar riesgo general del portafolio
    let portfolioRiskLevel = 'bajo';
    let riskScore = 0;

    if (concentrationRisk.level === 'alto') {
      portfolioRiskLevel = 'alto';
      riskScore = 75;
    } else if (concentrationRisk.level === 'medio' || portfolioVolatility > 20) {
      portfolioRiskLevel = 'medio';
      riskScore = 50;
    } else {
      portfolioRiskLevel = 'bajo';
      riskScore = 25;
    }

    // Calcular distribución de riesgo por tipo
    const riskByType = {};
    investments.forEach((inv) => {
      if (!riskByType[inv.type]) {
        riskByType[inv.type] = {
          count: 0,
          totalValue: 0,
          avgVolatility: 0,
          avgReturn: 0
        };
      }
      riskByType[inv.type].count++;
      riskByType[inv.type].totalValue += inv.current_amount_cents;
      riskByType[inv.type].avgVolatility +=
        inv.volatility_percentage || 0;
      riskByType[inv.type].avgReturn +=
        inv.actual_return_percentage || 0;
    });

    // Promediar valores por tipo
    Object.keys(riskByType).forEach((type) => {
      const count = riskByType[type].count;
      riskByType[type].avgVolatility =
        Math.round((riskByType[type].avgVolatility / count) * 100) / 100;
      riskByType[type].avgReturn =
        Math.round((riskByType[type].avgReturn / count) * 100) / 100;
      riskByType[type].totalValue = fromCents(riskByType[type].totalValue);
      riskByType[type].percentage =
        Math.round((riskByType[type].totalValue /
          fromCents(totalValue)) * 100 * 100) / 100;
    });

    // Generar acciones recomendadas
    const recommendedActions = [];

    if (concentrationRisk.level === 'alto') {
      recommendedActions.push({
        priority: 'alta',
        action: 'Diversificar portafolio',
        description:
          'Tu portafolio tiene una concentración alta en pocas inversiones. Considera diversificar.'
      });
    }

    if (portfolioVolatility > 30) {
      recommendedActions.push({
        priority: 'alta',
        action: 'Revisar volatilidad',
        description:
          'La volatilidad de tu portafolio es alta. Considera inversiones más conservadoras.'
      });
    }

    // Inversión con mayor riesgo
    const highestRiskInv = investments.reduce((prev, curr) =>
      (curr.volatility_percentage || 0) > (prev.volatility_percentage || 0)
        ? curr
        : prev
    );

    if ((highestRiskInv.volatility_percentage || 0) > 40) {
      recommendedActions.push({
        priority: 'media',
        action: 'Revisar ' + highestRiskInv.platform,
        description: `${highestRiskInv.platform} tiene volatilidad muy alta (${highestRiskInv.volatility_percentage}%)`
      });
    }

    res.json({
      portfolioRiskLevel,
      riskScore,
      totalValue: fromCents(totalValue),
      metrics: {
        volatility: Math.round(portfolioVolatility * 100) / 100,
        maxDrawdown: Math.round(portfolioMaxDrawdown * 100) / 100,
        expectedReturn: Math.round(portfolioExpectedReturn * 100) / 100,
        sharpeRatio: Math.round(sharpeRatio * 100) / 100
      },
      concentrationAnalysis: {
        hhi,
        level: concentrationRisk.level,
        message: concentrationRisk.message
      },
      riskByType,
      topRisks: investments
        .sort((a, b) => (b.volatility_percentage || 0) - (a.volatility_percentage || 0))
        .slice(0, 3)
        .map((inv) => ({
          id: inv.id,
          platform: inv.platform,
          type: inv.type,
          volatility: inv.volatility_percentage,
          value: fromCents(inv.current_amount_cents)
        })),
      recommendedActions
    });
  } catch (error) {
    console.error('Error en análisis de riesgo:', error);
    res.status(500).json({
      error: 'Error al analizar el riesgo del portafolio',
      details: error.message
    });
  }
};

/**
 * Obtener distribución de riesgo
 * GET /api/risk/distribution
 */
exports.getRiskDistribution = async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener inversiones activas
    const [investments] = await pool.query(
      `SELECT 
        id,
        type,
        platform,
        current_amount_cents,
        risk_level,
        expected_return_percentage
       FROM investments 
       WHERE user_id = ? AND status = 'active'`,
      [userId]
    );

    // Contar por nivel de riesgo
    const distribution = {
      bajo: { count: 0, value: 0, investments: [] },
      medio: { count: 0, value: 0, investments: [] },
      alto: { count: 0, value: 0, investments: [] }
    };

    const totalValue = investments.reduce(
      (sum, inv) => sum + inv.current_amount_cents,
      0
    );

    investments.forEach((inv) => {
      const level = inv.risk_level || 'medio';
      distribution[level].count++;
      distribution[level].value += inv.current_amount_cents;
      distribution[level].investments.push({
        id: inv.id,
        platform: inv.platform,
        type: inv.type,
        value: fromCents(inv.current_amount_cents)
      });
    });

    // Calcular porcentajes
    Object.keys(distribution).forEach((level) => {
      distribution[level].value = fromCents(distribution[level].value);
      distribution[level].percentage =
        totalValue > 0
          ? Math.round((distribution[level].value /
            fromCents(totalValue)) * 100 * 100) / 100
          : 0;
    });

    res.json({
      totalValue: fromCents(totalValue),
      distribution,
      summary: {
        lowRiskPercentage: distribution.bajo.percentage,
        mediumRiskPercentage: distribution.medio.percentage,
        highRiskPercentage: distribution.alto.percentage
      }
    });
  } catch (error) {
    console.error('Error al obtener distribución de riesgo:', error);
    res.status(500).json({
      error: 'Error al obtener la distribución de riesgo',
      details: error.message
    });
  }
};

/**
 * Obtener análisis de riesgo individual de una inversión
 * GET /api/risk/investment/:id
 */
exports.getInvestmentRiskAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [investments] = await pool.query(
      `SELECT * FROM investments WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (investments.length === 0) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }

    const investment = investments[0];

    // Calcular score de riesgo ajustado
    const riskScore = calculateRiskAdjustedScore({
      ...investment,
      actual_return_percentage:
        ((investment.current_amount_cents -
          investment.initial_amount_cents) /
          investment.initial_amount_cents) *
        100
    });

    res.json({
      investment: {
        id: investment.id,
        platform: investment.platform,
        type: investment.type,
        value: fromCents(investment.current_amount_cents)
      },
      riskMetrics: {
        level: investment.risk_level,
        volatility: investment.volatility_percentage,
        maxDrawdown: investment.max_drawdown_percentage,
        expectedReturn: investment.expected_return_percentage,
        actualReturn:
          ((investment.current_amount_cents -
            investment.initial_amount_cents) /
            investment.initial_amount_cents) *
          100
      },
      riskScore,
      recommendations: generateRiskRecommendations(investment, riskScore)
    });
  } catch (error) {
    console.error('Error en análisis de inversión:', error);
    res.status(500).json({
      error: 'Error al analizar la inversión',
      details: error.message
    });
  }
};

/**
 * Generar recomendaciones basadas en riesgo
 */
function generateRiskRecommendations(investment, riskScore) {
  const recommendations = [];

  if (riskScore.score < 40) {
    recommendations.push(
      'Esta inversión tiene alto riesgo. Considera diversificar o aumentar tu capital de emergencia.'
    );
  }

  if ((investment.volatility_percentage || 0) > 30) {
    recommendations.push(
      'La volatilidad es alta. Revisa si necesitas tomar ganancias parciales.'
    );
  }

  if ((investment.max_drawdown_percentage || 0) > 25) {
    recommendations.push(
      'Ha tenido caídas significativas. Establece stops de pérdida si aún no lo has hecho.'
    );
  }

  if (
    investment.expected_return_percentage &&
    investment.expected_return_percentage > 30
  ) {
    recommendations.push(
      'El retorno esperado es agresivo. Asegúrate de tener horizonte a largo plazo.'
    );
  }

  return recommendations.length > 0
    ? recommendations
    : [
      'El perfil de riesgo es razonable. Continúa monitoreando regularmente.'
    ];
}
