/**
 * Convierte pesos a centavos
 * Ejemplo: 500000 → 50000000
 */
function tocents(amount) {
  return Math.round(amount * 100);
}

/**
 * Convierte centavos a pesos
 * Ejemplo: 50000000 → 500000
 */
function fromCents(cents) {
  return cents / 100;
}

/**
 * Formatea a moneda colombiana
 * Ejemplo: 500000 → "$500.000"
 */
function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

module.exports = { tocents, fromCents, formatCOP };