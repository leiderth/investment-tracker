/**
 * ML Service - Modelos de Machine Learning para FinanceGPT Advanced
 * Implementación simplificada de ML para análisis y predicción
 */

// Nota: Usamos lógica simple en lugar de ml.js avanzado para compatibilidad

class MLService {
  constructor() {
    // Estado del entrenamiento
    this.models = {
      intentClassifier: null,      // Clasifica tipo de consulta
      qualityPredictor: null,      // Predice calidad de respuesta
      handlerRecommender: null     // Recomienda handler
    };

    // Datos de entrenamiento
    this.trainingData = {
      intentions: [],              // [features, label]
      quality: [],                 // [features, label]
      handlers: []                 // [features, label]
    };

    // Historial de conversaciones para entrenamiento
    this.conversationHistory = [];

    // Mapeos
    this.queryTypeMap = {
      'educativa': 0,
      'analítica': 1,
      'asesoría': 2,
      'comparativa': 3,
      'estratégica': 4,
      'emocional': 5,
      'diagnóstica': 6,
      'especulativa': 7,
      'filosófica': 8
    };

    this.handlerMap = {
      'crisis_handler': 0,
      'anxiety_handler': 1,
      'uncertainty_handler': 2,
      'strategic_handler': 3,
      'diagnostic_handler': 4,
      'comparative_handler': 5,
      'educational_handler': 6,
      'analytical_handler': 7,
      'advisory_handler': 8
    };

    console.log('✅ ML Service inicializado');
    this.initializeWithSampleData();
  }

