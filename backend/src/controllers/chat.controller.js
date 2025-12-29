/**
 * Chat Controller - Gestiona endpoints conversacionales de FinanceGPT Advanced
 * Usa arquitectura inteligente con análisis profundo y respuestas profesionales
 */

const financeGPTAdvanced = require('../services/financeGPT_advanced');

// Simulamos almacenamiento en memoria para sesiones
const conversationSessions = {};

class ChatController {
  /**
   * Procesa un mensaje del usuario y genera respuesta de FinanceGPT Advanced
   * POST /api/chat/message
   */
  async sendMessage(req, res) {
    try {
      const { message, userId, conversationId } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      // Obtiene o crea sesión con nueva arquitectura
      const session = financeGPTAdvanced.getOrCreateSession(userId, conversationId);

      // Análisis avanzado del mensaje
      const analysis = financeGPTAdvanced.analyzeAdvanced(message, session);

      // Genera respuesta inteligente y profesional
      const botResponse = financeGPTAdvanced.generateResponse(message, analysis, session);

      // Actualiza perfil del usuario
      financeGPTAdvanced.updateUserProfile(session, analysis);

      // Agrega mensajes al historial
      session.messages.push(
        { role: 'user', content: message, timestamp: new Date(), analysis: analysis },
        {
          role: 'assistant',
          content: botResponse.message,
          responseType: botResponse.responseType,
          timestamp: new Date()
        }
      );

      // Limita historial para rendimiento
      if (session.messages.length > 100) {
        session.messages = session.messages.slice(-100);
      }

      // Retorna respuesta mejorada
      res.json({
        success: true,
        response: {
          message: botResponse.message,
          responseType: botResponse.responseType,
          priority: botResponse.priority,
          disclaimer: botResponse.disclaimer || this.getDefaultDisclaimer(analysis.queryType),
          followUpQuestions: botResponse.followUpQuestions || [],
          requiresClarity: botResponse.requiresClarity || false,
          emotionalSupport: botResponse.emotionalSupport || false,
          dataInformed: botResponse.dataInformed || false,
          analysis: {
            queryType: analysis.queryType,
            knowledgeLevel: analysis.knowledgeLevel,
            emotionalState: analysis.emotionalState,
            complexity: analysis.complexity,
            latentNeeds: analysis.latentNeeds,
            urgencyLevel: analysis.urgencyLevel
          },
          userProfile: {
            knowledgeLevel: session.profile.knowledgeLevel,
            emotionalState: session.profile.lastEmotionalState,
            investmentHorizon: session.profile.investmentHorizon,
            topicsExplored: session.profile.topicsExplored,
            conversationTurns: session.conversationFlow.turns
          }
        },
        conversationId: session.conversationId,
        sessionMetadata: {
          messageCount: session.messages.length,
          isFirstMessage: session.messages.length === 2,
          conversationDuration: new Date() - session.profile.createdAt
        }
      });
    } catch (error) {
      console.error('Error en sendMessage:', error);
      res.status(500).json({
        error: 'Error procesando tu mensaje',
        details: error.message
      });
    }
  }

  /**
   * Retorna disclaimer por defecto según tipo de consulta
   */
  getDefaultDisclaimer(queryType) {
    const disclaimers = {
      'advisory': '⚠️ Esto es análisis educativo, no asesoría personalizada. Consulta un asesor certificado para decisiones importantes.',
      'strategic': '⚠️ Análisis educativo. Cualquier estrategia debe ser validada con un asesor profesional.',
      'analytical': '💡 Datos y análisis educativos. Las decisiones de inversión son tu responsabilidad.'
    };
    return disclaimers[queryType] || '💡 Información educativa. No es asesoría financiera personalizada.';
  }

  /**
   * Obtiene historial de conversación
   * GET /api/chat/conversation/:conversationId
   */
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id || req.query.userId;

      if (!userId || !conversationId) {
        return res.status(400).json({ error: 'userId y conversationId son requeridos' });
      }

      const sessionKey = `${userId}_${conversationId}`;
      const session = conversationSessions[sessionKey];

      if (!session) {
        return res.status(404).json({ error: 'Conversación no encontrada' });
      }

