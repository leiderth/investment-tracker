/**
 * Simple test to check if backend is responding
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat/ml-stats',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Servidor respondiendo: ${res.statusCode}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Respuesta válida:', Object.keys(parsed).join(', '));
    } catch (e) {
      console.log('⚠️ Respuesta no es JSON:', data.substring(0, 100));
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Error de conexión:', e.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Timeout en solicitud');
  req.destroy();
  process.exit(1);
});

console.log('📡 Enviando solicitud GET /api/chat/ml-stats...');
req.end();
