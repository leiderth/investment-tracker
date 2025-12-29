/**
 * Financial AI Service - Análisis Profesional de Inversiones
 * Especializado en educación financiera, análisis técnico y fundamental
 * 
 * ⚠️ DESCARGO DE RESPONSABILIDAD OBLIGATORIO:
 * La información que proporciona este servicio es únicamente con fines educativos e informativos.
 * NO constituye asesoramiento financiero, recomendación de inversión ni consejo profesional personalizado.
 */

class FinancialAIService {
  // Constante: Descargo de responsabilidad obligatorio
  static LEGAL_DISCLAIMER = `⚠️ AVISO IMPORTANTE: La información proporcionada es únicamente con fines educativos e informativos. NO constituye asesoramiento financiero, recomendación de inversión ni consejo profesional personalizado. Todas las decisiones de inversión son responsabilidad exclusiva del usuario. No nos hacemos responsables de pérdidas, daños o consecuencias derivadas del uso de esta información. Se recomienda consultar con un asesor financiero certificado antes de tomar decisiones de inversión.`;

  /**
   * ANÁLISIS TÉCNICO
   * Evalúa indicadores técnicos basados en histórico de precios y volumen
   */
  static analyzeTextIndicators(investments) {
    const technicalInsights = [];

    investments.forEach(inv => {
      // Simular cálculo de indicadores técnicos
      const momentum = inv.current_amount_cents / inv.initial_amount_cents;
      
      // RSI simulado (0-100): basado en ganancia/pérdida relativa
      const rsi = this._calculateSimulatedRSI(momentum);
      
      // MACD simulado: basado en diferencia de rendimientos
      const macd = this._calculateSimulatedMACD(inv);
      
      // Bandas de Bollinger simuladas
      const bollingerBands = this._calculateBollingerBands(inv);

      if (rsi > 70) {
        technicalInsights.push({
          investment: inv.name,
          type: 'RSI_OVERBOUGHT',
          signal: '📈 OVERBOUGHT',
          description: `RSI simulado de ${rsi.toFixed(0)}: puede indicar que el activo está sobrecomprado. Algunos análisis técnicos sugieren considerar toma de ganancias.`,
          level: 'warning',
          confidenceLevel: 65
        });
      } else if (rsi < 30) {
        technicalInsights.push({
          investment: inv.name,
          type: 'RSI_OVERSOLD',
          signal: '📉 OVERSOLD',
          description: `RSI simulado de ${rsi.toFixed(0)}: puede indicar sobreventa. Algunos inversionistas lo consideran oportunidad de compra.`,
          level: 'info',
          confidenceLevel: 65
        });
      }

      if (momentum > 1.2) {
        technicalInsights.push({
          investment: inv.name,
          type: 'STRONG_MOMENTUM',
          signal: '🚀 MOMENTUM FUERTE',
          description: `Momentum positivo de ${((momentum - 1) * 100).toFixed(1)}%: hay impulso alcista. Algunos inversionistas analizan si es sostenible.`,
          level: 'positive',
          confidenceLevel: 70
        });
      }
    });

    return technicalInsights;
  }

