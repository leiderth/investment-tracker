/**
 * Formatea números a moneda colombiana
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Formatea fechas
 */
export const formatDate = (date) => {
  return new Intl.DateFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Formatea fechas cortas (YYYY-MM-DD)
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formatea porcentajes
 */
export const formatPercent = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00%' : `${num.toFixed(2)}%`;
};

/**
 * Calcula el color según ganancia/pérdida
 */
export const getProfitColor = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Calcula el color de fondo según ganancia/pérdida
 */
export const getProfitBgColor = (value) => {
  if (value > 0) return 'bg-green-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-gray-50';
};

/**
 * Obtiene el tipo de inversión con emoji
 */
export const getInvestmentTypeDisplay = (type) => {
  const types = {
    'CDT': '🏦 CDT',
    'acciones': '📈 Acciones',
    'ETF': '📊 ETF',
    'cripto': '₿ Cripto',
    'negocio': '💼 Negocio',
    'otro': '💰 Otro'
  };
  return types[type] || type;
};

/**
 * Calcula días transcurridos
 */
export const getDaysElapsed = (startDate) => {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};