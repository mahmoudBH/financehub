// ============================================
// API Client - Axios Configuration
// ============================================
import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

// ─── API Service Functions ────────────────────

// Auth
export const authApi = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

// Users
export const usersApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: any) => api.patch('/users/me', data),
  changePassword: (data: any) => api.patch('/users/me/password', data),
  updateSettings: (data: any) => api.patch('/users/me/settings', data),
};

// Accounts
export const accountsApi = {
  getAll: () => api.get('/accounts'),
  getOne: (id: string) => api.get(`/accounts/${id}`),
  create: (data: any) => api.post('/accounts', data),
  updateStatus: (id: string, status: string) => api.patch(`/accounts/${id}/status`, { status }),
  getSummary: () => api.get('/accounts/summary'),
};

// Cards
export const cardsApi = {
  getAll: () => api.get('/cards'),
  create: (data: any) => api.post('/cards', data),
  updateStatus: (id: string, status: string) => api.patch(`/cards/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/cards/${id}`),
};

// Transfers
export const transfersApi = {
  create: (data: any) => api.post('/transfers', data),
  getAll: (params?: any) => api.get('/transfers', { params }),
  getOne: (id: string) => api.get(`/transfers/${id}`),
  cancel: (id: string) => api.patch(`/transfers/${id}/cancel`),
};

// Transactions
export const transactionsApi = {
  getAll: (params?: any) => api.get('/transactions', { params }),
  getOne: (id: string) => api.get(`/transactions/${id}`),
  getStats: (period?: string) => api.get('/transactions/stats', { params: { period } }),
  getRecent: (limit?: number) => api.get('/transactions/recent', { params: { limit } }),
  export: (params?: any) => api.get('/transactions/export', { params }),
};

// Deposits
export const depositsApi = {
  create: (data: any) => api.post('/deposits', data),
};

// Withdrawals
export const withdrawalsApi = {
  create: (data: any) => api.post('/withdrawals', data),
};

// Exchange
export const exchangeApi = {
  getRates: (base?: string) => api.get('/exchange/rates', { params: { base } }),
  preview: (from: string, to: string, amount: number) =>
    api.get('/exchange/preview', { params: { from, to, amount } }),
  convert: (data: any) => api.post('/exchange', data),
  getHistory: (params?: any) => api.get('/exchange/history', { params }),
};

// Notifications
export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  freezeUser: (id: string) => api.patch(`/admin/users/${id}/freeze`),
  unfreezeUser: (id: string) => api.patch(`/admin/users/${id}/unfreeze`),
  getAuditLogs: (params?: any) => api.get('/admin/audit-logs', { params }),
  getTransactions: (params?: any) => api.get('/admin/transactions', { params }),
};
