// src/frontend/src/services/apiClient.js

/**
 * CLIENTE HTTP BASE
 * Configurado con interceptores para JWT
 */

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Agregar token JWT a cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - intentar refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return apiClient.post('/auth/refresh', { refreshToken })
          .then((data) => {
            localStorage.setItem('accessToken', data.data.accessToken);
            return apiClient.request(error.config);
          })
          .catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(error);
          });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