  /**
   * ANÁLISIS FUNDAMENTAL
   * Evalúa salud financiera y métricas clave
   */
  static analyzeFundamentalMetrics(investments, summary) {
    const fundamentalAnalysis = [];

    // 1. Análisis de Diversificación (P/B conceptual)
    const diversificationScore = this._calculateDiversificationScore(investments);
    
    if (diversificationScore < 3) {
      fundamentalAnalysis.push({
        metric: 'Diversificación',
        value: diversificationScore.toFixed(1),
        status: 'LOW',
        description: `Diversificación baja (${diversificationScore.toFixed(1)}/10). Concepto: concentrar en pocas inversiones aumenta riesgo idiosincrásico. Se podría considerar aumentar a 5-8 tipos diferentes.`,
        actionItems: ['Explorar nuevos sectores', 'Considerar ETFs para diversificación rápida']
      });
    } else if (diversificationScore >= 7) {
      fundamentalAnalysis.push({
        metric: 'Diversificación',
        value: diversificationScore.toFixed(1),
        status: 'HEALTHY',
        description: `Diversificación sólida (${diversificationScore.toFixed(1)}/10). Portafolio distribuido en múltiples activos y sectores.`,
        actionItems: ['Mantener nivel actual', 'Rebalancear anualmente']
      });
    }

    // 2. Análisis de Rendimiento (ROE conceptual)
    const portfolioReturn = summary.totalInvested > 0 
      ? (((summary.totalValue - summary.totalInvested) / summary.totalInvested) * 100) 
      : 0;

    const expectedReturn = 7; // Esperanza histórica de mercados
    
    if (portfolioReturn > expectedReturn) {
      fundamentalAnalysis.push({
        metric: 'Rendimiento vs Esperanza',
        value: `${portfolioReturn.toFixed(2)}%`,
        status: 'STRONG',
        description: `Rendimiento de ${portfolioReturn.toFixed(2)}%, superior al promedio histórico de ~${expectedReturn}%. Nota: resultados pasados no garantizan futuros.`,
        actionItems: ['Evaluar qué inversiones generan mayor retorno', 'Analizar sostenibilidad']
      });
    } else if (portfolioReturn < 0) {
      fundamentalAnalysis.push({
        metric: 'Rendimiento',
        value: `${portfolioReturn.toFixed(2)}%`,
        status: 'NEGATIVE',
        description: `Rendimiento negativo de ${portfolioReturn.toFixed(2)}%. Algunos factores a revisar: ciclo de mercado, selección de activos, timing de entrada.`,
        actionItems: ['Revisar posiciones perdedoras', 'Analizar si se alinean con objetivos largo plazo']
      });
    }

    // 3. Análisis de Ratios de Riesgo-Retorno (Sharpe conceptual)
    const sharpeRatio = this._calculateSharpeRatio(investments, summary);
    
    fundamentalAnalysis.push({
      metric: 'Ratio Sharpe (Riesgo-Retorno)',
      value: sharpeRatio.toFixed(2),
      status: sharpeRatio > 1.5 ? 'OPTIMAL' : sharpeRatio > 0.5 ? 'ACCEPTABLE' : 'LOW',
      description: `Sharpe de ${sharpeRatio.toFixed(2)}: mide retorno por unidad de riesgo. Valores > 1.5 se consideran buenos en literatura financiera.`,
      actionItems: ['Evaluar calidad del retorno', 'Considerar relación riesgo-beneficio']
    });

    return fundamentalAnalysis;
  }

  /**
   * GESTIÓN DE RIESGO
   * Identifica y cuantifica riesgos específicos
   */
  static assessRisks(investments, summary) {
    const riskAssessment = [];

    // 1. Riesgo de Concentración
    const concentrationRisk = this._assessConcentrationRisk(investments);
    if (concentrationRisk.level === 'HIGH') {
      riskAssessment.push({
        type: '⚠️ RIESGO DE CONCENTRACIÓN',
        severity: 'HIGH',
        description: `${concentrationRisk.topAsset} representa ${concentrationRisk.percentage.toFixed(1)}% del portafolio. Concentración alta aumenta riesgo no diversificable.`,
        mitigation: [
          'Considerar reducir posición a 15-25% del portafolio',
          'Compensar con activos menos correlacionados',
          'Evaluar si se alinea con tolerancia de riesgo'
        ]
      });
    }

    // 2. Riesgo de Volatilidad
    const volatilityRisk = this._assessVolatilityRisk(investments);
    riskAssessment.push({
      type: '📊 PERFIL DE VOLATILIDAD',
      severity: volatilityRisk.level,
      description: `Volatilidad estimada: ${volatilityRisk.volatility.toFixed(1)}%. ${volatilityRisk.assessment}`,
      mitigation: [
        'Revisar correlaciones entre activos',
        'Considerar horizonte temporal de inversión',
        'Evaluar tolerancia emocional a fluctuaciones'
      ]
    });

    // 3. Riesgo de Liquidez
    const liquidityRisk = this._assessLiquidityRisk(investments);
    riskAssessment.push({
      type: '💧 RIESGO DE LIQUIDEZ',
      severity: liquidityRisk.level,
      description: `${liquidityRisk.assessment}. ${liquidityRisk.detail}`,
      mitigation: [
        'Mantener fondo de emergencia separado',
        'Evitar "encajar" dinero en largo plazo',
        'Conocer tiempos de rescate/venta de cada activo'
      ]
    });

    // 4. Riesgo de Mercado Sistémico
    riskAssessment.push({
      type: '🌍 RIESGO SISTÉMICO DE MERCADO',
      severity: 'MEDIUM',
      description: `Todos los activos están expuestos a riesgos macroeconómicos: cambios en tasas de interés, inflación, ciclos económicos, eventos geopolíticos.`,
      mitigation: [
        'Diversificación entre clases de activos (bonos, acciones, commodities)',
        'Rebalanceo periódico',
        'Mantener horizonte temporal largo'
      ]
    });

    return riskAssessment;
  }

