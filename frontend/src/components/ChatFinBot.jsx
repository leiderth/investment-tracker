/**
 * ChatFinBot Component - Chat conversacional con FinanceGPT Advanced
 * Incluye soporte para ML feedback
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, ThumbsUp, ThumbsDown, Loader } from 'lucide-react';

const ChatFinBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(`user_${Date.now()}`);
  const [conversationId] = useState(`conv_${Date.now()}`);
  const [conversationActive, setConversationActive] = useState(false);
  const [feedbackStates, setFeedbackStates] = useState({});
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:5000/api/chat';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/start`, {
        userId,
        conversationId
      });

      setConversationActive(true);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: '👋 ¡Hola! Soy FinanceGPT, tu asistente de IA especializado en finanzas. ¿En qué puedo ayudarte hoy?',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error iniciando conversación:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversationActive) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Agregar mensaje del usuario
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/message`, {
        message: userMessage,
        userId,
        conversationId
      });

      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
        analysis: response.data.analysis,
        responseType: response.data.responseType
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Registrar en ML para entrenamiento futuro
      if (response.data.message) {
        mlService.recordForTraining(userMessage, response.data.message);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      const errorMsg = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: '❌ Error: No pude procesar tu mensaje. Intenta de nuevo.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (messageId, feedback) => {
    const message = messages.find((m) => m.role === 'user' && m.id.includes('msg'));
    const response = messages.find((m) => m.role === 'assistant' && m.id === messageId);

    if (!message || !response) return;

    try {
      const result = await axios.post(`${API_URL}/feedback`, {
        message: message.content,
        response: response.content,
        feedback: feedback === 'useful' ? 'útil' : 'no útil'
      });

      // Actualizar estado de feedback
      setFeedbackStates((prev) => ({
        ...prev,
        [messageId]: feedback
      }));

      console.log('✅ Feedback registrado:', result.data);
    } catch (error) {
      console.error('Error registrando feedback:', error);
    }
  };

  if (!conversationActive) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">FinanceGPT</h1>
          <p className="text-lg text-slate-600 mb-8">
            Tu asistente de IA especializado en finanzas, nivel Claude
          </p>
          <button
            onClick={startConversation}
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Iniciando...' : '🚀 Comenzar Conversación'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">💬 FinanceGPT Advanced</h1>
        <p className="text-sm text-slate-300">Asistente inteligente especializado en finanzas</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-900 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Feedback Buttons para respuestas del asistente */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-300">
                  <span className="text-xs text-slate-600">¿Útil?</span>
                  <button
                    onClick={() => handleFeedback(msg.id, 'useful')}
                    className={`p-1 rounded transition ${
                      feedbackStates[msg.id] === 'useful'
                        ? 'bg-green-500 text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Esta respuesta fue útil"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, 'not-useful')}
                    className={`p-1 rounded transition ${
                      feedbackStates[msg.id] === 'not-useful'
                        ? 'bg-red-500 text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Esta respuesta no fue útil"
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
              <Loader className="animate-spin" size={20} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-slate-50">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregunta sobre finanzas..."
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2"
          >
            <Send size={18} />
            Enviar
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          💡 El sistema aprende de tu feedback para mejorar respuestas
        </p>
      </div>
    </div>
  );
};

// Helper para ML
const mlService = {
  recordForTraining: (message, response) => {
    // Guardar localmente para referencia
    if (window.localStorage) {
      const history = JSON.parse(localStorage.getItem('mlHistory') || '[]');
      history.push({
        message,
        response,
        timestamp: new Date()
      });
      localStorage.setItem('mlHistory', JSON.stringify(history.slice(-100)));
    }
  }
};

export default ChatFinBot;
