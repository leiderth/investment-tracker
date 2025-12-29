/**
 * Test ML Feedback System
 * Prueba los endpoints de feedback y estadísticas del ML
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/chat';

async function testMLFeedback() {
  console.log('🧪 Iniciando pruebas de ML Feedback System\n');

  try {
    // Test 1: Enviar un mensaje
    console.log('📝 Test 1: Enviando mensaje de prueba...');
    const messageResponse = await axios.post(`${API_URL}/message`, {
      message: '¿Cómo empiezo a invertir en acciones?',
      userId: 'test_user_ml',
      conversationId: 'test_conv_ml'
    });

    console.log('📋 Respuesta recibida:');
    console.log('   - Estructura:', Object.keys(messageResponse.data).join(', '));
    
    // Extraer la respuesta (puede venir en diferentes campos)
    const response = messageResponse.data.message || messageResponse.data.response || messageResponse.data.reply || '';
    if (!response) {
      console.log('   - Respuesta completa:', JSON.stringify(messageResponse.data, null, 2));
      throw new Error('No se pudo extraer la respuesta del servidor');
    }

    console.log('✅ Respuesta recibida:', response.substring(0, 100) + '...\n');

    // Test 2: Enviar feedback útil
    console.log('📝 Test 2: Enviando feedback "útil"...');
    const feedbackResponse = await axios.post(`${API_URL}/feedback`, {
      message: '¿Cómo empiezo a invertir en acciones?',
      response: response,
      feedback: 'útil'
    });

    console.log('✅ Feedback registrado:', feedbackResponse.data);
    console.log('   - Conversación registrada:', feedbackResponse.data.recorded);
    console.log('   - Calidad predicha:', feedbackResponse.data.predictedQuality?.toFixed(3) || 'N/A');
    console.log('   - Total registrado:', feedbackResponse.data.totalConversations, '\n');

    // Test 3: Obtener estadísticas
    console.log('📝 Test 3: Obteniendo estadísticas del ML...');
    const statsResponse = await axios.get(`${API_URL}/ml-stats`);
    
    console.log('✅ Estadísticas del modelo:');
    console.log('   - Tasa de utilidad:', (statsResponse.data.statistics.helpfulnessRate * 100).toFixed(1) + '%');
    console.log('   - Conversaciones registradas:', statsResponse.data.statistics.totalConversations);
    console.log('   - Estado del modelo:', statsResponse.data.statistics.modelStatus);
    console.log('   - Próximo reentrenamiento en:', statsResponse.data.statistics.conversationsUntilRetrain, 'mensajes\n');

    // Test 4: Más feedback (no útil)
    console.log('📝 Test 4: Enviando feedback "no útil"...');
    const feedbackResponse2 = await axios.post(`${API_URL}/feedback`, {
      message: '¿Cuál es la mejor estrategia de inversión?',
      response: 'Respuesta de prueba para test',
      feedback: 'no útil'
    });

    console.log('✅ Feedback registrado:', feedbackResponse2.data);
    console.log('   - Total conversaciones:', feedbackResponse2.data.totalConversations, '\n');

    // Test 5: Estadísticas actualizadas
    console.log('📝 Test 5: Verificando estadísticas actualizadas...');
    const statsResponse2 = await axios.get(`${API_URL}/ml-stats`);
    
    console.log('✅ Estadísticas actualizadas:');
    console.log('   - Conversaciones totales:', statsResponse2.data.statistics.totalConversations);
    console.log('   - Tasa de utilidad:', (statsResponse2.data.statistics.helpfulnessRate * 100).toFixed(1) + '%');
    console.log('   - Últimas conversaciones registradas:', statsResponse2.data.recentConversations.length);

    if (statsResponse2.data.recentConversations.length > 0) {
      console.log('\n   📊 Últimas 3 conversaciones:');
      statsResponse2.data.recentConversations.slice(-3).forEach((conv, idx) => {
        console.log(`   ${idx + 1}. Pregunta: "${(conv.message || '').substring(0, 40)}..."`);
        console.log(`      Feedback: ${conv.feedback || 'Pendiente'}`);
      });
    }

    console.log('\n✅ TODOS LOS TESTS PASARON EXITOSAMENTE\n');
    console.log('🎉 Sistema ML Feedback está funcionando correctamente');

  } catch (error) {
    console.error('\n❌ Error en prueba:');
    console.error('   Status:', error.response?.status);
    console.error('   Data:', error.response?.data || error.message);
    process.exit(1);
  }
}

testMLFeedback();
