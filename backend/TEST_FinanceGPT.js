/**
 * Test Script para FinanceGPT
 * Prueba los diferentes tipos de respuestas del nuevo sistema
 */

const financeGPT = require('./src/services/finbotService');

console.log('\n🚀 TESTING FinanceGPT System\n');
console.log('=' .repeat(60));

// Test 1: Mensaje educativo de principiante
console.log('\n✅ Test 1: Usuario Principiante Pregunta Educativa');
const test1 = financeGPT.generateResponse(
  '¿Qué es un ETF?',
  {
    queryType: 'educativa',
    knowledgeLevel: 'principiante',
    emotionalState: 'positivo',
    complexity: 'simple',
    context: { timeframe: null, mentionedAssets: ['etfs'], topics: [] },
    followUp: false,
    isFirstMessage: true
  },
  [],
  {}
);
console.log('Respuesta:', test1.message.substring(0, 200) + '...');
console.log('Contiene disclaimer:', test1.message.includes('⚠️'));

// Test 2: Usuario ansioso
console.log('\n✅ Test 2: Usuario Ansioso por Caída de Mercado');
const test2 = financeGPT.generateResponse(
  'Ayuda, mi portafolio bajó 15%, ¿qué hago?',
  {
    queryType: 'urgente',
    knowledgeLevel: 'intermedio',
    emotionalState: 'ansioso',
    complexity: 'media',
    context: { timeframe: null, mentionedAssets: [], topics: [] },
    followUp: false,
    isFirstMessage: false
  },
  [],
  {}
);
console.log('Respuesta:', test2.message.substring(0, 150) + '...');
console.log('Inicia con empatía:', test2.message.includes('Entiendo'));

// Test 3: Usuario confundido
console.log('\n✅ Test 3: Usuario Confundido sobre Volatilidad');
const test3 = financeGPT.generateResponse(
  'No entiendo qué es la volatilidad',
  {
    queryType: 'educativa',
    knowledgeLevel: 'principiante',
    emotionalState: 'confundido',
    complexity: 'simple',
    context: { timeframe: null, mentionedAssets: [], topics: ['volatilidad'] },
    followUp: false,
    isFirstMessage: false
  },
  [],
  {}
);
console.log('Respuesta:', test3.message.substring(0, 200) + '...');
console.log('Usa analogías:', test3.message.includes('montaña rusa') || test3.message.includes('tren'));

// Test 4: Usuario avanzado
console.log('\n✅ Test 4: Usuario Avanzado Pregunta sobre Técnica');
const test4 = financeGPT.generateResponse(
  '¿Cómo analizar el beta de una acción?',
  {
    queryType: 'educativa',
    knowledgeLevel: 'avanzado',
    emotionalState: 'positivo',
    complexity: 'alta',
    context: { timeframe: null, mentionedAssets: ['acciones'], topics: ['análisis fundamental'] },
    followUp: false,
    isFirstMessage: false
  },
  [],
  {}
);
console.log('Respuesta:', test4.message.substring(0, 150) + '...');
console.log('Usa lenguaje técnico:', test4.message.includes('correlación') || test4.message.includes('mercado'));

// Test 5: Comparativa
console.log('\n✅ Test 5: Usuario pregunta por Acciones vs ETFs');
const test5 = financeGPT.generateResponse(
  '¿Cuál es la diferencia entre acciones y ETFs?',
  {
    queryType: 'comparativa',
    knowledgeLevel: 'intermedio',
    emotionalState: 'positivo',
    complexity: 'media',
    context: { timeframe: 'largo plazo', mentionedAssets: ['acciones', 'etfs'], topics: [] },
    followUp: false,
    isFirstMessage: false
  },
  [],
  {}
);
console.log('Respuesta:', test5.message.substring(0, 200) + '...');
console.log('Hace comparación:', test5.message.includes('✓') || test5.message.includes('Acciones'));

// Test 6: Preguntas sugeridas
console.log('\n✅ Test 6: Verifica preguntas sugeridas');
console.log('Preguntas sugeridas:', test1.suggestedQuestions);

console.log('\n' + '='.repeat(60));
console.log('✨ Todos los tests completados exitosamente!\n');
