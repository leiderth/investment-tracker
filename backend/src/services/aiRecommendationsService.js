// backend/src/services/aiRecommendationsService.js

/**
 * AI-powered investment recommendations based on portfolio analysis
 * Este servicio proporciona recomendaciones inteligentes basadas en datos del portafolio
 */

class AIRecommendationsService {
  /**
   * Analizar portafolio y generar recomendaciones
   */
  static analyzePortfolio(investments, metrics) {
    const recommendations = [];
    
    // Si no hay inversiones, retornar recomendación básica
    if (!investments || investments.length === 0) {
      return [{
        type: 'strategy',
        severity: 'high',
        title: 'Comenzar a Invertir',
        description: 'Aún no tienes inversiones registradas. ¡Es tiempo de comenzar!',
        action: 'Agrega tu primera inversión',
        impact: 'Comienza tu camino hacia la riqueza',
      }];
    }
    
    // Análisis 1: Diversificación
    if (metrics.diversificationScore < 5) {
      recommendations.push({
        type: 'diversification',
        severity: 'high',
        title: 'Mejorar Diversificación',
        description: 'Tu portafolio tiene baja diversificación (score ' + metrics.diversificationScore.toFixed(1) + '/10). Se recomienda invertir en más categorías de activos.',
        action: 'Considera agregar inversiones en diferentes sectores',
        impact: 'Reduce riesgo de concentración',
      });
    } else if (metrics.diversificationScore > 7) {
      recommendations.push({
        type: 'diversification',
        severity: 'low',
        title: 'Excelente Diversificación',
        description: 'Tu portafolio tiene buena diversificación (score ' + metrics.diversificationScore.toFixed(1) + '/10).',
        action: 'Mantén este nivel de diversificación',
        impact: 'Riesgo controlado',
      });
    }

    // Análisis 2: Concentración de Riesgo
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    if (totalValue === 0) {
      return recommendations.length > 0 ? recommendations : [{
        type: 'strategy',
        severity: 'medium',
        title: 'Inversiones sin valor',
        description: 'Tus inversiones tienen valor total de 0. Verifica los datos.',
        action: 'Actualiza los valores de tus inversiones',
        impact: 'Obtén recomendaciones precisas',
      }];
    }
    
    const highRiskInvs = investments.filter(inv => inv.riskLevel === 'alto');
    const highRiskPercentage = (highRiskInvs.reduce((sum, inv) => sum + inv.currentValue, 0) / totalValue) * 100;

    if (highRiskPercentage > 50) {
      recommendations.push({
        type: 'risk',
        severity: 'high',
        title: 'Exposición al Riesgo Muy Alta',
        description: `Tu portafolio tiene ${highRiskPercentage.toFixed(1)}% en inversiones de alto riesgo. Esto puede ser peligroso.`,
        action: 'Considera diversificar hacia inversiones de menor riesgo',
        impact: 'Protege tu capital',
      });
    } else if (highRiskPercentage > 30) {
      recommendations.push({
        type: 'risk',
        severity: 'medium',
        title: 'Exposición al Riesgo Moderada',
        description: `Tu portafolio tiene ${highRiskPercentage.toFixed(1)}% en inversiones de alto riesgo. Considéralo según tu perfil de inversión.`,
        action: 'Monitorea estas inversiones regularmente',
        impact: 'Mantente informado de cambios de mercado',
      });
    }

    // Análisis 3: Rendimiento Bajo
    const lowReturnInvs = investments.filter(inv => {
      const gain = inv.currentValue - inv.amountInvested;
      const gainPercent = (gain / inv.amountInvested) * 100;
      return gainPercent < -10;
    });

    if (lowReturnInvs.length > 0) {
      recommendations.push({
        type: 'performance',
        severity: 'medium',
        title: 'Inversiones con Bajo Desempeño',
        description: `Tienes ${lowReturnInvs.length} inversión(es) con pérdidas superiores al 10%. Considera si es tiempo de rebalancear o salir.`,
        action: 'Revisa el análisis fundamental de estas inversiones',
        impact: 'Protege ganancias en otras áreas',
      });
    }

    // Análisis 4: Saldo de Efectivo
    const avgInvValue = totalValue / investments.length;
    
    if (investments.length > 0 && investments.length < 3) {
      recommendations.push({
        type: 'strategy',
        severity: 'medium',
        title: 'Portfolio Muy Pequeño',
        description: 'Tienes menos de 3 inversiones. Un portafolio más grande permite mejor diversificación.',
        action: 'Considera agregar 2-3 inversiones más en diferentes sectores',
        impact: 'Reduce riesgo sistemático',
      });
    }

    // Análisis 5: Oportunidad de Rebalanceo
    const byType = {};
    investments.forEach(inv => {
      byType[inv.type] = (byType[inv.type] || 0) + inv.currentValue;
    });

    const typePercentages = Object.entries(byType).map(([type, value]) => ({
      type,
      percentage: (value / totalValue) * 100,
    }));

    const maxType = typePercentages.reduce((max, curr) => 
      curr.percentage > max.percentage ? curr : max
    );

    if (maxType.percentage > 60) {
      recommendations.push({
        type: 'rebalancing',
        severity: 'high',
        title: 'Se Recomienda Rebalanceo',
        description: `${maxType.type} representa ${maxType.percentage.toFixed(1)}% de tu portafolio. Está muy concentrado.`,
        action: 'Transfiere fondos hacia otras categorías para equilibrar',
        impact: 'Mejora diversificación y reduce riesgo',
      });
    }

    return recommendations;
  }

