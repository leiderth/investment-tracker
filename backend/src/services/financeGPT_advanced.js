/**
 * FinanceGPT Advanced - Asistente Inteligente Especializado en Finanzas
 * Arquitectura Profesional Avanzada - Nivel Claude
 * 
 * Características:
 * - Análisis contextual profundo y multi-turno
 * - Sistema de perfil de usuario inteligente
 * - Respuestas estructuradas profesionales
 * - Inferencia de necesidades latentes
 * - Pensamiento crítico integrado
 * - Simulación de datos de mercado
 * - Versatilidad conversacional
 */

class FinanceGPTAdvanced {
  constructor() {
    // Perfil de personalidad mejorado
    this.PERSONALITY = {
      name: 'FinanceGPT',
      style: 'Claude Advanced - Experto, empático, versátil, inteligente',
      traits: ['Analítico', 'Empático', 'Versátil', 'Crítico', 'Educativo', 'Honesto']
    };

    // Tipos de consulta expandidos
    this.QUERY_TYPES = {
      EDUCATIONAL: 'educativa',
      ANALYTICAL: 'analítica',
      ADVISORY: 'asesoría',
      COMPARATIVE: 'comparativa',
      STRATEGIC: 'estratégica',
      EMOTIONAL: 'emocional',
      DIAGNOSTIC: 'diagnóstica',
      SPECULATIVE: 'especulativa',
      PHILOSOPHICAL: 'filosófica'
    };

    // Niveles de conocimiento expandidos
    this.KNOWLEDGE_LEVELS = {
      NOVICE: 'novato',
      BEGINNER: 'principiante',
      INTERMEDIATE: 'intermedio',
      ADVANCED: 'avanzado',
      EXPERT: 'experto',
      SPECIALIST: 'especialista'
    };

    // Estados emocionales más granulares
    this.EMOTIONAL_STATES = {
      PANICKED: 'pánico',
      ANXIOUS: 'ansioso',
      UNCERTAIN: 'incierto',
      NEUTRAL: 'neutral',
      CURIOUS: 'curioso',
      ENTHUSIASTIC: 'entusiasta',
      CONFIDENT: 'confiado',
      SKEPTICAL: 'escéptico'
    };

    // Keywords expandidos
    this.KEYWORDS = {
      education: ['qué es', 'cómo funciona', 'explicar', 'concepto', 'definición', 'aprender', 'entender', 'enseña', 'fundamentos'],
      analysis: ['análisis', 'mercado', 'hoy', 'caída', 'subida', 'rendimiento', 'precio', 'tendencia', 'correlación'],
      advisory: ['debería', 'qué hago', 'recomendación', 'opción', 'decisión', 'empezar', 'cómo procedo'],
      comparison: ['vs', 'versus', 'comparar', 'diferencia', 'ventajas', 'desventajas', 'cuál es mejor'],
      strategic: ['estrategia', 'plan', 'objetivo', 'meta', 'largo plazo', 'sostenible', 'crecimiento'],
      urgent: ['caída', 'crash', 'pánico', 'urgente', 'ayuda', 'ahora', 'perdí', 'crisis', 'emergencia'],
      anxiety: ['miedo', 'preocupado', 'ansioso', 'nervioso', 'perder', 'riesgo', 'asustado', 'pánico', 'incierto'],
      confusion: ['no entiendo', 'confundido', 'complejo', 'difícil', 'no sé', 'confunde', 'perdido'],
      frustration: ['cansado', 'fastidio', 'no funciona', 'decepción', 'malas experiencias', 'fracaso'],
      enthusiasm: ['emocionado', 'interesado', 'genial', 'excelente', 'quiero', 'ánimo', 'optimista'],
      skepticism: ['no creo', 'duda', 'escéptico', 'es posible', 'seguro que', 'probablemente no']
    };

    // Sistema de datos de mercado simulados
    this.MARKET_DATA = this.initializeMarketData();

    // Variables de sesión por usuario
    this.userSessions = {};
  }

  /**
   * Inicializa datos de mercado simulados pero realistas
   */
  initializeMarketData() {
    return {
      markets: {
        sp500: { value: 5921, change: 0.23, volatility: 'media', trend: 'alcista' },
        nasdaq: { value: 19682, change: 0.34, volatility: 'alta', trend: 'alcista' },
        dax: { value: 18734, change: 0.12, volatility: 'media', trend: 'alcista' },
        nikkei: { value: 33064, change: 0.56, volatility: 'baja', trend: 'alcista' }
      },
      volatilityIndex: 14.2,
      interestRates: { fed: 4.75, ecb: 3.50, bcrp: 5.75 },
      inflation: { global: 3.2, usa: 3.1, eurozone: 2.4 },
      treasureYields: { year2: 4.2, year10: 4.15, spread: -0.05 },
      commodities: {
        oil: { price: 72.5, trend: 'bajista' },
        gold: { price: 2072, trend: 'alcista' },
        copper: { price: 4.12, trend: 'neutral' }
      },
      currencies: {
        eurusd: 1.1042,
        gbpusd: 1.2745,
        jpyusd: 0.0068
      }
    };
  }

  /**
   * Obtiene o crea sesión de usuario con perfil persistente
   */
  getOrCreateSession(userId, conversationId) {
    const sessionKey = `${userId}_${conversationId || 'default'}`;

    if (!this.userSessions[sessionKey]) {
      this.userSessions[sessionKey] = {
        userId,
        conversationId: conversationId || 'default',
        messages: [],
        profile: {
          knowledgeLevel: null,
          emotionalState: null,
          investmentHorizon: null,
          riskTolerance: null,
          investmentObjectives: [],
          mentionedAssets: [],
          topicsExplored: [],
          previousQuestions: [],
          detectedNeeds: [],
          preferences: {},
          lastEmotionalState: null,
          createdAt: new Date(),
          lastActivity: new Date()
        },
        conversationFlow: {
          turns: 0,
          themes: [],
          clarificationsMade: 0,
          assumptionsValidated: 0
        }
      };
    }

    this.userSessions[sessionKey].profile.lastActivity = new Date();
    return this.userSessions[sessionKey];
  }

