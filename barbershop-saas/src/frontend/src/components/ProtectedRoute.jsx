// src/frontend/src/components/ProtectedRoute.jsx

/**
 * COMPONENTE: ProtectedRoute
 * Protege rutas que requieren autenticación
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
