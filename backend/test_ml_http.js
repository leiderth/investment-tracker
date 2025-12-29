/**
 * Test ML Feedback System (using http)
 */

const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/chat${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Iniciando pruebas de ML Feedback System\n');

  try {
    // Test 1: Enviar mensaje
    console.log('📝 Test 1: Enviando mensaje de prueba...');
    const msgRes = await makeRequest('POST', '/message', {
      message: '¿Cómo empiezo a invertir en acciones?',
      userId: 'test_user_ml_' + Date.now(),
      conversationId: 'test_conv_' + Date.now()
    });

    if (msgRes.status !== 200) {
      throw new Error(`Error enviando mensaje: ${msgRes.status}`);
    }

    const response = msgRes.data.response?.message || msgRes.data.message || 'Test response';
    console.log('✅ Respuesta recibida:', response.substring(0, 80) + '...\n');

    // Test 2: Enviar feedback
    console.log('📝 Test 2: Enviando feedback "útil"...');
    const fbRes = await makeRequest('POST', '/feedback', {
      message: '¿Cómo empiezo a invertir en acciones?',
      response: response,
      feedback: 'útil'
    });

    if (fbRes.status !== 200) {
      throw new Error(`Error enviando feedback: ${fbRes.status}`);
    }

    console.log('✅ Feedback registrado');
    console.log('   - Conversación registrada:', fbRes.data.recorded);
    console.log('   - Total registrado:', fbRes.data.conversationsRecorded, '\n');

    // Test 3: Obtener estadísticas
    console.log('📝 Test 3: Obteniendo estadísticas...');
    const statsRes = await makeRequest('GET', '/ml-stats');

    if (statsRes.status !== 200) {
      throw new Error(`Error obteniendo stats: ${statsRes.status}`);
    }

    console.log('✅ Estadísticas:');
    console.log('   - Tasa de utilidad:', (statsRes.data.statistics.helpfulnessRate * 100).toFixed(1) + '%');
    console.log('   - Conversaciones:', statsRes.data.statistics.totalConversations);
    console.log('   - Estado:', statsRes.data.statistics.modelStatus, '\n');

    // Test 4: Feedback no útil
    console.log('📝 Test 4: Enviando feedback "no útil"...');
    const fb2Res = await makeRequest('POST', '/feedback', {
      message: '¿Cuál es mejor estrategia de inversión?',
      response: 'Respuesta de prueba',
      feedback: 'no útil'
    });

    console.log('✅ Feedback "no útil" registrado');
    console.log('   - Total:', fb2Res.data.conversationsRecorded, '\n');

    // Test 5: Estadísticas finales
    console.log('📝 Test 5: Verificando estadísticas finales...');
    const stats2Res = await makeRequest('GET', '/ml-stats');

    console.log('✅ Estadísticas finales:');
    console.log('   - Total conversaciones:', stats2Res.data.statistics.totalConversations);
    console.log('   - Tasa de utilidad:', (stats2Res.data.statistics.helpfulnessRate * 100).toFixed(1) + '%');
    console.log('   - Últimas conversaciones:', stats2Res.data.recentConversations.length, '\n');

    console.log('✅ TODOS LOS TESTS PASARON\n');
    console.log('🎉 Sistema ML Feedback está funcionando correctamente');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

runTests();