  /**
   * Análisis avanzado del mensaje del usuario
   */
  analyzeAdvanced(message, session) {
    const lowerMessage = message.toLowerCase();

    // Análisis básico
    const analysis = {
      queryType: this.detectQueryType(lowerMessage),
      knowledgeLevel: this.inferKnowledgeLevel(lowerMessage, session),
      emotionalState: this.analyzeEmotions(lowerMessage),
      complexity: this.assessComplexity(message),
      certainty: this.assessCertainty(message),
      latentNeeds: this.inferLatentNeeds(message, session),
      assumptions: this.identifyAssumptions(message),
      context: this.extractEnhancedContext(message, session),
      predictedFollowUps: this.predictFollowUps(message, session),
      isFirstMessage: session.messages.length === 0,
      messageLength: message.split(' ').length,
      sentiment: this.analyzeSentiment(message),
      hasNumbers: /\d+/.test(message),
      urgencyLevel: this.assessUrgency(message)
    };

    return analysis;
  }

  /**
   * Detecta el tipo de consulta con lógica sofisticada
   */
  detectQueryType(message) {
    // Si pregunta sobre planes/objetivos a largo plazo
    if (message.match(/plan|estrategia|objetivo|meta|años|futuro|jubilación/i)) {
      return this.QUERY_TYPES.STRATEGIC;
    }

    // Si pregunta "¿qué debería hacer?" o similar
    if (message.match(/debería|qué hago|recomendación|opción|decisión/i)) {
      return this.QUERY_TYPES.ADVISORY;
    }

    // Si es educativa
    if (this.matchesKeywords(message, this.KEYWORDS.education)) {
      return this.QUERY_TYPES.EDUCATIONAL;
    }

    // Si es análisis de mercado
    if (this.matchesKeywords(message, this.KEYWORDS.analysis)) {
      return this.QUERY_TYPES.ANALYTICAL;
    }

    // Si es comparativa
    if (this.matchesKeywords(message, this.KEYWORDS.comparison)) {
      return this.QUERY_TYPES.COMPARATIVE;
    }

    // Si es emergencia
    if (this.matchesKeywords(message, this.KEYWORDS.urgent)) {
      return this.QUERY_TYPES.EMOTIONAL;
    }

    // Si pregunta "es posible", "qué pasa si"
    if (message.match(/es posible|qué pasa si|y si|hipótesis/i)) {
      return this.QUERY_TYPES.SPECULATIVE;
    }

    // Si pregunta sobre por qué, filosofía del dinero
    if (message.match(/por qué|por qué razón|filosofía|sentido|significado/i)) {
      return this.QUERY_TYPES.PHILOSOPHICAL;
    }

    // Diagnóstico de situación
    if (message.match(/está bien|está mal|es correcto|debería|funcionará/i)) {
      return this.QUERY_TYPES.DIAGNOSTIC;
    }

    return this.QUERY_TYPES.EDUCATIONAL;
  }

  /**
   * Infiere nivel de conocimiento de forma avanzada
   */
  inferKnowledgeLevel(message, session) {
    // Si el usuario menciona términos muy técnicos
    const specialistTerms = ['duration', 'convexity', 'greeks', 'stochastic', 'brownian motion', 'value at risk', 'var'];
    if (specialistTerms.some(t => message.toLowerCase().includes(t))) {
      return this.KNOWLEDGE_LEVELS.SPECIALIST;
    }

    const expertTerms = ['yield curve', 'beta', 'alpha', 'sharpe', 'sortino', 'capm', 'factor investing', 'mean reversion'];
    if (expertTerms.some(t => message.toLowerCase().includes(t))) {
      return this.KNOWLEDGE_LEVELS.EXPERT;
    }

    const advancedTerms = ['etf', 'índice', 'correlación', 'volatilidad', 'diversificación', 'rebalanceo', 'drawdown'];
    if (advancedTerms.some(t => message.toLowerCase().includes(t))) {
      return this.KNOWLEDGE_LEVELS.ADVANCED;
    }

    // Si demuestra confusión o pregunta básica
    if (message.match(/no entiendo|qué es|nunca|por primera|principiante/i)) {
      return this.KNOWLEDGE_LEVELS.BEGINNER;
    }

    // Si el perfil ya tiene un nivel, usa ese como base
    if (session.profile.knowledgeLevel) {
      return session.profile.knowledgeLevel;
    }

    return this.KNOWLEDGE_LEVELS.INTERMEDIATE;
  }

  /**
   * Análisis emocional sofisticado
   */
  analyzeEmotions(message) {
    if (message.match(/pánico|crisis|ayuda urgente|emergencia/i)) {
      return this.EMOTIONAL_STATES.PANICKED;
    }

    if (this.matchesKeywords(message, this.KEYWORDS.anxiety)) {
      return this.EMOTIONAL_STATES.ANXIOUS;
    }

    if (message.match(/no estoy seguro|incierto|dudoso|no sé|es confuso/i)) {
      return this.EMOTIONAL_STATES.UNCERTAIN;
    }

    if (this.matchesKeywords(message, this.KEYWORDS.skepticism)) {
      return this.EMOTIONAL_STATES.SKEPTICAL;
    }

    if (this.matchesKeywords(message, this.KEYWORDS.enthusiasm)) {
      return this.EMOTIONAL_STATES.ENTHUSIASTIC;
    }

    if (message.match(/seguro|confiado|decidido/i)) {
      return this.EMOTIONAL_STATES.CONFIDENT;
    }

    if (message.match(/interesado|curioso|quiero saber/i)) {
      return this.EMOTIONAL_STATES.CURIOUS;
    }

    return this.EMOTIONAL_STATES.NEUTRAL;
  }

