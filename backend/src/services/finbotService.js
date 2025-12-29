/**
 * FinanceGPT - Asistente Conversacional Especializado en Finanzas
 * Personalidad: Claude-like, empático, educativo, natural
 * Enfoque: 100% finanzas con conversaciones fluidas y memoria contextual
 */

class FinanceGPT {
  constructor() {
    this.PERSONALITY = {
      name: 'FinanceGPT',
      description: 'Asistente de investTracker especializado en finanzas',
      style: 'Claude-like - Conversacional, empático, natural',
      traits: ['Empático', 'Educativo', 'Conversacional', 'Curioso', 'Protector']
    };

    this.QUERY_TYPES = {
      EDUCATIONAL: 'educativa',
      ANALYTICAL: 'analítica',
      ADVISORY: 'asesoría',
      COMPARATIVE: 'comparativa',
      URGENT: 'urgente',
      CONVERSATIONAL: 'conversacional'
    };

    this.KNOWLEDGE_LEVELS = {
      BEGINNER: 'principiante',
      INTERMEDIATE: 'intermedio',
      ADVANCED: 'avanzado',
      EXPERT: 'experto'
    };

    this.EMOTIONAL_STATES = {
      ANXIOUS: 'ansioso',
      POSITIVE: 'positivo',
      CONFUSED: 'confundido',
      FRUSTRATED: 'frustrado',
      ENTHUSIASTIC: 'entusiasta'
    };

    this.KEYWORDS = {
      education: ['qué es', 'cómo funciona', 'explicar', 'concepto', 'definición', 'aprender', 'entender', 'me enseñas'],
      analysis: ['análisis', 'mercado', 'hoy', 'caída', 'subida', 'rendimiento', 'precio', 'está bajando', 'está subiendo'],
      advisory: ['debería', 'qué hago', 'recomendación', 'opción', 'decisión', 'empezar', 'cómo empiezo'],
      comparison: ['vs', 'versus', 'comparar', 'diferencia', 'cuál es mejor', 'ventajas'],
      urgent: ['caída', 'crash', 'pánico', 'urgente', 'ayuda', 'ahora', 'perdí', 'crisis'],
      anxiety: ['miedo', 'preocupado', 'ansioso', 'nervioso', 'perder', 'riesgo', 'asustado', 'pánico'],
      confusion: ['no entiendo', 'confundido', 'complejo', 'difícil', 'no sé', 'confunde'],
      frustration: ['cansado', 'fastidio', 'no funciona', 'decepción', 'malas experiencias'],
      enthusiasm: ['emocionado', 'interesado', 'genial', 'excelente', 'quiero', 'ánimo']
    };

    this.FINANCIAL_TOPICS = {
      'análisis técnico': ['indicadores', 'patrones', 'gráficos', 'soportes', 'resistencias', 'tendencias'],
      'análisis fundamental': ['estados financieros', 'ratios', 'valoración', 'earnings', 'flujos de caja'],
      'inversiones': ['acciones', 'etfs', 'bonos', 'fondos', 'criptos', 'inmuebles'],
      'gestión de portafolio': ['diversificación', 'rebalanceo', 'asignación', 'riesgo'],
      'educación financiera': ['interés compuesto', 'inflación', 'impuestos', 'presupuesto'],
      'mercados': ['mercado global', 'economía', 'Fed', 'tasas', 'volatilidad']
    };
  }

  /**
   * Analiza mensaje del usuario
   */
  analyzeUserMessage(message, conversationHistory = [], userProfile = {}) {
    const lowerMessage = message.toLowerCase();

    return {
      queryType: this.detectQueryType(lowerMessage),
      knowledgeLevel: this.estimateKnowledgeLevel(lowerMessage, conversationHistory),
      emotionalState: this.detectEmotionalState(lowerMessage),
      complexity: this.assessComplexity(message),
      context: this.extractContext(message, conversationHistory, userProfile),
      followUp: this.isFollowUp(conversationHistory, lowerMessage),
      isFirstMessage: conversationHistory.length === 0
    };
  }