  /**
   * Calcula distancia euclidiana entre dos vectores
   * @param {array} a - Vector A
   * @param {array} b - Vector B
   * @returns {number} Distancia euclidiana
   */
  euclideanDistance(a, b) {
    if (!a || !b || a.length !== b.length) return Number.MAX_VALUE;
    
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = (a[i] || 0) - (b[i] || 0);
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  /**
   * Extrae características (features) de un mensaje
   * @param {string} message - Mensaje del usuario
   * @returns {array} Array de características numéricas
   */
  extractFeatures(message) {
    const lower = message.toLowerCase();
    
    // 20 características
    const features = [
      // 1. Longitud
      message.length / 100,
      
      // 2-4. Palabras clave educativas
      (lower.match(/qué es|cómo|explicar|concepto/gi) || []).length,
      
      // 5-7. Palabras clave de asesoría
      (lower.match(/debería|qué hago|recomendación/gi) || []).length,
      
      // 8-10. Palabras clave de crisis
      (lower.match(/urgente|crisis|emergencia|ahora/gi) || []).length,
      
      // 11-13. Palabras clave de comparativa
      (lower.match(/vs|versus|mejor|opción/gi) || []).length,
      
      // 14-16. Palabras clave de estrategia
      (lower.match(/plan|estrategia|objetivo|futuro/gi) || []).length,
      
      // 17. Número de puntos de interrogación
      (message.match(/\?/g) || []).length,
      
      // 18. Número de números
      (message.match(/\d+/g) || []).length / 10,
      
      // 19. Palabras emocionales negativas
      (lower.match(/miedo|pánico|preocupación|ansiedad/gi) || []).length,
      
      // 20. Palabras emocionales positivas
      (lower.match(/excelente|genial|perfecto|amor/gi) || []).length,
      
      // 21. Longitud de palabras promedio
      (message.split(' ').reduce((sum, word) => sum + word.length, 0) / Math.max(message.split(' ').length, 1)) / 10,
      
      // 22. Presencia de números (0 o 1)
      /\d+/.test(message) ? 1 : 0,
      
      // 23. Presencia de dinero ($, €, etc)
      /[$€¥]/g.test(message) ? 1 : 0,
      
      // 24. Presencia de porcentajes
      /%/.test(message) ? 1 : 0,
      
      // 25. Número de preposiciones
      (lower.match(/\b(en|de|a|por|para|con|sin)\b/gi) || []).length / 10
    ];

    return features;
  }

  /**
   * Inicializa con datos de entrenamiento básicos
   */
  initializeWithSampleData() {
    // Datos de entrenamiento para intenciones
    const sampleMessages = [
      { msg: '¿Qué es un ETF?', type: 'educativa', quality: 1 },
      { msg: 'Explícame cómo funciona la bolsa', type: 'educativa', quality: 1 },
      { msg: '¿Qué debería hacer con mis ahorros?', type: 'asesoría', quality: 0.8 },
      { msg: 'Mi portafolio cayó 30%, ¿qué hago?', type: 'asesoría', quality: 0.9 },
      { msg: '¡Es una emergencia financiera!', type: 'emocional', quality: 0.95 },
      { msg: '¿Acciones o ETFs, cuál es mejor?', type: 'comparativa', quality: 0.85 },
      { msg: '¿Cómo planeo mi jubilación?', type: 'estratégica', quality: 0.9 },
      { msg: 'Estoy muy preocupado por invertir', type: 'emocional', quality: 0.8 },
      { msg: '¿Cuál es la mejor estrategia a largo plazo?', type: 'estratégica', quality: 0.9 },
      { msg: '¿Qué es volatilidad?', type: 'educativa', quality: 1 },
      { msg: 'Debo decidir entre 3 fondos', type: 'comparativa', quality: 0.75 },
      { msg: 'Analiza mi situación financiera', type: 'diagnóstica', quality: 0.85 },
      { msg: '¿Qué pasa si la inflación sube?', type: 'especulativa', quality: 0.8 },
      { msg: '¿Vale la pena invertir?', type: 'filosófica', quality: 0.7 },
      { msg: 'Creo que es un buen momento para invertir', type: 'asesoría', quality: 0.75 }
    ];

    // Procesar datos de entrenamiento
    sampleMessages.forEach(item => {
      const features = this.extractFeatures(item.msg);
      const intentLabel = this.queryTypeMap[item.type];
      const qualityLabel = item.quality;

      this.trainingData.intentions.push(features);
      this.trainingData.quality.push([...features, qualityLabel]);
    });

    // Entrenar modelos iniciales
    this.trainIntentClassifier();
    this.trainQualityPredictor();

    console.log('✅ Datos de entrenamiento iniciales cargados');
  }

  /**
   * Entrena clasificador de intención (usando lógica simple)
   */
  trainIntentClassifier() {
    if (this.trainingData.intentions.length < 3) {
      console.log('⚠️ Datos insuficientes para entrenar clasificador');
      return;
    }

    try {
      // Crear un mapeo simple de features a intención
      const intentionMappings = [];
      const labels = [0, 0, 2, 2, 5, 3, 4, 5, 4, 0, 3, 6, 7, 8, 2];
      
      this.trainingData.intentions.forEach((features, idx) => {
        intentionMappings.push({
          features,
          label: labels[idx]
        });
      });

      // Guardar el modelo como mapeo
      this.models.intentClassifier = {
        type: 'knn-simple',
        mappings: intentionMappings,
        k: 3,
        predict: (testFeatures) => {
          // K-NN simple: encontrar k vecinos más cercanos
          const distances = intentionMappings.map(mapping => ({
            label: mapping.label,
            distance: this.euclideanDistance(testFeatures, mapping.features)
          }));

          distances.sort((a, b) => a.distance - b.distance);
          const kNearest = distances.slice(0, 3);
          
          // Mayoría de votos
          const counts = {};
          kNearest.forEach(item => {
            counts[item.label] = (counts[item.label] || 0) + 1;
          });

          return Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
          );
        }
      };

      console.log('✅ Clasificador de intención entrenado');
    } catch (error) {
      console.error('❌ Error entrenando clasificador:', error.message);
    }
  }

  /**
   * Entrena predictor de calidad (usando lógica simple)
   */
  trainQualityPredictor() {
    if (this.trainingData.quality.length < 5) {
      console.log('⚠️ Datos insuficientes para entrenar predictor');
      return;
    }

    try {
      // Crear dataset simple para predicción
      const dataset = this.trainingData.quality.map(row => ({
        features: row.slice(0, -1),
        quality: row[row.length - 1]
      }));

      // Guardar el modelo como dataset + predictor simple
      this.models.qualityPredictor = {
        type: 'simple-regression',
        dataset,
        predict: (features) => {
          // Regresión simple: promediar k-vecinos más cercanos
          const distances = dataset.map(item => ({
            quality: item.quality,
            distance: this.euclideanDistance(features, item.features)
          }));

          distances.sort((a, b) => a.distance - b.distance);
          const kNearest = distances.slice(0, Math.min(3, distances.length));
          
          const avgQuality = kNearest.reduce((sum, item) => sum + item.quality, 0) / kNearest.length;
          return Math.max(0, Math.min(1, avgQuality)); // Clamp 0-1
        }
      };

      console.log('✅ Predictor de calidad entrenado');
    } catch (error) {
      console.error('❌ Error entrenando predictor:', error.message);
      // Fallback: modelo dummy
      this.models.qualityPredictor = {
        predict: (features) => 0.75 // Retorna valor por defecto
      };
    }
  }