  /**
   * Evalúa la certeza del usuario
   */
  assessCertainty(message) {
    const uncertaintyMarkers = ['creo que', 'quizás', 'tal vez', 'probablemente', 'no estoy seguro'];
    const certaintyMarkers = ['definitivamente', 'seguro', 'estoy seguro', 'claramente', 'sin duda'];

    const uncertainCount = uncertaintyMarkers.filter(m => message.toLowerCase().includes(m)).length;
    const certainCount = certaintyMarkers.filter(m => message.toLowerCase().includes(m)).length;

    if (certainCount > 0) return 'high';
    if (uncertainCount > 0) return 'low';
    return 'medium';
  }

  /**
   * Infiere necesidades latentes (NO preguntadas explícitamente)
   */
  inferLatentNeeds(message, session) {
    const needs = [];

    // Si menciona pérdidas, probablemente necesita validación
    if (message.match(/perdí|bajó|negativo/i)) {
      needs.push('validación_emocional');
      needs.push('recontextualización_histórica');
      needs.push('plan_de_acción');
    }

    // Si menciona inversión inicial, probablemente necesita educación
    if (message.match(/empezar|principal|primer|inicial/i)) {
      needs.push('educación_base');
      needs.push('opciones_prácticas');
      needs.push('estructura_paso_a_paso');
    }

    // Si pregunta sobre múltiples opciones, necesita comparativa clara
    if ((message.match(/\?/g) || []).length > 1) {
      needs.push('comparativa_estructurada');
      needs.push('matriz_decisión');
    }

    // Si menciona dinero específico, necesita estrategia personalizada
    if (message.match(/\$\d+|inversión de|tengo [0-9]/i)) {
      needs.push('análisis_personalizado');
      needs.push('recomendaciones_específicas');
    }

    // Si es pensador largo plazo, necesita perspectiva histórica
    if (message.match(/años|largo plazo|jubilación|futuro/i)) {
      needs.push('contexto_histórico');
      needs.push('proyecciones_realistas');
    }

    return needs;
  }

  /**
   * Identifica supuestos en el mensaje del usuario
   */
  identifyAssumptions(message) {
    const assumptions = [];

    // Asume que el mercado bajará/subirá
    if (message.match(/va a bajar|va a subir|será|habrá/i)) {
      assumptions.push('predicción_mercado_futura');
    }

    // Asume que algo es seguro o imposible
    if (message.match(/nunca|siempre|imposible|seguro que/i)) {
      assumptions.push('absolutos_financieros');
    }

    // Asume que todos invierten igual
    if (message.match(/todos|la mayoría|la gente|normal/i)) {
      assumptions.push('generalización_de_estrategias');
    }

    // Asume que la recencia es representativa
    if (message.match(/última semana|últimos días|recientemente/i)) {
      assumptions.push('sesgo_recencia');
    }

    return assumptions;
  }

  /**
   * Extrae contexto enriquecido
   */
  extractEnhancedContext(message, session) {
    return {
      timeframe: this.extractTimeframe(message),
      assets: this.extractAssets(message),
      topics: this.extractTopics(message),
      amounts: this.extractAmounts(message),
      entities: this.extractFinancialEntities(message),
      relationshipToContext: this.analyzeContextRelationship(message, session),
      relatedTopics: this.inferRelatedTopics(message, session),
      isFollowUp: session.messages.length > 0
    };
  }

  /**
   * Predice preguntas de seguimiento que el usuario probablemente hará
   */
  predictFollowUps(message, session) {
    const predictions = [];

    if (message.match(/¿qué es/i)) {
      predictions.push('¿Cómo aplico esto en mi situación?');
      predictions.push('¿Cuál es el riesgo?');
    }

    if (message.match(/invertir|empezar/i)) {
      predictions.push('¿Cuánto dinero necesito?');
      predictions.push('¿Cuál es el riesgo?');
      predictions.push('¿Cómo empiezo?');
    }

    if (message.match(/perdí|bajó/i)) {
      predictions.push('¿Esto es normal?');
      predictions.push('¿Debería vender?');
      predictions.push('¿Se recuperará?');
    }

    return predictions;
  }

  /**
   * Analiza sentimiento general
   */
  analyzeSentiment(message) {
    let score = 0; // -1 = negativo, 0 = neutral, 1 = positivo

    const positive = ['excelente', 'genial', 'amor', 'amo', 'perfecto', 'mejor', 'gano'];
    const negative = ['odio', 'horrible', 'malo', 'pior', 'perder', 'perdí', 'pánico'];

    positive.forEach(word => {
      if (message.toLowerCase().includes(word)) score += 0.3;
    });

    negative.forEach(word => {
      if (message.toLowerCase().includes(word)) score -= 0.3;
    });

    if (score > 0.5) return 'positive';
    if (score < -0.5) return 'negative';
    return 'neutral';
  }

  /**
   * Evalúa nivel de urgencia
   */
  assessUrgency(message) {
    if (message.match(/urgente|ahora|inmediato|emergencia|crisis/i)) return 'critical';
    if (message.match(/pronto|rápido|próximas horas|mañana/i)) return 'high';
    if (message.match(/esta semana|próximos días/i)) return 'medium';
    return 'low';
  }

  /**
   * Evalúa la complejidad del mensaje
   */
  assessComplexity(message) {
    const wordCount = message.split(' ').length;
    const questions = (message.match(/\?/g) || []).length;
    const technicalTerms = (message.match(/\b(análisis|volatilidad|derivados|correlación|rebalanceo|hedge|leverage|diversificación)\b/gi) || []).length;

    if (wordCount > 50 || questions > 2 || technicalTerms > 2) return 'alta';
    if (wordCount > 20 || questions > 1) return 'media';
    return 'simple';
  }

  // Métodos auxiliares de extracción
  extractTimeframe(message) {
    if (message.match(/días?|próximo|esta semana/i)) return 'corto_plazo';
    if (message.match(/años|futuro|largo plazo|jubilación/i)) return 'largo_plazo';
    if (message.match(/meses|próximo año/i)) return 'mediano_plazo';
    return null;
  }

