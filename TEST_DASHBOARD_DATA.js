/**
 * Script para revisar qué datos reales están llegando del endpoint /api/dashboard/complete
 * Ejecutar en la consola del navegador o con Node.js
 */

// Para revisar en consola del navegador (frontend):
// 1. Abre el Dashboard
// 2. Abre DevTools (F12)
// 3. Ve a Console
// 4. Ejecuta esto:

fetch('/api/dashboard/complete', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('=== DATOS COMPLETOS DEL DASHBOARD ===');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n=== STATS ===');
    console.log(data.data.stats);
    
    console.log('\n=== METRICS AVANZADAS ===');
    console.log(data.data.advancedMetrics);
    
    console.log('\n=== DISTRIBUCIÓN POR TIPO ===');
    console.log(data.data.byType);
    
    console.log('\n=== TOP INVERSIONES ===');
    console.log(data.data.topInvestments);
    
    console.log('\n=== EVOLUTION ===');
    console.log(data.data.evolution);
  })
  .catch(error => console.error('Error:', error));
