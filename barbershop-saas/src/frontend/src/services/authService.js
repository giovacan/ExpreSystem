// src/frontend/src/services/authService.js

/**
 * SERVICIO DE AUTENTICACIÓN
 */

import apiClient from './apiClient';

const authService = {
  /**
   * Registrar nuevo negocio
   */
  register: async (nombre_negocio, nombre_owner, email, password, password_confirmacion) => {
    try {
      const response = await apiClient.post('/auth/register', {
        nombre_negocio,
        nombre_owner,
        email,
        password,
        password_confirmacion,
      });
      
      if (response.data) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }
      
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Login con email y contraseña
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      }
      
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
  },

  /**
   * Obtener usuario actual
   */
  getUsuarioActual: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;