  /**
   * RECOMENDACIONES EDUCATIVAS
   * Proporciona educación sin prescribir (nunca "deberías", siempre "podrías considerar")
   */
  static generateEducationalRecommendations(investments, summary, metrics) {
    const recommendations = [];

    // 1. Estrategia según horizonte temporal
    recommendations.push({
      category: '📚 EDUCACIÓN: Estrategias Según Horizonte Temporal',
      recommendations: [
        {
          title: 'Corto Plazo (< 1 año)',
          description: 'Algunos inversionistas utilizan análisis técnico y trading activo.',
          consideration: 'Mayor volatilidad, impuestos más altos, estrés emocional.'
        },
        {
          title: 'Medio Plazo (1-5 años)',
          description: 'Inversionistas típicamente combinan análisis técnico y fundamental.',
          consideration: 'Balance entre oportunidades y estabilidad.'
        },
        {
          title: 'Largo Plazo (> 5 años)',
          description: 'Enfoque en fundamentales y compuesto. Algunos estudios sugieren buy & hold reduce costos.',
          consideration: 'Menor estrés, beneficios fiscales, fuerza del interés compuesto.'
        }
      ]
    });

    // 2. Técnicas de Análisis
    recommendations.push({
      category: '🔍 TÉCNICAS DE ANÁLISIS DISPONIBLES',
      recommendations: [
        {
          title: 'Análisis Técnico',
          description: 'RSI, MACD, Bandas de Bollinger, Soportes/Resistencias',
          consideration: 'Útil para timing, pero requiere estudio continuo.'
        },
        {
          title: 'Análisis Fundamental',
          description: 'P/E, ROE, Flujo de Caja, Valor Intrínseco',
          consideration: 'Mejor para decisiones a largo plazo.'
        },
        {
          title: 'Análisis de Sentimiento',
          description: 'Noticias, volumen, comportamiento de mercado',
          consideration: 'Complementario, sujeto a sesgos emocionales.'
        }
      ]
    });

    // 3. Rebalanceo
    const lastRebalanceRisk = this._assessRebalanceNeed(investments);
    if (lastRebalanceRisk.recommended) {
      recommendations.push({
        category: '⚖️ GESTIÓN: Rebalanceo de Portafolio',
        recommendations: [
          {
            title: 'Rebalanceo Periódico',
            description: `Cambios detectados: ${lastRebalanceRisk.changes.join(', ')}. Se podría considerar rebalanceo anual.`,
            consideration: 'Mantiene alineación con objetivos de riesgo. Beneficios fiscales potenciales.'
          }
        ]
      });
    }

    // 4. Asignación según perfil
    recommendations.push({
      category: '👤 EDUCACIÓN: Asignación por Perfil de Inversor',
      recommendations: [
        {
          title: 'Conservador',
          description: '60% Renta Fija + 40% Renta Variable. Algunos usan esta como base.',
          consideration: 'Prioriza seguridad sobre crecimiento.'
        },
        {
          title: 'Moderado',
          description: '40% Renta Fija + 60% Renta Variable. Muchos inversionistas siguen este patrón.',
          consideration: 'Balance entre riesgo y retorno.'
        },
        {
          title: 'Agresivo',
          description: '20% Renta Fija + 80% Renta Variable. Para horizontes largos.',
          consideration: 'Mayor volatilidad, potencial retorno superior.'
        }
      ]
    });

    return recommendations;
  }

  /**
   * RESUMEN EJECUTIVO CON DISCLAIMER
   */
  static generateExecutiveSummary(investments, summary, metrics) {
    return {
      disclaimer: this.LEGAL_DISCLAIMER,
      
      summary: {
        portfolioValue: summary.totalValue,
        totalInvested: summary.totalInvested,
        gain: summary.totalValue - summary.totalInvested,
        gainPercentage: summary.totalInvested > 0 
          ? (((summary.totalValue - summary.totalInvested) / summary.totalInvested) * 100)
          : 0,
        investmentCount: investments.length,
      },

      healthScore: this._calculateHealthScore(investments, summary, metrics),
      
      keyMetrics: {
        diversification: this._calculateDiversificationScore(investments),
        concentration: this._assessConcentrationRisk(investments),
        volatility: this._assessVolatilityRisk(investments),
        sharpe: this._calculateSharpeRatio(investments, summary)
      },

      nextSteps: [
        '1. Leer el descargo de responsabilidad anterior',
        '2. Revisar análisis técnico y fundamental',
        '3. Evaluar exposición a riesgos',
        '4. Considerar consultar asesor financiero certificado',
        '5. Tomar decisiones basadas en tu perfil personal'
      ]
    };
  }

  /**
   * MÉTODOS PRIVADOS DE CÁLCULO
   */

  static _calculateSimulatedRSI(momentum) {
    // Simulación: valores entre 0-100
    // 1.0 = neutral (50), > 1.2 = overbought, < 0.8 = oversold
    if (momentum > 1.3) return 75 + Math.random() * 15;
    if (momentum < 0.7) return 25 - Math.random() * 5;
    return 50 + (momentum - 1) * 50;
  }

