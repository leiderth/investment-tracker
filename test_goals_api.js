#!/usr/bin/env node

const http = require('http');

// Test endpoint
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibGVpZGVyLmVwYWxhY2lvc0BnbWFpbC5jb20iLCJpYXQiOjE3NjcwMzcxNTgsImV4cCI6MTc2NzY0MTk1OH0.G-9p5KfZlxkpfKKYdZZFl1-pnA95V3fKBiCfZDwEJWU';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/goals',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