  extractAssets(message) {
    const assets = new Set();
    if (message.match(/acciones?/i)) assets.add('acciones');
    if (message.match(/etf/i)) assets.add('etfs');
    if (message.match(/bonos?/i)) assets.add('bonos');
    if (message.match(/crypto|bitcoin|ethereum/i)) assets.add('criptos');
    if (message.match(/inmuebles?|propiedades?/i)) assets.add('inmuebles');
    if (message.match(/fondos?/i)) assets.add('fondos');
    return Array.from(assets);
  }

  extractTopics(message) {
    const topics = new Set();
    if (message.match(/diversif/i)) topics.add('diversificación');
    if (message.match(/riesgo/i)) topics.add('riesgo');
    if (message.match(/rendimiento/i)) topics.add('rendimiento');
    if (message.match(/volatilidad/i)) topics.add('volatilidad');
    if (message.match(/mercado/i)) topics.add('mercado');
    return Array.from(topics);
  }

  extractAmounts(message) {
    const amounts = [];
    const matches = message.match(/\$\d+[,\d]*/g);
    if (matches) amounts.push(...matches);
    return amounts;
  }

  extractFinancialEntities(message) {
    const entities = [];
    const companies = ['Apple', 'Microsoft', 'Google', 'Tesla', 'Amazon', 'Meta', 'NVIDIA'];
    companies.forEach(company => {
      if (message.includes(company)) entities.push(company);
    });
    return entities;
  }

  analyzeContextRelationship(message, session) {
    if (session.messages.length === 0) return 'first_message';
    const lastMessage = session.messages[session.messages.length - 1];
    const isContinuing = message.match(/sí|claro|ok|entendido|y si|pero|además/i);
    return isContinuing ? 'continuation' : 'new_topic';
  }

  inferRelatedTopics(message, session) {
    const currentTopics = this.extractTopics(message);
    const related = [];

    if (currentTopics.includes('acciones')) {
      related.push('diversificación', 'análisis fundamental', 'selectividad');
    }

    if (currentTopics.includes('riesgo')) {
      related.push('diversificación', 'horizonte temporal', 'tolerancia al riesgo');
    }

    return related;
  }

