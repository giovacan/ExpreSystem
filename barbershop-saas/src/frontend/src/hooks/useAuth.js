// src/frontend/src/hooks/useAuth.js

/**
 * HOOK: useAuth
 * Maneja autenticación y usuario actual
 */

import { useState, useContext, createContext, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  const [usuario, setUsuario] = useState(() => authService.getUsuarioActual());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = useCallback(async (nombre_negocio, nombre_owner, email, password, password_confirmacion) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(nombre_negocio, nombre_owner, email, password, password_confirmacion);
      setUsuario(response.data.usuario);
      return response.data;
    } catch (err) {
      setError(err.mensaje || 'Error en registro');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      setUsuario(response.data.usuario);
      return response.data;
    } catch (err) {
      setError(err.mensaje || 'Error en login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUsuario(null);
    setError(null);
  }, []);

  return {
    usuario,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!usuario,
  };
}
