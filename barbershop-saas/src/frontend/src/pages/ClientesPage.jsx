// src/frontend/src/pages/ClientesPage.jsx

/**
 * PÁGINA: Clientes
 */

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import apiClient from '../services/apiClient';
import '../styles/list-page.css';

export default function ClientesPage() {
  const { data: clientes, loading, refetch } = useFetch('/clientes');
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validate = (values) => {
    const errors = {};
    if (!values.nombre) errors.nombre = 'Nombre requerido';
    if (!values.telefono) errors.telefono = 'Teléfono requerido';
    if (values.telefono && !/^[\d\-\+\(\)\s]+$/.test(values.telefono)) {
      errors.telefono = 'Teléfono inválido';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    { nombre: '', telefono: '', sucursal_id: '' },
    async (formValues) => {
      try {
        setSubmitError(null);
        await apiClient.post('/clientes', {
          ...formValues,
          sucursal_id: formValues.sucursal_id || '12345', // Usar sucursal por defecto
        });
        resetForm();
        setShowForm(false);
        refetch();
      } catch (error) {
        setSubmitError(error.mensaje || 'Error al crear cliente');
      }
    },
    validate
  );

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>👥 Clientes</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo Cliente'}
        </button>
      </header>

      {/* Formulario */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-grid">
            {submitError && <div className="error-banner">{submitError}</div>}

            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={values.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Roberto Silva"
                className={touched.nombre && errors.nombre ? 'input-error' : ''}
              />
              {touched.nombre && errors.nombre && (
                <span className="field-error">{errors.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={values.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="+1-555-1001"
                className={touched.telefono && errors.telefono ? 'input-error' : ''}
              />
              {touched.telefono && errors.telefono && (
                <span className="field-error">{errors.telefono}</span>
              )}
            </div>

            <button type="submit" className="btn-primary">
              Crear Cliente
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="list-container">
        {loading ? (
          <div className="loading">Cargando clientes...</div>
        ) : !clientes || clientes.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay clientes registrados</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Crear primer cliente
            </button>
          </div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Citas</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="cell-strong">{cliente.nombre}</td>
                  <td>{cliente.telefono}</td>
                  <td className="cell-center">{cliente.citas?.length || 0}</td>
                  <td className="cell-muted">
                    {new Date(cliente.fecha_registro).toLocaleDateString()}
                  </td>
                  <td className="cell-actions">
                    <button className="btn-small">✏️ Editar</button>
                    <button className="btn-small btn-danger">🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
