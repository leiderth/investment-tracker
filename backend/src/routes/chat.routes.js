const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

/**
 * Rutas para el sistema conversacional FinBot
 */

// Inicia una nueva conversación
router.post('/start', chatController.startConversation.bind(chatController));

// Envía un mensaje y obtiene respuesta del bot
router.post('/message', chatController.sendMessage.bind(chatController));

// Obtiene historial de conversación
router.get('/conversation/:conversationId', chatController.getConversation.bind(chatController));

// Obtiene todas las conversaciones del usuario
router.get('/conversations', chatController.getUserConversations.bind(chatController));

// Obtiene perfil actualizado del usuario
router.get('/profile/:userId', chatController.getUserProfile.bind(chatController));

// Elimina una conversación
router.delete('/conversation/:conversationId', chatController.deleteConversation.bind(chatController));

module.exports = router;
