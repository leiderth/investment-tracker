/**
 * ChatFinBot - Sistema Conversacional de IA Financiera estilo ChatGPT
 * Interfaz limpia, profesional y minimalista
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Plus, MessageSquare, Settings } from 'lucide-react';
import './ChatFinBot.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ChatFinBot() {
  // Estado principal
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [feedbackStates, setFeedbackStates] = useState({});
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Envía un mensaje al FinBot
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    try {
      const userId = localStorage.getItem('userId') || `user_${Date.now()}`;
      localStorage.setItem('userId', userId);

      let currentConvId = conversationId;
      if (!currentConvId) {
        currentConvId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(currentConvId);
      }

      // Agrega mensaje del usuario
      const userMsg = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMsg]);
      setInputMessage('');
      setShowWelcome(false);
      setIsLoading(true);

      // Envía al servidor
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        message: inputMessage,
        userId: userId,
        conversationId: currentConvId
      });

      if (response.data.success) {
        const botResponse = response.data.response;

        // Agrega respuesta del bot
        const botMsg = {
          role: 'assistant',
          content: botResponse.message,
          timestamp: new Date(),
          analysis: botResponse.analysis,
          disclaimer: botResponse.disclaimer,
          suggestedQuestions: botResponse.suggestedQuestions
        };

        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMsg = {
        role: 'assistant',
        content: 'Disculpa, hubo un error procesando tu pregunta. Por favor, intenta de nuevo.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia una nueva conversación
   */
  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setInputMessage('');
    setShowWelcome(true);
  };

  /**
   * Inserta una pregunta de ejemplo
   */
  const handleExampleQuestion = (question) => {
    setInputMessage(question);
  };

  /**
   * Maneja el feedback del usuario en las respuestas (ML)
   */
  const handleFeedback = async (messageIndex, feedback) => {
    try {
      if (messageIndex < 1) return; // Saltar si no hay mensaje anterior
      
      const userMessage = messages[messageIndex - 1];
      const aiMessage = messages[messageIndex];

      if (userMessage.role !== 'user' || aiMessage.role !== 'assistant') return;

      // Enviar feedback al backend para ML
      const response = await axios.post(`${API_BASE_URL}/chat/feedback`, {
        message: userMessage.content,
        response: aiMessage.content,
        feedback: feedback === 'useful' ? 'útil' : 'no útil'
      });

      // Actualizar estado de feedback
      setFeedbackStates((prev) => ({
        ...prev,
        [messageIndex]: feedback
      }));

      console.log('✅ Feedback registrado:', response.data);
    } catch (error) {
      console.error('Error registrando feedback:', error);
    }
  };

  /**
   * Renderiza un mensaje
   */
  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    const isError = msg.isError;

    if (isUser) {
      return (
        <div className="message-group user-message-group">
          <div className="user-message-content">
            <p className="message-text">{msg.content}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="message-group bot-message-group">
        <div className="bot-avatar">
          <div className="avatar-icon">📊</div>
        </div>
        <div className="bot-message-content">
          {isError ? (
            <p className="message-error">{msg.content}</p>
          ) : (
            <>
              <p className="message-text">{msg.content}</p>

              {msg.analysis && (
                <div className="message-analysis">
                  <div className="analysis-badge">
                    <span className="analysis-label">Análisis:</span>
                    <span>{msg.analysis.queryType}</span>
                  </div>
                </div>
              )}

              {msg.disclaimer && (
                <div className="message-disclaimer">
                  <p>{msg.disclaimer}</p>
                </div>
              )}

              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="suggested-questions">
                  {msg.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="suggested-question-btn"
                      onClick={() => handleExampleQuestion(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* ML Feedback Buttons */}
              <div className="message-feedback">
                <span className="feedback-label">¿Te fue útil?</span>
                <button
                  className={`feedback-btn ${feedbackStates[messages.indexOf(msg)] === 'useful' ? 'active-useful' : ''}`}
                  onClick={() => handleFeedback(messages.indexOf(msg), 'useful')}
                  title="Esta respuesta fue útil"
                >
                  👍 Útil
                </button>
                <button
                  className={`feedback-btn ${feedbackStates[messages.indexOf(msg)] === 'not-useful' ? 'active-not-useful' : ''}`}
                  onClick={() => handleFeedback(messages.indexOf(msg), 'not-useful')}
                  title="Esta respuesta no fue útil"
                >
                  👎 No útil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Preguntas de ejemplo para la pantalla de bienvenida
  const exampleQuestions = [
    '¿Cómo empiezo a invertir si soy principiante?',
    '¿Cuál es la diferencia entre acciones y ETFs?',
    'Mi portafolio bajó 15%, ¿qué debo hacer?',
    '¿Cómo diversificar mis inversiones de forma correcta?'
  ];

  return (
    <div className="finbot-page">
      {/* Sidebar */}
      <aside className={`finbot-sidebar ${!showSidebar ? 'hidden' : ''}`}>
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewConversation}>
            <Plus size={20} />
            <span>Nueva conversación</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="chat-history">
            <h3>Historial</h3>
            <p className="empty-state">No hay conversaciones anteriores</p>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-btn">
            <Settings size={18} />
            <span>Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="finbot-main">
        <div className="chat-container">
          {showWelcome ? (
            <div className="welcome-section">
              <div className="welcome-header">
                <h1>FinanceGPT</h1>
                <p>Tu asistente de investTracker especializado en finanzas</p>
              </div>

              <div className="examples-grid">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="example-card"
                    onClick={() => handleExampleQuestion(q)}
                  >
                    <div className="example-icon">✨</div>
                    <p>{q}</p>
                  </button>
                ))}
              </div>

              <div className="welcome-footer">
                <p>FinBot puede cometer errores. Considera verificar información importante.</p>
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {renderMessage(msg)}
                </div>
              ))}

              {isLoading && (
                <div className="message-group bot-message-group">
                  <div className="bot-avatar">
                    <div className="avatar-icon">📊</div>
                  </div>
                  <div className="bot-message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-section">
          <form className="chat-form" onSubmit={handleSendMessage}>
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pregunta sobre finanzas, inversiones, mercados..."
                disabled={isLoading}
                className="chat-input"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          <p className="input-footer">
            FinanceGPT proporciona información educativa, no asesoría financiera personalizada.
          </p>
        </div>
      </main>

      {/* Toggle Sidebar Button */}
      <button
        className="toggle-sidebar-btn"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <MessageSquare size={20} />
      </button>
    </div>
  );
}