  /**
   * GENERADOR PRINCIPAL DE RESPUESTAS - VERSIÓN AVANZADA
   */
  generateResponse(userMessage, analysis, session) {
    // Detectar saludos primero
    if (this.isGreeting(userMessage)) {
      return this.handleGreeting(userMessage, analysis, session);
    }

    const { emotionalState, queryType, knowledgeLevel, latentNeeds, assumptions, urgencyLevel } = analysis;

    // Prioriza por urgencia/emoción primero
    if (urgencyLevel === 'critical' || emotionalState === this.EMOTIONAL_STATES.PANICKED) {
      return this.handleCrisis(userMessage, analysis, session);
    }

    if (emotionalState === this.EMOTIONAL_STATES.ANXIOUS) {
      return this.handleAnxiety(userMessage, analysis, session);
    }

    if (emotionalState === this.EMOTIONAL_STATES.UNCERTAIN) {
      return this.handleUncertainty(userMessage, analysis, session);
    }

    // Luego por tipo de consulta
    if (queryType === this.QUERY_TYPES.STRATEGIC) {
      return this.handleStrategic(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.DIAGNOSTIC) {
      return this.handleDiagnostic(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.COMPARATIVE) {
      return this.handleComparative(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.EDUCATIONAL) {
      return this.handleEducational(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.ANALYTICAL) {
      return this.handleAnalytical(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.ADVISORY) {
      return this.handleAdvisory(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.SPECULATIVE) {
      return this.handleSpeculative(userMessage, analysis, session);
    }

    if (queryType === this.QUERY_TYPES.PHILOSOPHICAL) {
      return this.handlePhilosophical(userMessage, analysis, session);
    }

    return this.handleConversational(userMessage, analysis, session);
  }

  /**
   * Manejo de crisis/pánico
   */
  handleCrisis(message, analysis, session) {
    let response = '🛑 Entiendo que esto sea crítico. Voy directo al grano:\n\n';

    response += '**PRIMERO - Lo Inmediato:**\n';
    response += '1. No hagas nada irreversible en el próximo 1 hora\n';
    response += '2. Respira. Las decisiones en pánico casi siempre son malas\n';
    response += '3. Toma café/agua. Baja la adrenalina\n\n';

    response += '**SEGUNDO - El Contexto Que Necesito:**\n';
    response += '¿Cuándo necesitas acceso a este dinero?\n';
    response += '- Si es HOY/ESTA SEMANA: situación crítica de liquidez\n';
    response += '- Si es próximos 6 meses: necesitas dinero pronto\n';
    response += '- Si es 5+ años: esto es ruido de mercado\n\n';

    response += '**TERCERA - Perspectiva Histórica:**\n';
    response += 'El S&P 500 ha caído >20% al menos 10 veces en los últimos 30 años.\n';
    response += 'Cada caída fue temporal. Quien vendió en pánico perdió.\n';
    response += 'Quien esperó ganó.\n\n';

    response += '¿Cuál es tu horizonte de tiempo con este dinero?';

    return {
      message: response,
      analysis,
      responseType: 'crisis_handler',
      priority: 'critical',
      followUpQuestions: [
        '¿Cuándo necesitas el dinero?',
        '¿Es un problema de liquidez o valoración?',
        '¿Cuál fue tu objetivo original?'
      ]
    };
  }

  /**
   * Manejo de ansiedad
   */
  handleAnxiety(message, analysis, session) {
    let response = '😔 Entiendo la preocupación. Es completamente válida.\n\n';

    response += '**Lo Que Estoy Escuchando:**\n';
    response += `Tu preocupación es sobre: [${analysis.context.assets.join(', ') || 'tus inversiones'}]\n`;
    response += `Tu incertidumbre es: ${analysis.emotionalState}\n\n`;

    response += '**Mi Perspectiva:**\n';
    response += 'La ansiedad en finanzas es NORMAL. Significa que tomas en serio tu dinero.\n';
    response += 'Lo importante es que tu ESTRATEGIA sea sólida, no que el mercado suba hoy.\n\n';

    response += '**Aquí va mi análisis:**\n';
    
    const horizon = analysis.context.timeframe;
    if (horizon === 'largo_plazo') {
      response += '• Tienes tiempo: las caídas a largo plazo no importan\n';
      response += '• La volatilidad es ESPERADA\n';
      response += '• Deberías estar COMPRANDO a precios bajos, no vendiendo\n';
    } else if (horizon === 'corto_plazo') {
      response += '• Aquí SÍ importa la volatilidad\n';
      response += '• Probablemente no deberías estar en activos volátiles\n';
      response += '• Necesitamos rebalancear tu cartera\n';
    } else {
      response += '• Necesito saber tu horizonte de tiempo\n';
      response += '• Es LA variable más importante\n';
    }

    response += '\n**Mi Pregunta Para Ti:**\n';
    response += '¿Cuándo REALMENTE necesitas este dinero?\n';
    response += '- Si es 5+ años: mantén tu curso\n';
    response += '- Si es 1-2 años: ajusta tu estrategia\n';
    response += '- Si es meses: probable que estés en el activo equivocado';

    return {
      message: response,
      analysis,
      responseType: 'anxiety_handler',
      priority: 'high',
      emotionalSupport: true,
      followUpQuestions: analysis.predictedFollowUps
    };
  }

  /**
   * Manejo de incertidumbre
   */
  handleUncertainty(message, analysis, session) {
    let response = '🤔 Veo que hay confusión. Déjame traer claridad.\n\n';

    response += '**Primero, Validemos:**\n';
    response += 'La incertidumbre en finanzas es sana. Solo tontos o desinformados están 100% seguros.\n\n';

    response += '**Segundo, Identifiquemos:**\n';
    if (analysis.assumptions.length > 0) {
      response += 'Veo que asumes: ' + analysis.assumptions.join(', ') + '\n';
      response += 'Hablemos sobre eso.\n\n';
    }

    response += '**Tercero, Dividamos el Problema:**\n';
    const topics = analysis.context.topics || [];
    if (topics.length > 0) {
      topics.forEach((topic, i) => {
        response += `${i + 1}. Empecemos con ${topic}\n`;
      });
    } else {
      response += '1. ¿Cuál parte te confunde más?\n';
      response += '2. ¿Qué necesitas entender?\n';
    }

    return {
      message: response,
      analysis,
      responseType: 'uncertainty_handler',
      priority: 'medium',
      clarificationFocused: true
    };
  }

  /**
   * Manejo de preguntas estratégicas
   */
  handleStrategic(message, analysis, session) {
    let response = '📊 Esta es una pregunta estratégica seria. Voy profundo.\n\n';

    response += '**Componentes Clave de Tu Estrategia:**\n\n';

    response += '1️⃣ **Horizonte de Tiempo**\n';
    const horizon = analysis.context.timeframe;
    if (horizon === 'largo_plazo') {
      response += '   Tu ventaja: tiempo. Volatilidad no importa.\n';
      response += '   Tu estrategia: acumulación consistente, diversificación amplia.\n';
    } else {
      response += '   Horizon: ' + horizon + '\n';
      response += '   Requiere: mayor conservadurismo\n';
    }
    response += '\n';

    response += '2️⃣ **Tolerancia al Riesgo**\n';
    response += '   ¿Cómo te sentirías si tu cartera baja 30%?\n';
    response += '   - Si duele: necesitas más bonos/efectivo\n';
    response += '   - Si ves oportunidad: puedes más acciones\n\n';

    response += '3️⃣ **Objetivo Específico**\n';
    response += '   ¿Qué intenta lograr?\n';
    response += '   - Jubilación: acumulación a largo plazo\n';
    response += '   - Casa: horizonte medio, conservador\n';
    response += '   - Riqueza: crecimiento, requiere disciplina\n\n';

    response += '4️⃣ **Estructura Operativa**\n';
    response += '   - Diversificación: 60/40 es clásico\n';
    response += '   - Rebalanceo: anualmente o cada 5% de drift\n';
    response += '   - Disciplina: lo más importante\n\n';

    response += '**Tu Plan Debería:**\n';
    response += '✓ Ser claro y documentado\n';
    response += '✓ Respetar tu psicología (no compres lo que no duermes)\n';
    response += '✓ Tener reglas, no emociones\n';
    response += '✓ Ser periódicamente revisado (no obsesivamente)';

    return {
      message: response,
      analysis,
      responseType: 'strategic_handler',
      priority: 'medium',
      structured: true,
      followUpQuestions: [
        '¿Cuál es tu horizonte de tiempo exacto?',
        '¿Cuánto está dispuesto a perder temporalmente?',
        '¿Cuál es el objetivo monetario específico?'
      ]
    };
  }

  /**
   * Manejo de consultas diagnósticas
   */
  handleDiagnostic(message, analysis, session) {
    let response = '🔍 Voy a diagnosticar tu situación.\n\n';

    response += '**Lo Que Preguntaste:**\n';
    response += `"${message.substring(0, 80)}..."\n\n`;

    response += '**Mi Análisis:**\n';
    response += `Nivel de certeza: ${analysis.certainty}\n`;
    response += `Sentimiento: ${analysis.sentiment}\n`;
    response += `Necesidades latentes: ${analysis.latentNeeds.join(', ') || 'genéricas'}\n\n`;

    response += '**Posibles Resultados:**\n';

    if (message.match(/está bien/i)) {
      response += '- **Si**: Continúa con confianza\n';
      response += '- **Si no**: Necesitas ajustes\n';
      response += '- **Depende de**: Tu situación personal específica\n\n';
    }

    response += '**Para Darte Una Respuesta Sólida, Necesito:**\n';
    response += analysis.predictedFollowUps.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n');

    return {
      message: response,
      analysis,
      responseType: 'diagnostic_handler',
      priority: 'medium',
      requiresClarity: true
    };
  }

  /**
   * Manejo de comparativas
   */
  handleComparative(message, analysis, session) {
    let response = '⚖️ Voy a comparar opciones de forma profesional.\n\n';

    const assets = analysis.context.assets;

    if (assets.includes('acciones') && assets.includes('etfs')) {
      response += '**ACCIONES INDIVIDUALES vs ETFs**\n\n';
      
      response += '📊 **Matriz de Decisión:**\n';
      response += '| Factor | Acciones | ETFs |\n';
      response += '|--------|----------|------|\n';
      response += '| Control | Alto | Bajo (índice) |\n';
      response += '| Diversificación | Manual | Automática |\n';
      response += '| Comisiones | Variables | 0.03%-0.50% |\n';
      response += '| Investigación | Requerida | Mínima |\n';
      response += '| Riesgo | Alto | Medio |\n';
      response += '| Retorno potencial | Alto | Consistente |\n\n';

      response += '✅ **Elige ACCIONES si:**\n';
      response += '- Tienes 10+ horas/semana para investigar\n';
      response += '- Tienes experiencia en análisis\n';
      response += '- Buscas rendimiento superior (con riesgo)\n';
      response += '- Disfrutas el proceso\n\n';

      response += '✅ **Elige ETFs si:**\n';
      response += '- Tienes poco tiempo\n';
      response += '- Eres principiante\n';
      response += '- Quieres dormir tranquilo\n';
      response += '- Buscas consistencia\n\n';

      response += '🎯 **Mi Perspectiva:**\n';
      response += 'Para 95% de las personas: ETFs ganan.\n';
      response += 'Para 5% con pasión/tiempo: Acciones pueden ganar.\n';
      response += 'Lo importante es HACER algo, no la perfección.';
    }

    return {
      message: response,
      analysis,
      responseType: 'comparative_handler',
      priority: 'medium',
      structured: true
    };
  }

  /**
   * Manejo educativo sofisticado
   */
  handleEducational(message, analysis, session) {
    let response = '';

    if (analysis.knowledgeLevel === this.KNOWLEDGE_LEVELS.BEGINNER) {
      response = '🌱 **PARA PRINCIPIANTES:**\n\n';
      response += this.generateBeginnerExplanation(message, analysis);
    } else if (analysis.knowledgeLevel === this.KNOWLEDGE_LEVELS.ADVANCED ||
               analysis.knowledgeLevel === this.KNOWLEDGE_LEVELS.EXPERT) {
      response = '🎓 **ANÁLISIS TÉCNICO:**\n\n';
      response += this.generateAdvancedExplanation(message, analysis);
    } else {
      response = '📚 **EXPLICACIÓN BALANCEADA:**\n\n';
      response += this.generateIntermediateExplanation(message, analysis);
    }

    response += '\n\n¿Tiene sentido? ¿Qué parte quieres profundizar?';

    return {
      message: response,
      analysis,
      responseType: 'educational_handler',
      priority: 'low',
      educational: true,
      followUpQuestions: [
        '¿Cómo aplico esto?',
        '¿Cuál es el riesgo?',
        'Dame un ejemplo práctico'
      ]
    };
  }

  generateBeginnerExplanation(message, analysis) {
    // Detecta el concepto y da explicación simple
    if (message.match(/etf/i)) {
      return 'Un ETF es como comprar una "canasta de acciones" en una sola compra.\n\n' +
             'Imagina que quieres comer: podrías cocinar cada ingrediente separado (complejo),\n' +
             'o podrías ir a un restaurante donde lo hacen perfecto (ETF).\n\n' +
             'Ventajas:\n' +
             '✓ Diversificación automática\n' +
             '✓ Bajo costo\n' +
             '✓ Fácil de comprar\n' +
             '✓ Perfecto para principiantes';
    }

    if (message.match(/diversif/i)) {
      return 'Diversificación es simple: no apuestes TODO a una sola cosa.\n\n' +
             'Analogía: Si llevas 10 huevos,\n' +
             '❌ MALO: todos en una canasta (si se cae, perdiste todo)\n' +
             '✅ BUENO: distribuidos en 5 canastas (si una se cae, aún tienes 8)\n\n' +
             'En inversiones:\n' +
             '✓ Múltiples acciones, no una sola\n' +
             '✓ Múltiples sectores, no solo tecnología\n' +
             '✓ Múltiples países, no solo tu país\n' +
             '✓ Múltiples tipos: acciones + bonos + efectivo';
    }

    return 'Es un concepto importante en finanzas. Te lo explico:\n\n' +
           'Aspecto 1: [concepto base]\n' +
           'Aspecto 2: [por qué importa]\n' +
           'Aspecto 3: [cómo usarlo]';
  }

  generateAdvancedExplanation(message, analysis) {
    return 'Desde perspectiva técnica:\n\n' +
           '• Considera el alpha/beta de la estrategia\n' +
           '• Analiza la correlación con tu cartera existente\n' +
           '• Valida con backtesting histórico\n' +
           '• Asegúrate de edge sostenible';
  }

  generateIntermediateExplanation(message, analysis) {
    return 'Aquí está el análisis equilibrado:\n\n' +
           '1. El concepto base: [explicación clara]\n' +
           '2. Por qué importa: [relevancia práctica]\n' +
           '3. Cómo lo usas: [pasos concretos]';
  }

  /**
   * Manejo analítico con datos
   */
  handleAnalytical(message, analysis, session) {
    let response = '📈 **ANÁLISIS DE MERCADO**\n\n';

    response += '**Contexto Actual (Simulado):**\n';
    response += `• S&P 500: ${this.MARKET_DATA.markets.sp500.value} (${this.MARKET_DATA.markets.sp500.change}%)\n`;
    response += `• Volatilidad (VIX): ${this.MARKET_DATA.volatilityIndex}\n`;
    response += `• Tasas Fed: ${this.MARKET_DATA.interestRates.fed}%\n`;
    response += `• Inflación Global: ${this.MARKET_DATA.inflation.global}%\n\n`;

    response += '**Interpretación:**\n';
    if (this.MARKET_DATA.volatilityIndex < 15) {
      response += '- VIX bajo: mercado confiado, tal vez demasiado\n';
    } else {
      response += '- VIX elevado: incertidumbre o miedo\n';
    }

    if (this.MARKET_DATA.treasureYields.spread < 0) {
      response += '- Yield curve invertida: señal de alerta económica\n';
    } else {
      response += '- Yield curve normal: mercado optimista\n';
    }

    response += '\n**Implicaciones Para Ti:**\n';
    response += '- Si quieres invertir: probablemente buen momento (con cautela)\n';
    response += '- Si tienes dinero en efectivo: considera laddering de entrada\n';
    response += '- Si tienes cartera: valida tu diversificación\n\n';

    response += '**Mi Análisis:**\n';
    response += 'El mercado está [estado]. Históricamente, estos períodos duran [X].\n';
    response += 'Para tu perfil de riesgo, sugiero [estrategia general].';

    return {
      message: response,
      analysis,
      responseType: 'analytical_handler',
      priority: 'medium',
      dataInformed: true,
      includesMarketData: true
    };
  }

  /**
   * Manejo de asesoría sin recomendaciones directas
   */
  handleAdvisory(message, analysis, session) {
    let response = '💡 Esta es una decisión importante. Voy a ayudarte a pensar.\n\n';

    response += '**Antes de Decidir:**\n\n';

    response += '1️⃣ **¿Cuál es tu Horizonte?**\n';
    const horizon = analysis.context.timeframe;
    response += horizon ? 
      `   Tu horizonte: ${horizon}\n` :
      '   Necesito saber esto\n';
    response += '   Por qué: determina TODO\n\n';

    response += '2️⃣ **¿Cuál es tu Tolerancia al Riesgo?**\n';
    response += '   ¿Cómo dormirías si tu inversión baja 20%?\n';
    response += '   - Normal: necesitas más riesgo\n';
    response += '   - Incómodo: menos riesgo\n';
    response += '   - Pesadilla: definitivamente menos riesgo\n\n';

    response += '3️⃣ **¿Cuál es tu Objetivo?**\n';
    response += '   - Crecimiento a largo plazo\n';
    response += '   - Ingresos regulares\n';
    response += '   - Capitalizar oportunidad\n\n';

    response += '4️⃣ **¿Cuál es tu Alternativa?**\n';
    response += '   Si no inviertes, ¿qué pasa con el dinero?\n';
    response += '   (Esto es importante para relativizar el riesgo)\n\n';

    response += '**Lo Que NO haré:**\n';
    response += '❌ Decirte "compra X" o "vende Y"\n';
    response += '❌ Garantizarte resultados\n';
    response += '❌ Asumir mi análisis es mejor que un asesor profesional\n\n';

    response += '**Lo Que SÍ puedo hacer:**\n';
    response += '✅ Ayudarte a pensar mejor\n';
    response += '✅ Mostrar opciones y implicaciones\n';
    response += '✅ Desafiar supuestos inseguros\n\n';

    response += '¿Respondemos estas preguntas para avanzar?';

    return {
      message: response,
      analysis,
      responseType: 'advisory_handler',
      priority: 'high',
      disclaimerIncluded: true,
      guidedQuestions: [
        'Horizonte de tiempo',
        'Tolerancia al riesgo',
        'Objetivo específico',
        'Alternativas consideradas'
      ]
    };
  }

  /**
   * Manejo especulativo
   */
  handleSpeculative(message, analysis, session) {
    let response = '🤔 Pregunta "¿Qué pasa si...?" Buena. Voy a pensar en escenarios.\n\n';

    response += '**3 Escenarios Posibles:**\n\n';

    response += '📈 **Escenario Alcista:**\n';
    response += '- Condiciones: [X]\n';
    response += '- Probabilidad: ~30-40%\n';
    response += '- Implicación: [Y]\n\n';

    response += '⚖️ **Escenario Base:**\n';
    response += '- Condiciones: [X]\n';
    response += '- Probabilidad: ~40-50%\n';
    response += '- Implicación: [Y]\n\n';

    response += '📉 **Escenario Bajista:**\n';
    response += '- Condiciones: [X]\n';
    response += '- Probabilidad: ~10-30%\n';
    response += '- Implicación: [Y]\n\n';

    response += '**Lo Importante:**\n';
    response += '- El futuro es incierto\n';
    response += '- Prepárate para múltiples escenarios\n';
    response += '- No apuestes TODO a una visión\n';
    response += '- La diversificación cubre estos escenarios';

    return {
      message: response,
      analysis,
      responseType: 'speculative_handler',
      priority: 'low',
      scenarioAnalysis: true
    };
  }

  /**
   * Manejo filosófico
   */
  handlePhilosophical(message, analysis, session) {
    let response = '🧠 Pregunta profunda. Me gusta.\n\n';

    response += '**Sobre la Relación Con el Dinero:**\n\n';

    response += 'El dinero es:\n';
    response += '- Un medio, no un fin\n';
    response += '- Una herramienta para libertad, no una cadena\n';
    response += '- Lo que facilita vivir según tus valores\n\n';

    response += '**La Inversión es:**\n';
    response += '- Diferir consumo hoy para tener opciones mañana\n';
    response += '- Apuesta en que el futuro será mejor\n';
    response += '- Participación en progreso humano\n\n';

    response += '**La Verdad Incómoda:**\n';
    response += '- Sin inversión: inflación te atrasa\n';
    response += '- Con inversión: volatilidad te asusta\n';
    response += '- La pregunta es: ¿cuál dolor prefieres?\n\n';

    response += '**Mi Perspectiva:**\n';
    response += 'Invierte de forma que duermas tranquilo. El mejor plan es el que EJECUTAS.';

    return {
      message: response,
      analysis,
      responseType: 'philosophical_handler',
      priority: 'low',
      reflective: true
    };
  }

  /**
   * Detecta si el mensaje es un saludo
   */
  isGreeting(message) {
    const greetingPatterns = [
      /^(hola|hi|hey|buenos\s*días|buenas\s*noches|buenas\s*tardes|good\s*morning|good\s*afternoon|good\s*evening|hello|greetings?)/i,
      /^(qué\s*tal|cómo\s*estás|how\s*are\s*you|what's\s*up|sup)/i,
      /^(gracias|thanks|ayuda|help|necesito\s*ayuda)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Manejo de saludos - Respuesta inteligente y amigable
   */
  handleGreeting(message, analysis, session) {
    const isFirstMessage = session.messages.length === 0;
    const lowerMessage = message.toLowerCase();

    let response = '';

    if (isFirstMessage) {
      // Primera vez - Presentación completa y atractiva
      response = '👋 ¡Hola! Bienvenido a **FinanceGPT**, tu asistente de IA especializado en finanzas.\n\n';
      response += '**¿Quién soy?**\n';
      response += 'Soy Claude, pero especializado en finanzas. Tengo:\n';
      response += '• 📊 Análisis profundo en 13 dimensiones simultáneamente\n';
      response += '• 🧠 Inteligencia emocional (detectó que viniste con actitud ' + analysis.emotionalState + ')\n';
      response += '• 📚 Adaptación a tu nivel (desde novato hasta especialista)\n';
      response += '• 🎯 9 tipos de respuesta especializadas según tu pregunta\n';
      response += '• 💡 Detección de necesidades que no explícitas\n';
      response += '• ⚠️ Cuestionamiento crítico de supuestos peligrosos\n\n';

      response += '**¿Qué puedo hacer por ti?**\n';
      response += '• Educarte sobre finanzas de forma clara\n';
      response += '• Ayudarte en crisis o decisiones difíciles\n';
      response += '• Analizar opciones de inversión\n';
      response += '• Planificar estrategias a largo plazo\n';
      response += '• Cuestionar mis supuestos y sesgos\n\n';

      response += '**¿Cuál es tu siguiente paso?**\n';
      response += 'Cuéntame qué te trae aquí. Pueden ser preguntas como:\n';
      response += '- "¿Cómo empiezo a invertir?"\n';
      response += '- "Mi portafolio cayó 30%, ¿qué hago?"\n';
      response += '- "¿Debería comprar acciones o ETFs?"\n';
      response += '- "¿Cómo planeo mi jubilación?"\n';
      response += '- O cualquier pregunta financiera que tengas\n\n';

      response += '**Nota importante:** Soy educativo, no asesor. No puedo recomendarte inversiones específicas.';
    } else {
      // Continuación de conversación
      if (lowerMessage.match(/gracias|thanks|ta|thnx/i)) {
        response = '🙏 De nada! Estoy aquí para ayudarte.\n\n¿Hay algo más que quieras explorar sobre finanzas?';
      } else if (lowerMessage.match(/cómo\s*estás|how\s*are\s*you|how's\s*it\s*going/i)) {
        response = 'Excelente, funcionando perfectamente con toda mi inteligencia financiera activa 😊\n\n¿Y tú cómo estás? ¿Hay algo financiero en tu mente?';
      } else if (lowerMessage.match(/qué\s*tal|sup|what's\s*up/i)) {
        response = 'Aquí ando, listos para analizar finanzas contigo 💪\n\n¿Qué necesitas explorar hoy?';
      } else {
        response = '¡Hey de nuevo! 👋 Parece que algo te trae por aquí.\n\n¿Cuál es tu pregunta sobre finanzas?';
      }
    }

    return {
      message: response,
      analysis,
      responseType: 'greeting_handler',
      priority: 'medium',
      emotionalSupport: true,
      dataInformed: false,
      requiresClarity: !isFirstMessage,
      followUpQuestions: isFirstMessage ? [] : ['¿Cuál es tu siguiente pregunta?']
    };
  }

  /**
   * Manejo conversacional general
   */
  handleConversational(message, analysis, session) {
    const responses = [
      "Eso es interesante. ¿Me cuentas más sobre qué te llevó a pensar en esto?",
      "Buena observación. Relacionado con eso, considera también...",
      "Entiendo tu punto. Ahora bien, ¿has considerado la otra cara?",
      "Excelente pregunta. Voy a profundizar en esto.",
      "Veo donde vas. Déjame ofrecerte una perspectiva complementaria."
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      analysis,
      responseType: 'conversational',
      priority: 'low'
    };
  }

  /**
   * Métodos auxiliares
   */
  matchesKeywords(message, keywords) {
    return keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  }

  /**
   * Actualiza perfil de usuario con nuevos datos
   */
  updateUserProfile(session, analysis) {
    const profile = session.profile;

    if (analysis.knowledgeLevel) {
      profile.knowledgeLevel = analysis.knowledgeLevel;
    }

    if (analysis.emotionalState) {
      profile.lastEmotionalState = analysis.emotionalState;
    }

    if (analysis.context.timeframe) {
      profile.investmentHorizon = analysis.context.timeframe;
    }

    profile.topicsExplored = [
      ...new Set([...profile.topicsExplored, ...analysis.context.topics])
    ];

    profile.mentionedAssets = [
      ...new Set([...profile.mentionedAssets, ...analysis.context.assets])
    ];

    profile.detectedNeeds = [
      ...new Set([...profile.detectedNeeds, ...analysis.latentNeeds])
    ];

    session.conversationFlow.turns++;
    session.profile = profile;

    return session;
  }
}

module.exports = new FinanceGPTAdvanced();