  static _calculateSimulatedMACD(investment) {
    // Simulación simplificada
    const return_rate = (investment.current_amount_cents - investment.initial_amount_cents) / investment.initial_amount_cents;
    return {
      macd: return_rate,
      signal: return_rate * 0.8,
      histogram: return_rate * 0.2
    };
  }

  static _calculateBollingerBands(investment) {
    const current = investment.current_amount_cents / 100;
    const volatility = Math.abs((investment.current_amount_cents - investment.initial_amount_cents) / investment.initial_amount_cents) * 20;
    return {
      middle: current,
      upper: current + volatility,
      lower: current - volatility
    };
  }

  static _calculateDiversificationScore(investments) {
    if (investments.length === 0) return 0;
    
    const types = new Set(investments.map(i => i.type)).size;
    const sectors = new Set(investments.map(i => i.sector)).size;
    
    // Score: cantidad de tipos + sectores, máximo 10
    const score = Math.min((types * 1.5 + sectors * 0.5), 10);
    return score;
  }

  static _calculateSharpeRatio(investments, summary) {
    if (investments.length === 0) return 0;
    
    const returnRate = summary.totalInvested > 0
      ? (summary.totalValue - summary.totalInvested) / summary.totalInvested
      : 0;
    
    const volatility = this._assessVolatilityRisk(investments).volatility / 100;
    const riskFreeRate = 0.03; // 3% típico
    
    return (returnRate - riskFreeRate) / Math.max(volatility, 0.01);
  }

  static _assessConcentrationRisk(investments) {
    if (investments.length === 0) {
      return { level: 'NONE', percentage: 0 };
    }

    const total = investments.reduce((sum, i) => sum + i.current_amount_cents, 0);
    const largest = Math.max(...investments.map(i => i.current_amount_cents));
    const percentage = (largest / total) * 100;
    const topAsset = investments.find(i => i.current_amount_cents === largest)?.name || 'Unknown';

    return {
      level: percentage > 50 ? 'HIGH' : percentage > 30 ? 'MEDIUM' : 'LOW',
      percentage,
      topAsset
    };
  }

  static _assessVolatilityRisk(investments) {
    if (investments.length === 0) {
      return { level: 'NONE', volatility: 0, assessment: 'Sin datos' };
    }

    const volatilities = investments.map(i => {
      const returnPct = Math.abs((i.current_amount_cents - i.initial_amount_cents) / i.initial_amount_cents);
      return returnPct;
    });

    const avgVolatility = (volatilities.reduce((a, b) => a + b, 0) / volatilities.length) * 100;

    return {
      level: avgVolatility > 30 ? 'HIGH' : avgVolatility > 15 ? 'MEDIUM' : 'LOW',
      volatility: avgVolatility,
      assessment: avgVolatility > 30 
        ? 'Volatilidad alta: fluctuaciones significativas esperadas'
        : avgVolatility > 15
        ? 'Volatilidad moderada: fluctuaciones normales'
        : 'Volatilidad baja: estable'
    };
  }

  static _assessLiquidityRisk(investments) {
    const highLiquidity = investments.filter(i => 
      i.type === 'acciones' || i.type === 'ETF' || i.type === 'cripto'
    ).length;

    const level = highLiquidity / investments.length > 0.7 ? 'LOW' : 'MEDIUM';

    return {
      level,
      assessment: highLiquidity / investments.length > 0.7 
        ? 'Buena liquidez en portafolio'
        : 'Liquidez variable',
      detail: `${highLiquidity} de ${investments.length} activos son fácilmente convertibles.`
    };
  }

  static _assessRebalanceNeed(investments) {
    // Simulación: detectar si hay drift significativo
    const changes = [];
    
    investments.forEach(inv => {
      const change = Math.abs((inv.current_amount_cents - inv.initial_amount_cents) / inv.initial_amount_cents);
      if (change > 0.3) {
        changes.push(`${inv.name}: ${(change * 100).toFixed(0)}% cambio`);
      }
    });

    return {
      recommended: changes.length > 0,
      changes
    };
  }

  static _calculateHealthScore(investments, summary, metrics) {
    let score = 50;

    // Diversificación
    const diversity = this._calculateDiversificationScore(investments);
    score += Math.min(15, (diversity / 10) * 15);

    // Rendimiento
    const returnRate = summary.totalInvested > 0 
      ? (((summary.totalValue - summary.totalInvested) / summary.totalInvested) * 100)
      : -50;
    if (returnRate > 0) score += Math.min(20, returnRate / 5);

    // Riesgo
    const concentration = this._assessConcentrationRisk(investments);
    if (concentration.percentage > 50) score -= 20;
    else if (concentration.percentage > 30) score -= 10;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = FinancialAIService;
