/**
 * Calcula el rendimiento porcentual
 */
function calculateReturn(initial, current) {
  if (initial === 0) return 0;
  return ((current - initial) / initial) * 100;
}

/**
 * Calcula el rendimiento anualizado (CAGR)
 */
function calculateCAGR(initial, current, days) {
  if (initial === 0 || days === 0) return 0;
  const years = days / 365;
  return (Math.pow(current / initial, 1 / years) - 1) * 100;
}

/**
 * Calcula días entre dos fechas
 */
function daysBetween(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

module.exports = {
  calculateReturn,
  calculateCAGR,
  daysBetween
};