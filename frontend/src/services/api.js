// frontend/src/services/api.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH ENDPOINTS
// ==========================================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Exportaciones individuales para compatibilidad
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// ==========================================
// PROFILE ENDPOINTS
// ==========================================
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/change-password', data),
  uploadProfilePicture: (formData) => api.post('/profile/upload-picture', formData),
  getSecurityLogs: () => api.get('/profile/security-logs'),
  getProfilePicture: (userId) => api.get(`/profile/picture/${userId}`)
};

// Exportaciones individuales de Profile
export const getUserProfile = () => api.get('/profile');
export const updateUserProfile = (data) => api.put('/profile', data);
export const changeUserPassword = (data) => api.post('/profile/change-password', data);
export const uploadUserProfilePicture = (formData) => api.post('/profile/upload-picture', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
export const getUserSecurityLogs = () => api.get('/profile/security-logs');
export const getUserProfilePicture = (userId) => api.get(`/profile/picture/${userId}`);

// ==========================================
// INVESTMENTS ENDPOINTS
// ==========================================
export const investmentsAPI = {
  getAll: (params) => api.get('/investments', { params }),
  getOne: (id) => api.get(`/investments/${id}`),
  create: (data) => api.post('/investments', data),
  update: (id, data) => api.put(`/investments/${id}`, data),
  delete: (id) => api.delete(`/investments/${id}`)
};

// Exportaciones individuales
export const getInvestments = (params) => api.get('/investments', { params });
export const getInvestment = (id) => api.get(`/investments/${id}`);
export const createInvestment = (data) => api.post('/investments', data);
export const updateInvestment = (id, data) => api.put(`/investments/${id}`, data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);

// ==========================================
// TRANSACTIONS ENDPOINTS
// ==========================================
export const transactionsAPI = {
  create: (investmentId, data) => api.post(`/investments/${investmentId}/transactions`, data),
  getAll: (investmentId) => api.get(`/investments/${investmentId}/transactions`),
  delete: (transactionId) => api.delete(`/transactions/${transactionId}`)
};

// Exportaciones individuales
export const createTransaction = (investmentId, data) => 
  api.post(`/investments/${investmentId}/transactions`, data);

export const getTransactions = (investmentId) => 
  api.get(`/investments/${investmentId}/transactions`);

export const deleteTransaction = (transactionId) => 
  api.delete(`/transactions/${transactionId}`);

// ==========================================
// RISK ENDPOINTS
// ==========================================
export const riskAPI = {
  getPortfolioAnalysis: () => api.get('/risk/portfolio-analysis'),
  getDistribution: () => api.get('/risk/distribution')
};

export const getPortfolioRiskAnalysis = () => api.get('/risk/portfolio-analysis');
export const getRiskDistribution = () => api.get('/risk/distribution');

// ==========================================
// DASHBOARD ENDPOINTS - COMPREHENSIVE
// ==========================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getEvolution: (days) => api.get('/dashboard/evolution', { params: { days } }),
  getRiskAnalysis: () => api.get('/dashboard/risk-analysis'),
  getAdvancedMetrics: () => api.get('/dashboard/advanced-metrics')
};

// Exportaciones individuales de Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardEvolution = (days) => api.get('/dashboard/evolution', { params: { days } });
export const getDashboardRiskAnalysis = () => api.get('/dashboard/risk-analysis');
export const getAdvancedMetrics = () => api.get('/analytics/metrics');
export const getPatrimonyEvolution = (days) => api.get('/dashboard/evolution', { params: { days } });

// ==========================================
// SIMULATIONS ENDPOINTS
// ==========================================
export const simulationsAPI = {
  calculate: (data) => api.post('/simulations/calculate', data),
  compare: (data) => api.post('/simulations/compare', data),
  requiredContribution: (data) => api.post('/simulations/required-contribution', data),
  save: (data) => api.post('/simulations', data),
  getAll: () => api.get('/simulations'),
  delete: (id) => api.delete(`/simulations/${id}`)
};

// Exportaciones individuales
export const calculateSimulation = (data) => api.post('/simulations/calculate', data);
export const compareScenarios = (data) => api.post('/simulations/compare', data);
export const calculateRequiredContribution = (data) => api.post('/simulations/required-contribution', data);
export const saveSimulation = (data) => api.post('/simulations', data);
export const getSimulations = () => api.get('/simulations');
export const deleteSimulation = (id) => api.delete(`/simulations/${id}`);

// ==========================================
// FINANCIAL GOALS ENDPOINTS
// ==========================================
export const goalsAPI = {
  getAll: (filters) => api.get('/goals', { params: filters }),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getProgress: (id) => api.get(`/goals/${id}/progress`),
  addProgress: (id, data) => api.post(`/goals/${id}/add-progress`, data),
  analyzeFeasibility: (id, data) => api.post(`/goals/${id}/analyze-feasibility`, data)
};

// Exportaciones individuales de Goals
export const getGoals = (filters) => api.get('/goals', { params: filters });
export const getGoal = (id) => api.get(`/goals/${id}`);
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const getGoalProgress = (id) => api.get(`/goals/${id}/progress`);
export const addGoalProgress = (id, data) => api.post(`/goals/${id}/add-progress`, data);
export const analyzeGoalFeasibility = (id, data) => api.post(`/goals/${id}/analyze-feasibility`, data);

// ==========================================
// CURRENCY / MULTIMONEDA ENDPOINTS
// ==========================================
export const currencyAPI = {
  getAllRates: () => api.get('/currency/rates'),
  getRate: (from, to) => api.get(`/currency/rate/${from}/${to}`),
  convert: (data) => api.post('/currency/convert', data),
  getHistory: (from, to, days = 30) => api.get(`/currency/history/${from}/${to}`, { params: { days } }),
  getSupportedCurrencies: () => api.get('/currency/supported'),
  getUserPreferences: () => api.get('/currency/user-preferences'),
  updateUserPreferences: (data) => api.put('/currency/user-preferences', data),
  getPortfolioInCurrencies: (baseCurrency = 'USD') => api.get('/currency/portfolio', { params: { baseCurrency } }),
  convertPortfolioTo: (data) => api.post('/currency/portfolio/convert', data),
  updateRate: (from, to, rate) => api.put(`/currency/rate/${from}/${to}`, { rate })
};

// Exportaciones individuales de Currency
export const getAllExchangeRates = () => api.get('/currency/rates');
export const getExchangeRate = (from, to) => api.get(`/currency/rate/${from}/${to}`);
export const convertCurrency = (amount, from, to) => api.post('/currency/convert', { amount, from, to });
export const getExchangeHistory = (from, to, days = 30) => api.get(`/currency/history/${from}/${to}`, { params: { days } });
export const getCurrencies = () => api.get('/currency/supported');
export const getCurrencyPreferences = () => api.get('/currency/user-preferences');
export const saveCurrencyPreferences = (data) => api.put('/currency/user-preferences', data);
export const getPortfolioMultiCurrency = (baseCurrency = 'USD') => api.get('/currency/portfolio', { params: { baseCurrency } });
export const convertPortfolio = (data) => api.post('/currency/portfolio/convert', data);

// ==========================================
// EXPORT DEFAULT
// ==========================================
export default api;