// src/frontend/src/pages/RegisterPage.jsx

/**
 * PÁGINA: Register
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';
import '../styles/auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();

  const validate = (values) => {
    const errors = {};
    if (!values.nombre_negocio) errors.nombre_negocio = 'Nombre del negocio requerido';
    if (!values.nombre_owner) errors.nombre_owner = 'Nombre del propietario requerido';
    if (!values.email) errors.email = 'Email requerido';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = 'Email inválido';
    }
    if (!values.password) errors.password = 'Contraseña requerida';
    if (values.password && values.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres';
    }
    if (values.password !== values.password_confirmacion) {
      errors.password_confirmacion = 'Las contraseñas no coinciden';
    }
    if (!values.terminos) errors.terminos = 'Debes aceptar los términos';
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm(
    {
      nombre_negocio: '',
      nombre_owner: '',
      email: '',
      password: '',
      password_confirmacion: '',
      terminos: false,
    },
    async (formValues) => {
      try {
        await register(
          formValues.nombre_negocio,
          formValues.nombre_owner,
          formValues.email,
          formValues.password,
          formValues.password_confirmacion
        );
        navigate('/dashboard');
      } catch (error) {
        console.error('Error en registro:', error);
      }
    },
    validate
  );

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h1 className="auth-title">🧔 Crear Cuenta</h1>
        <p className="auth-subtitle">Comienza a gestionar tu barbería</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {authError && <div className="error-banner">{authError}</div>}

          {/* Nombre Negocio */}
          <div className="form-group">
            <label htmlFor="nombre_negocio">Nombre del Negocio</label>
            <input
              id="nombre_negocio"
              type="text"
              name="nombre_negocio"
              value={values.nombre_negocio}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mi Barberría Premium"
              className={touched.nombre_negocio && errors.nombre_negocio ? 'input-error' : ''}
              disabled={loading}
            />
            {touched.nombre_negocio && errors.nombre_negocio && (
              <span className="field-error">{errors.nombre_negocio}</span>
            )}
          </div>

          {/* Nombre Owner */}
          <div className="form-group">
            <label htmlFor="nombre_owner">Tu Nombre</label>
            <input
              id="nombre_owner"
              type="text"
              name="nombre_owner"
              value={values.nombre_owner}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Juan Pérez"
              className={touched.nombre_owner && errors.nombre_owner ? 'input-error' : ''}
              disabled={loading}
            />
            {touched.nombre_owner && errors.nombre_owner && (
              <span className="field-error">{errors.nombre_owner}</span>
            )}
          </div>

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
            <input
              id="password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={touched.password && errors.password ? 'input-error' : ''}
              disabled={loading}
            />
            {touched.password && errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="password_confirmacion">Confirmar Contraseña</label>
            <input
              id="password_confirmacion"
              type="password"
              name="password_confirmacion"
              value={values.password_confirmacion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              className={touched.password_confirmacion && errors.password_confirmacion ? 'input-error' : ''}
              disabled={loading}
            />
            {touched.password_confirmacion && errors.password_confirmacion && (
              <span className="field-error">{errors.password_confirmacion}</span>
            )}
          </div>

          {/* Términos */}
          <div className="form-group checkbox">
            <input
              id="terminos"
              type="checkbox"
              name="terminos"
              checked={values.terminos}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="terminos">Acepto los términos y condiciones</label>
            {touched.terminos && errors.terminos && (
              <span className="field-error">{errors.terminos}</span>
            )}
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            className="btn-primary auth-button"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        {/* Link a login */}
        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
}