  detectQueryType(message) {
    if (this.matchesKeywords(message, this.KEYWORDS.education)) return this.QUERY_TYPES.EDUCATIONAL;
    if (this.matchesKeywords(message, this.KEYWORDS.analysis)) return this.QUERY_TYPES.ANALYTICAL;
    if (this.matchesKeywords(message, this.KEYWORDS.comparison)) return this.QUERY_TYPES.COMPARATIVE;
    if (this.matchesKeywords(message, this.KEYWORDS.urgent)) return this.QUERY_TYPES.URGENT;
    if (this.matchesKeywords(message, this.KEYWORDS.advisory)) return this.QUERY_TYPES.ADVISORY;
    return this.QUERY_TYPES.CONVERSATIONAL;
  }

  estimateKnowledgeLevel(message, conversationHistory) {
    const expertTerms = ['yield curve', 'duration', 'beta', 'alpha', 'correlación', 'volatilidad implícita', 'sharpe', 'capm'];
    if (expertTerms.some(term => message.includes(term))) return this.KNOWLEDGE_LEVELS.EXPERT;

    const advancedTerms = ['etf', 'índice', 'dividend', 'volatilidad', 'diversificación', 'drawdown', 'backtest'];
    if (advancedTerms.some(term => message.includes(term))) return this.KNOWLEDGE_LEVELS.ADVANCED;

    const beginnerTerms = ['qué es', 'nunca he', 'no sé', 'principiante', 'desde cero', 'por primera vez'];
    if (beginnerTerms.some(term => message.includes(term))) return this.KNOWLEDGE_LEVELS.BEGINNER;

    // Si hay historial, usa contexto anterior
    if (conversationHistory.length > 0) {
      return userProfile.knowledgeLevel || this.KNOWLEDGE_LEVELS.INTERMEDIATE;
    }

    return this.KNOWLEDGE_LEVELS.INTERMEDIATE;
  }

  detectEmotionalState(message) {
    if (this.matchesKeywords(message, this.KEYWORDS.anxiety)) return this.EMOTIONAL_STATES.ANXIOUS;
    if (this.matchesKeywords(message, this.KEYWORDS.confusion)) return this.EMOTIONAL_STATES.CONFUSED;
    if (this.matchesKeywords(message, this.KEYWORDS.frustration)) return this.EMOTIONAL_STATES.FRUSTRATED;
    if (this.matchesKeywords(message, this.KEYWORDS.enthusiasm)) return this.EMOTIONAL_STATES.ENTHUSIASTIC;
    return this.EMOTIONAL_STATES.POSITIVE;
  }

  assessComplexity(message) {
    const wordCount = message.split(' ').length;
    const questions = (message.match(/\?/g) || []).length;
    const technicalTerms = (message.match(/\b(análisis|volatilidad|derivados|correlación|rebalanceo)\b/gi) || []).length;

    if (wordCount > 50 || questions > 2 || technicalTerms > 2) return 'alta';
    if (wordCount > 20 || questions > 1) return 'media';
    return 'simple';
  }

  extractContext(message, conversationHistory, userProfile) {
    return {
      timeframe: this.extractTimeframe(message),
      mentionedAssets: this.extractAssets(message),
      topics: this.extractTopics(message),
      objectives: userProfile.objectives || [],
      riskTolerance: userProfile.riskTolerance || null,
      previousContext: this.getPreviousContext(conversationHistory)
    };
  }

  extractTimeframe(message) {
    const patterns = {
      'corto plazo': /\b(días|semanas|meses|próximo año|1-2 años)\b/gi,
      'mediano plazo': /\b(2-5 años|próximos años)\b/gi,
      'largo plazo': /\b(5\+ años|jubilación|20-30 años|retiro)\b/gi
    };

    for (const [timeframe, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) return timeframe;
    }
    return null;
  }

  extractAssets(message) {
    const assetKeywords = {
      'acciones': /\b(acciones?|stocks?)\b/gi,
      'etfs': /\b(etfs?|fondos cotizados)\b/gi,
      'bonos': /\b(bonos?|bonds?)\b/gi,
      'criptos': /\b(crypto|bitcoin|ethereum|criptomonedas?)\b/gi,
      'fondos': /\b(fondos?|mutual funds?)\b/gi,
      'inmuebles': /\b(propiedades?|inmuebles?|real estate)\b/gi
    };

    const found = {};
    for (const [asset, pattern] of Object.entries(assetKeywords)) {
      if (pattern.test(message)) found[asset] = true;
    }
    return Object.keys(found);
  }