  /**
   * Generar insights personalizados
   */
  static generateInsights(investments, summary, metrics) {
    const insights = [];
    const totalReturn = summary.totalValue > 0 ? 
      (((summary.totalValue - summary.totalInvested) / summary.totalInvested) * 100) : 0;

    // Insight 1: Rendimiento General
    if (totalReturn > 20) {
      insights.push({
        icon: '📈',
        title: 'Excelente Rendimiento',
        text: `Tu portafolio ha generado un retorno de ${totalReturn.toFixed(2)}%. ¡Felicitaciones!`,
      });
    } else if (totalReturn > 0) {
      insights.push({
        icon: '✅',
        title: 'Rendimiento Positivo',
        text: `Tu portafolio está en ganancias con un retorno de ${totalReturn.toFixed(2)}%. Buen trabajo.`,
      });
    } else if (totalReturn > -10) {
      insights.push({
        icon: '⚠️',
        title: 'Mercado Desafiante',
        text: `Tu portafolio tiene una pequeña pérdida de ${Math.abs(totalReturn).toFixed(2)}%. Es normal en mercados volátiles.`,
      });
    } else {
      insights.push({
        icon: '🛑',
        title: 'Pérdida Significativa',
        text: `Tu portafolio ha bajado ${Math.abs(totalReturn).toFixed(2)}%. Considera revisar tu estrategia.`,
      });
    }

    // Insight 2: Oportunidad de Diversificación
    if (metrics.diversificationScore < 7) {
      insights.push({
        icon: '🎯',
        title: 'Oportunidad de Diversificación',
        text: 'Agregar inversiones en nuevos sectores podría mejorar tu perfil de riesgo.',
      });
    }

    // Insight 3: Crecimiento del Portafolio
    if (investments.length > 0) {
      const avgReturn = investments.reduce((sum, inv) => {
        const ret = ((inv.currentValue - inv.amountInvested) / inv.amountInvested) * 100;
        return sum + ret;
      }, 0) / investments.length;

      if (avgReturn > 15) {
        insights.push({
          icon: '💰',
          title: 'Portafolio en Crecimiento',
          text: `El retorno promedio de tus inversiones es ${avgReturn.toFixed(2)}%. Sigue este ritmo.`,
        });
      }
    }

    return insights;
  }

  /**
   * Calcular score de salud del portafolio (0-100)
   */
  static calculateHealthScore(investments, metrics, summary) {
    // Si no hay inversiones, retornar score bajo
    if (!investments || investments.length === 0 || summary.totalValue === 0) {
      return 25;
    }
    
    let score = 50; // Base

    // +15 por buena diversificación
    score += Math.min(15, (metrics.diversificationScore / 10) * 15);

    // +20 por rendimiento positivo
    const totalReturn = summary.totalInvested > 0 ? 
      (((summary.totalValue - summary.totalInvested) / summary.totalInvested) * 100) : -50;
    
    if (totalReturn > 0) {
      score += Math.min(20, totalReturn / 5);
    }

    // +10 por tener múltiples inversiones
    if (investments.length >= 5) {
      score += 10;
    } else if (investments.length >= 3) {
      score += 5;
    }

    // -10 por concentración de riesgo
    const highRiskPercentage = (investments
      .filter(inv => inv.riskLevel === 'alto')
      .reduce((sum, inv) => sum + inv.currentValue, 0) / 
      summary.totalValue) * 100;
    
    if (highRiskPercentage > 50) {
      score -= 20;
    } else if (highRiskPercentage > 30) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generar sugerencias de acciones específicas
   */
  static generateActionItems(investments, metrics, summary) {
    const actions = [];

    // Acción 1: Si no hay suficientes inversiones
    if (investments.length < 3) {
      actions.push({
        priority: 'high',
        action: 'Agregar inversiones',
        target: 'At least 5 investments',
        timeline: 'This month',
      });
    }

    // Acción 2: Si el rebalanceo es necesario
    const byType = {};
    investments.forEach(inv => {
      byType[inv.type] = (byType[inv.type] || 0) + inv.currentValue;
    });

    const totalValue = summary.totalValue;
    const imbalancedTypes = Object.entries(byType)
      .filter(([, value]) => (value / totalValue) > 0.5)
      .map(([type]) => type);

    if (imbalancedTypes.length > 0) {
      actions.push({
        priority: 'high',
        action: 'Rebalancear portafolio',
        target: `Reduce ${imbalancedTypes.join(', ')}`,
        timeline: 'Next 2 weeks',
      });
    }

    // Acción 3: Si hay inversiones perdiendo mucho valor
    const losingInvs = investments.filter(inv => {
      const loss = (inv.currentValue - inv.amountInvested) / inv.amountInvested * 100;
      return loss < -15;
    });

    if (losingInvs.length > 0) {
      actions.push({
        priority: 'medium',
        action: 'Revisar inversiones con pérdidas',
        target: losingInvs.map(inv => inv.name).join(', '),
        timeline: 'This week',
      });
    }

    return actions;
  }
}

module.exports = AIRecommendationsService;
