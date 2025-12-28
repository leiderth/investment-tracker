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
// TRANSACTIONS ENDPOINTS (NUEVO)
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
// EXPORT DEFAULT
// ==========================================
export default api;