  extractTopics(message) {
    const found = {};
    for (const [topic, keywords] of Object.entries(this.FINANCIAL_TOPICS)) {
      if (keywords.some(kw => message.toLowerCase().includes(kw))) {
        found[topic] = true;
      }
    }
    return Object.keys(found);
  }

  getPreviousContext(conversationHistory) {
    if (conversationHistory.length === 0) return null;
    const userMessages = conversationHistory.filter(msg => msg.role === 'user').slice(-2).map(msg => msg.content);
    return { recentTopics: userMessages, messageCount: conversationHistory.length };
  }

  isFollowUp(conversationHistory, message) {
    if (conversationHistory.length === 0) return false;
    const followUpIndicators = ['sí', 'no', 'ok', 'claro', 'entiendo', 'gracias', 'pero', 'y si', 'también'];
    return followUpIndicators.some(indicator => message.includes(indicator));
  }

  matchesKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword.toLowerCase()));
  }

  /**
   * GENERADOR PRINCIPAL DE RESPUESTAS
   */
  generateResponse(userMessage, analysis, conversationHistory = [], userProfile = {}) {
    const { emotionalState, queryType, knowledgeLevel, isFirstMessage } = analysis;

    let response = '';

    // Prioriza por estado emocional primero
    if (emotionalState === this.EMOTIONAL_STATES.ANXIOUS) {
      response = this.respondToAnxiety(userMessage, analysis);
    } else if (emotionalState === this.EMOTIONAL_STATES.CONFUSED) {
      response = this.respondToConfusion(userMessage, analysis);
    } else if (queryType === this.QUERY_TYPES.URGENT) {
      response = this.respondToUrgency(userMessage, analysis);
    } else if (queryType === this.QUERY_TYPES.EDUCATIONAL) {
      response = this.respondToEducation(userMessage, analysis);
    } else if (queryType === this.QUERY_TYPES.ANALYTICAL) {
      response = this.respondToAnalysis(userMessage, analysis);
    } else if (queryType === this.QUERY_TYPES.ADVISORY) {
      response = this.respondToAdvisory(userMessage, analysis);
    } else if (queryType === this.QUERY_TYPES.COMPARATIVE) {
      response = this.respondToComparison(userMessage, analysis);
    } else {
      response = this.respondConversationally(userMessage, analysis);
    }

    // Agrega descargo legal si es primer mensaje
    if (isFirstMessage && !response.includes('⚠️')) {
      response = this.addInitialDisclaimer(response);
    }

    return {
      message: response,
      analysis: analysis,
      disclaimer: this.getDisclaimer(queryType),
      suggestedQuestions: this.generateSuggestedQuestions(analysis),
      suggestedQuestions: this.generateSuggestedQuestions(analysis)
    };
  }

  /**
   * Respuesta empática para usuarios ansiosos
   */
  respondToAnxiety(message, analysis) {
    const responses = [
      "Entiendo perfectamente. Ver números rojos es estresante, pero respira 😊. Antes que nada, déjame entender mejor tu situación...",
      "Es completamente normal estar preocupado. He visto esto cientos de veces, y generalmente las cosas son menos graves de lo que parecen en el momento...",
      "Sé que esto te asusta, y eso es válido. La clave aquí es pensar a largo plazo. Cuéntame un poco más..."
    ];

    let opening = responses[Math.floor(Math.random() * responses.length)];

    // Proporciona contexto histórico si es sobre caídas
    if (message.includes('caída') || message.includes('pérdida')) {
      opening += " El mercado ha tenido caídas similares muchas veces, y SIEMPRE se ha recuperado. Esto es normal.";
    }

    opening += "\n\n¿Puedo hacerte una pregunta? ¿Este dinero lo necesitas en los próximos meses, o es una inversión a más largo plazo? Eso cambiaría completamente mi recomendación.";

    return opening;
  }

  /**
   * Respuesta para usuario confundido
   */
  respondToConfusion(message, analysis) {
    const response = "Totalmente normal que esto confunda. Déjame hacerlo más claro.\n\n";
    
    // Usa analogías basadas en el tema
    if (analysis.context.topics.length > 0) {
      return response + this.explainWithAnalogy(analysis.context.topics[0]);
    }

    return response + "¿Cuál es la parte específica que más te confunde? Así me enfoco exactamente ahí.";
  }

  /**
   * Respuesta para situaciones urgentes
   */
  respondToUrgency(message, analysis) {
    let response = "🛑 Entiendo que esto sea urgente. Primero, respira.\n\n";

    response += "La pregunta más importante ahora es: **¿Es dinero que necesitas en los próximos 6-12 meses?**\n\n";

    response += "Si es **largo plazo** (5+ años):\n";
    response += "• Las caídas son temporales. El mercado siempre se recupera\n";
    response += "• Vender en pánico es la peor decisión que podrías tomar\n";
    response += "• De hecho, esto es una oportunidad de comprar a precios bajos\n\n";

    response += "Si es **corto plazo**:\n";
    response += "• Probablemente no deberías estar en activos volátiles\n";
    response += "• Necesitamos revisar tu estrategia\n\n";

    response += "¿Cuál es tu situación?";

    return response;
  }

  /**
   * Respuesta educativa
   */
  respondToEducation(message, analysis) {
    const { knowledgeLevel, context } = analysis;

    if (knowledgeLevel === this.KNOWLEDGE_LEVELS.BEGINNER) {
      return this.explainForBeginner(message, context);
    } else if (knowledgeLevel === this.KNOWLEDGE_LEVELS.ADVANCED || knowledgeLevel === this.KNOWLEDGE_LEVELS.EXPERT) {
      return this.explainForAdvanced(message, context);
    } else {
      return this.explainForIntermediate(message, context);
    }
  }

  explainForBeginner(message, context) {
    let topic = context.topics[0] || 'inversión';
    let response = "Excelente pregunta. Te lo explico de forma muy simple:\n\n";

    const analogies = {
      'diversificación': "Imagina que tienes 10 huevos. Podrías ponerlos todos en una canasta (riesgoso), o distribuirlos en 5 canastas con 2 huevos cada una. Si una canasta se cae, no pierdes todo. Eso es diversificación.",
      'inversión': "Invertir es como plantar un árbol. Lo plantaste, lo riegas, lo cuidas, y con el tiempo crece y da frutos. No esperas frutos mañana, esperas que a largo plazo crezca.",
      'volatilidad': "La volatilidad es cuánto sube y baja el precio. Baja volatilidad = cambios pequeños (como un tren lento). Alta volatilidad = cambios grandes (como una montaña rusa).",
      'interés compuesto': "Es el efecto bola de nieve. Comienzas con $1. Genera 10% (ahora tienes $1.10). El próximo año, ese $1.10 genera 10% (ahora $1.21). No es mucho al principio, pero después de 30 años... 🤯"
    };

    response += analogies[topic] || "Aquí está lo básico que necesitas saber...";

    response += "\n\n¿Tiene sentido? ¿Hay algo que quieras que profundice?";

    return response;
  }

  explainForAdvanced(message, context) {
    let response = "Sí, es un tema interesante técnicamente.\n\n";
    let topic = context.topics[0] || 'mercado';

    const technicalExplanations = {
      'análisis técnico': "Desde perspectiva técnica, hablamos de patrones de velas, niveles de soporte/resistencia, y confirmación con volumen. Los indicadores como RSI, MACD pueden ayudarte a identificar divergencias.",
      'análisis fundamental': "Los ratios clave: P/E (valoración), PEG (crecimiento), EV/EBITDA (por empresa). Un análisis sólido requiere revisar los últimos 5 años de estados financieros.",
      'volatilidad': "La volatilidad se mide como standard deviation de retornos. La volatilidad implícita en opciones puede darte pistas sobre expectativas del mercado."
    };

    response += technicalExplanations[topic] || "Desde la perspectiva técnica...";

    response += "\n\n¿Qué específicamente te interesa explorar aquí?";

    return response;
  }

  explainForIntermediate(message, context) {
    let response = "Buena pregunta. Esto es lo que necesitas saber:\n\n";

    const explanations = {
      'diversificación': "Distribuir tu dinero entre diferentes tipos de activos (acciones, bonos, efectivo) para reducir riesgo. No pones todo en una sola cosa.",
      'inversión': "Poner tu dinero en activos (acciones, bonos, ETFs, propiedades) que esperas que crezcan con el tiempo.",
      'rendimiento': "El retorno que obtienes. Si invertiste $1000 y ahora tienes $1100, tu rendimiento fue 10%.",
      'riesgo': "La posibilidad de perder dinero. Más riesgo = potencial de más rendimiento, pero también de perder más."
    };

    let topic = context.topics[0] || 'inversión';
    response += explanations[topic] || "Aquí está el contexto...";

    response += "\n\n¿Quieres que profundice en algo específico?";

    return response;
  }

  /**
   * Respuesta analítica
   */
  respondToAnalysis(message, analysis) {
    let response = "Aquí está mi análisis:\n\n";

    response += "📊 **Lo que está pasando:**\n";
    response += "Los mercados están reflejando cambios en las expectativas económicas. Esto es normal.\n\n";

    response += "**¿Por qué importa?**\n";
    response += "Si tienes inversiones a largo plazo, esto es ruido. Si tienes dinero que necesitas pronto, debería importarte más.\n\n";

    response += "**¿Qué podrías hacer?**\n";
    response += "1. Si es largo plazo, no hagas nada. Mantén tu estrategia\n";
    response += "2. Si es corto plazo, considera rebalancear hacia activos más seguros\n";
    response += "3. Usa esto como oportunidad para comprar a buenos precios\n\n";

    response += "¿Cuál es tu horizonte de tiempo?";

    return response;
  }

  /**
   * Respuesta de asesoría
   */
  respondToAdvisory(message, analysis) {
    let response = "Esta es una pregunta importante. Para aconsejarte bien, necesito entender tu situación:\n\n";

    response += "1. ¿Cuándo necesitarías acceso a este dinero? (plazo es TODO)\n";
    response += "2. ¿Cómo te sentirías si tu inversión baja 20% temporalmente?\n";
    response += "3. ¿Tienes otras deudas o compromisos financieros?\n\n";

    response += "No hay respuestas correctas o incorrectas. Solo quiero entender tu situación para ayudarte 😊";

    return response;
  }

  /**
   * Respuesta comparativa
   */
  respondToComparison(message, analysis) {
    const assets = analysis.context.mentionedAssets;

    if (assets.includes('acciones') && assets.includes('etfs')) {
      return this.compareStocksVsETFs();
    } else if (assets.includes('bonos') && assets.includes('acciones')) {
      return this.compareBondsVsStocks();
    } else {
      return "Excelente pregunta. Estos no son opuestos, sino herramientas diferentes para diferentes objetivos. Cuéntame qué buscas lograr y te ayudo a elegir.";
    }
  }

  compareStocksVsETFs() {
    let response = "Excelente pregunta. No son opuestos, sino herramientas diferentes:\n\n";

    response += "**Acciones Individuales 📈**\n";
    response += "✓ Control total sobre lo que compras\n";
    response += "✓ Potencial de rendimiento mayor si eliges bien\n";
    response += "✗ Requiere investigación\n";
    response += "✗ Riesgo mayor si te enfocas en pocos nombres\n\n";

    response += "**ETFs 🎯**\n";
    response += "✓ Diversificación automática\n";
    response += "✓ Comisiones bajas\n";
    response += "✓ Perfecto si no tienes tiempo para investigar\n";
    response += "✗ Menos control (sigues el índice)\n\n";

    response += "Mi perspectiva: Para la mayoría, ETFs son la mejor opción. Es diversificación automática sin esfuerzo.\n\n";

    response += "¿Tienes tiempo y conocimiento para investigar empresas, o prefieres simplicidad?";

    return response;
  }

  compareBondsVsStocks() {
    let response = "Buena pregunta. Es una decisión fundamental sobre riesgo/seguridad:\n\n";

    response += "**Acciones 📈**\n";
    response += "• Mayor potencial de crecimiento\n";
    response += "• Mayor volatilidad\n";
    response += "• Mejor para largo plazo\n\n";

    response += "**Bonos 🛡️**\n";
    response += "• Más predecibles y seguros\n";
    response += "• Menos volatilidad\n";
    response += "• Mejor para cuando necesitas dinero pronto\n\n";

    response += "Lo ideal es mezclar ambos. La mezcla depende de tu edad y horizonte de tiempo.\n\n";

    response += "¿Cuánto tiempo planeas invertir este dinero?";

    return response;
  }

  /**
   * Respuesta conversacional
   */
  respondConversationally(message, analysis) {
    const responses = [
      "Eso es una perspectiva interesante. ¿Qué te llevó a pensar en esto?",
      "Completo. Ahora bien, algo relacionado que muchos no consideran es...",
      "Entiendo tu punto. Déjame ofrecerte una perspectiva que podrías no haber considerado...",
      "Excelente curiosidad. Cuéntame más sobre lo que estás pensando...",
      "Interesante punto. ¿Y cómo impactaría eso en tu situación específica?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Añade disclaimer inicial natural
   */
  addInitialDisclaimer(response) {
    const disclaimer = "\n\n---\n\n⚠️ Antes que nada: Todo lo que comparto es información educativa, no asesoramiento financiero personalizado. Las decisiones de inversión son 100% tu responsabilidad. Para decisiones importantes, siempre consulta con un asesor certificado.\n\n---\n\n";

    return response + disclaimer;
  }

  /**
   * Disclaimer contextual
   */
  getDisclaimer(queryType) {
    if (queryType === this.QUERY_TYPES.ADVISORY) {
      return "⚠️ Esto es análisis educativo. No es una recomendación personalizada. Consulta un asesor certificado antes de decisiones importantes.";
    }
    return "💡 Información educativa. Las decisiones de inversión son tu responsabilidad.";
  }

  /**
   * Genera preguntas sugeridas
   */
  generateSuggestedQuestions(analysis) {
    const { queryType, context } = analysis;
    const suggestions = [];

    if (queryType === this.QUERY_TYPES.EDUCATIONAL) {
      suggestions.push("¿Cómo empiezo con esto?", "¿Cuál es el riesgo?");
    } else if (queryType === this.QUERY_TYPES.ADVISORY) {
      suggestions.push("¿Cuáles son los riesgos?", "Cuéntame más tu situación");
    } else if (queryType === this.QUERY_TYPES.URGENT) {
      suggestions.push("¿Esto ha pasado antes?", "¿Qué debería hacer?");
    } else {
      suggestions.push("¿Tienes más dudas?", "Cuéntame tu situación financiera");
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Explicación con analogías
   */
  explainWithAnalogy(topic) {
    const analogies = {
      'diversificación': "**Diversificación** es como no confiar todo tu negocio a un solo cliente. Si ese cliente se va, tienes otros. Así con inversiones: no pones todo en una empresa.",
      'inversión': "**Invertir** es como ser propietario de un negocio. Al principio cuesta trabajo, pero con el tiempo genera ingresos sin que hagas nada.",
      'volatilidad': "**Volatilidad** es la montaña rusa vs. el tren. Ambos llegan al destino, pero uno es suave y otro tiene altibajos.",
      'interés compuesto': "**Interés compuesto** es el efecto bola de nieve. Empieza pequeño, pero después de 20-30 años... es enorme."
    };

    return analogies[topic] || "Déjame usar una comparación simple...";
  }

  /**
   * Actualiza perfil del usuario
   */
  updateUserProfile(existingProfile, analysis) {
    const updated = { ...existingProfile };

    if (analysis.knowledgeLevel && analysis.knowledgeLevel !== existingProfile.knowledgeLevel) {
      updated.knowledgeLevel = analysis.knowledgeLevel;
    }

    if (analysis.context.timeframe) {
      updated.timeframe = analysis.context.timeframe;
    }

    if (analysis.context.mentionedAssets.length > 0) {
      updated.interestedAssets = [...new Set([...(updated.interestedAssets || []), ...analysis.context.mentionedAssets])];
    }

    updated.lastEmotionalState = analysis.emotionalState;
    updated.lastUpdated = new Date();

    return updated;
  }
}

module.exports = new FinanceGPT();
