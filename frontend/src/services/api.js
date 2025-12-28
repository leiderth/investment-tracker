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
// DASHBOARD ENDPOINTS
// ==========================================
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getEvolution: () => api.get('/dashboard/evolution')
};

// Exportaciones individuales
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getPatrimonyEvolution = () => api.get('/dashboard/evolution');

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
export const riskAPI = {
  getPortfolioAnalysis: () => api.get('/risk/portfolio-analysis'),
  getDistribution: () => api.get('/risk/distribution')
};

export const getPortfolioRiskAnalysis = () => api.get('/risk/portfolio-analysis');
export const getRiskDistribution = () => api.get('/risk/distribution');

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
// EXPORT DEFAULT
// ==========================================
export default api;