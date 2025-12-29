/**
 * Debug test - check response structure
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

async function debug() {
  try {
    console.log('📝 Enviando mensaje...');
    const res = await makeRequest('POST', '/message', {
      message: '¿Cómo empiezo a invertir?',
      userId: 'debug_user',
      conversationId: 'debug_conv'
    });

    console.log('Status:', res.status);
    console.log('Data type:', typeof res.data);
    console.log('Data keys:', Object.keys(res.data).join(', '));
    console.log('\nRespuesta completa:');
    console.log(JSON.stringify(res.data, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug();