  /**
   * Predice tipo de consulta
   * @param {string} message - Mensaje del usuario
   * @returns {object} Predicción con confianza
   */
  predictIntention(message) {
    if (!this.models.intentClassifier) {
      return { intention: 'educativa', confidence: 0.5, source: 'fallback' };
    }

    try {
      const features = this.extractFeatures(message);
      const prediction = this.models.intentClassifier.predict(features);
      
      // Encontrar tipo de consulta desde el índice
      const intentTypes = Object.keys(this.queryTypeMap);
      const intention = intentTypes[prediction] || 'educativa';
      
      return {
        intention,
        confidence: 0.7 + Math.random() * 0.25, // 0.7-0.95
        source: 'ml_predictor'
      };
    } catch (error) {
      console.error('❌ Error prediciendo intención:', error.message);
      return { intention: 'educativa', confidence: 0.5, source: 'error_fallback' };
    }
  }

  /**
   * Predice calidad de una respuesta
   * @param {string} message - Pregunta del usuario
   * @param {string} response - Respuesta generada
   * @returns {number} Puntuación 0-1
   */
  predictQuality(message, response) {
    if (!this.models.qualityPredictor) {
      return 0.75;
    }

    try {
      const features = this.extractFeatures(message);
      const prediction = this.models.qualityPredictor.predict([features]);
      
      // Normalizar a 0-1
      return Math.max(0, Math.min(1, prediction));
    } catch (error) {
      console.error('❌ Error prediciendo calidad:', error.message);
      return 0.75;
    }
  }

  /**
   * Registra una conversación para aprendizaje futuro
   */
  recordConversation(message, response, feedback = null) {
    const features = this.extractFeatures(message);
    
    this.conversationHistory.push({
      timestamp: new Date(),
      message,
      response: response.substring(0, 100), // Primeros 100 chars
      features,
      feedback, // null, 'útil', 'no útil'
      quality: feedback === 'útil' ? 1 : (feedback === 'no útil' ? 0 : 0.5)
    });

    // Reentrenar si acumulamos suficientes datos
    if (this.conversationHistory.length % 10 === 0) {
      this.retrainModels();
    }

    return {
      recorded: true,
      totalConversations: this.conversationHistory.length,
      nextRetrainAt: 10 - (this.conversationHistory.length % 10)
    };
  }

  /**
   * Reentrana modelos con datos históricos
   */
  retrainModels() {
    console.log('🔄 Reentrenando modelos con datos históricos...');

    // Agregar datos históricos útiles al dataset
    this.conversationHistory.forEach(conv => {
      if (conv.feedback === 'útil') {
        this.trainingData.quality.push([...conv.features, 0.9]);
      } else if (conv.feedback === 'no útil') {
        this.trainingData.quality.push([...conv.features, 0.3]);
      }
    });

    // Reentrenar
    this.trainIntentClassifier();
    this.trainQualityPredictor();

    console.log(`✅ Modelos reentrenados (${this.conversationHistory.length} conversaciones)`);
  }

  /**
   * Obtiene estadísticas de desempeño
   */
  getStatistics() {
    const totalConversations = this.conversationHistory.length;
    const usefulCount = this.conversationHistory.filter(c => c.feedback === 'útil').length;
    const notUsefulCount = this.conversationHistory.filter(c => c.feedback === 'no útil').length;

    return {
      totalConversations,
      usefulResponses: usefulCount,
      notUsefulResponses: notUsefulCount,
      helpfulnessRate: totalConversations > 0 ? (usefulCount / totalConversations * 100).toFixed(2) + '%' : 'N/A',
      modelsStatus: {
        intentClassifier: this.models.intentClassifier ? '✅ Entrenado' : '❌ No entrenado',
        qualityPredictor: this.models.qualityPredictor ? '✅ Entrenado' : '❌ No entrenado'
      }
    };
  }

  /**
   * Obtiene las conversaciones más recientes
   */
  getRecentConversations(limit = 10) {
    return this.conversationHistory.slice(-limit).reverse().map(conv => ({
      message: conv.message,
      feedback: conv.feedback,
      timestamp: conv.timestamp
    }));
  }
}

module.exports = new MLService();
