import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  lastLogin: string;
  isActive: boolean;
}

export interface Email {
  id: number;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  size: number;
  body: string;
  htmlBody?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  flags: string[];
  isRead: boolean;
  isImportant: boolean;
  folder: string;
}

export interface EmailStats {
  totalEmails: number;
  unreadEmails: number;
  importantEmails: number;
  recentEmails: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEmails: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EmailsResponse {
  emails: Email[];
  pagination: PaginationInfo;
}

// Auth API
export const authAPI = {
  getGoogleAuthUrl: () => api.get('/auth/google'),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Emails API
export const emailsAPI = {
  syncEmails: (limit?: number) => api.post('/emails/sync', { limit }),
  getEmails: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    folder?: string;
  }) => api.get('/emails', { params }),
  getEmail: (id: string) => api.get(`/emails/${id}`),
  markAsRead: (id: string, isRead: boolean) => api.patch(`/emails/${id}/read`, { isRead }),
  markAsImportant: (id: string, isImportant: boolean) => api.patch(`/emails/${id}/important`, { isImportant }),
  deleteEmail: (id: string) => api.delete(`/emails/${id}`),
  getStats: () => api.get('/emails/stats/summary'),
};

export default api;
