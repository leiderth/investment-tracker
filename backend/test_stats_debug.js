/**
 * Debug ML stats response
 */

const http = require('http');

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/chat${path}`,
      method: method,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function debug() {
  try {
    const stats = await makeRequest('GET', '/ml-stats');
    console.log('ML Stats response:');
    console.log(JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug();
