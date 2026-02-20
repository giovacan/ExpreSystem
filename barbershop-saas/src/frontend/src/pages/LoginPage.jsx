// src/frontend/src/pages/LoginPage.jsx

/**
 * PÁGINA: Login
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import '../styles/auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email requerido';
    if (!values.password) errors.password = 'Contraseña requerida';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email inválido';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm(
    { email: '', password: '' },
    async (formValues) => {
      try {
        await login(formValues.email, formValues.password);
        navigate('/dashboard');
      } catch (error) {
        console.error('Error en login:', error);
      }
    },
    validate
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🧔 Barbershop SaaS</h1>
        <p className="auth-subtitle">Gestión de Barberías y Salones</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {authError && <div className="error-banner">{authError}</div>}

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="tu@email.com"
              className={touched.email && errors.email ? 'input-error' : ''}
              disabled={loading}
            />
            {touched.email && errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={touched.password && errors.password ? 'input-error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            className="btn-primary auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Link a registro */}
        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
        </div>

        {/* Demo credentials */}
        <div className="demo-credentials">
          <p className="demo-title">Credenciales de prueba:</p>
          <p>📧 owner@barbershop.com</p>
          <p>🔑 password123</p>
        </div>
      </div>
    </div>
  );
}
