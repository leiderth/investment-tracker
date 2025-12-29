/**
 * Backend Health Check
 * Verifica si el backend está disponible
 */

const BACKEND_URL = 'http://localhost:5000';

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend no disponible:', error.message);
    return false;
  }
}

export function getBackendUrl() {
  return BACKEND_URL;
}

export function isBackendAvailable() {
  // Intenta detectar si el backend está disponible
  return typeof window !== 'undefined' && 
         localStorage.getItem('backendAvailable') !== 'false';
}