      res.json({
        success: true,
        conversation: {
          id: session.conversationId,
          messages: session.messages,
          userProfile: session.profile,
          createdAt: session.createdAt || new Date()
        }
      });
    } catch (error) {
      console.error('Error en getConversation:', error);
      res.status(500).json({ error: 'Error obteniendo conversación' });
    }
  }

  /**
   * Obtiene perfil de usuario actualizado
   * GET /api/chat/profile/:userId
   */
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      // Busca la sesión default para obtener perfil más actualizado
      const sessionKey = `${userId}_default`;
      const session = conversationSessions[sessionKey];

      if (!session) {
        return res.json({
          success: true,
          profile: {
            userId,
            knowledgeLevel: '🌿 Intermedio',
            interestedAssets: [],
            lastEmotionalState: '😊 Positivo'
          }
        });
      }

      res.json({
        success: true,
        profile: {
          userId,
          ...session.profile
        }
      });
    } catch (error) {
      console.error('Error en getUserProfile:', error);
      res.status(500).json({ error: 'Error obteniendo perfil' });
    }
  }

  /**
   * Inicia una nueva conversación
   * POST /api/chat/start
   */
  async startConversation(req, res) {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionKey = `${userId}_${conversationId}`;

      conversationSessions[sessionKey] = {
        userId,
        conversationId,
        messages: [],
        profile: {},
        createdAt: new Date()
      };

      // Mensaje de bienvenida
      const welcomeMessage = this.getWelcomeMessage();

      conversationSessions[sessionKey].messages.push({
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      });

      res.json({
        success: true,
        conversation: {
          id: conversationId,
          welcomeMessage: welcomeMessage
        }
      });
    } catch (error) {
      console.error('Error en startConversation:', error);
      res.status(500).json({ error: 'Error iniciando conversación' });
    }
  }

  /**
   * Retorna mensaje de bienvenida personalizado
   */
  getWelcomeMessage() {
    return `¡Hola! Soy FinBot 🤖, tu asistente conversacional especializado en finanzas.

Mi objetivo es hacer las finanzas accesibles a través de conversaciones naturales y comprensibles. No importa si eres principiante o tengas experiencia, estoy aquí para:

📚 Explicar conceptos financieros de forma simple
📊 Analizar mercados e inversiones
💡 Darte orientación sobre decisiones financieras  
🔍 Comparar opciones de inversión
🎓 Enseñarte estrategias de largo plazo

**¿Por dónde empezamos?** 

Puedes preguntarme sobre:
- "¿Qué es un ETF?" (educación)
- "¿Cómo está el mercado hoy?" (análisis)
- "¿Por dónde empiezo a invertir?" (asesoría)
- "¿Acciones o bonos?" (comparación)

O simplemente cuéntame sobre tu situación financiera para que entienda mejor cómo ayudarte 😊

⚠️ Recuerda: Soy educativo, no un asesor financiero certificado. Cualquier decisión de inversión es tuya.`;
  }

  /**
   * Limpia sesión de conversación
   * DELETE /api/chat/conversation/:conversationId
   */
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id || req.query.userId;

      if (!userId || !conversationId) {
        return res.status(400).json({ error: 'userId y conversationId son requeridos' });
      }

      const sessionKey = `${userId}_${conversationId}`;
      delete conversationSessions[sessionKey];

      res.json({ success: true, message: 'Conversación eliminada' });
    } catch (error) {
      console.error('Error en deleteConversation:', error);
      res.status(500).json({ error: 'Error eliminando conversación' });
    }
  }

  /**
   * Obtiene lista de conversaciones del usuario
   * GET /api/chat/conversations
   */
  async getUserConversations(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      const userConversations = Object.entries(conversationSessions)
        .filter(([key]) => key.startsWith(`${userId}_`))
        .map(([key, session]) => ({
          id: session.conversationId,
          createdAt: session.createdAt,
          messageCount: session.messages.length,
          lastMessage: session.messages[session.messages.length - 1]?.content.substring(0, 100),
          profile: session.profile
        }));

      res.json({
        success: true,
        conversations: userConversations
      });
    } catch (error) {
      console.error('Error en getUserConversations:', error);
      res.status(500).json({ error: 'Error obteniendo conversaciones' });
    }
  }
}

module.exports = new ChatController();
