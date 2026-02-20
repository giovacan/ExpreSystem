// src/frontend/src/pages/ServiciosPage.jsx

/**
 * PÁGINA: Servicios
 */

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import apiClient from '../services/apiClient';
import '../styles/list-page.css';

export default function ServiciosPage() {
  const { data: servicios, loading, refetch } = useFetch('/servicios');
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validate = (values) => {
    const errors = {};
    if (!values.nombre) errors.nombre = 'Nombre requerido';
    if (!values.precio_base || values.precio_base <= 0) {
      errors.precio_base = 'Precio debe ser mayor a 0';
    }
    if (!values.duracion_minutos || values.duracion_minutos <= 0) {
      errors.duracion_minutos = 'Duración debe ser mayor a 0';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    { nombre: '', precio_base: '', duracion_minutos: '', sucursal_id: '' },
    async (formValues) => {
      try {
        setSubmitError(null);
        await apiClient.post('/servicios', {
          ...formValues,
          precio_base: parseFloat(formValues.precio_base),
          duracion_minutos: parseInt(formValues.duracion_minutos),
          sucursal_id: formValues.sucursal_id || '12345',
        });
        resetForm();
        setShowForm(false);
        refetch();
      } catch (error) {
        setSubmitError(error.mensaje || 'Error al crear servicio');
      }
    },
    validate
  );

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>✂️ Servicios</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nuevo Servicio'}
        </button>
      </header>

      {/* Formulario */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-grid">
            {submitError && <div className="error-banner">{submitError}</div>}

            <div className="form-group">
              <label htmlFor="nombre">Nombre del Servicio</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={values.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Corte de Cabello"
                className={touched.nombre && errors.nombre ? 'input-error' : ''}
              />
              {touched.nombre && errors.nombre && (
                <span className="field-error">{errors.nombre}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="precio_base">Precio ($)</label>
              <input
                id="precio_base"
                type="number"
                name="precio_base"
                value={values.precio_base}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="25.00"
                step="0.01"
                className={touched.precio_base && errors.precio_base ? 'input-error' : ''}
              />
              {touched.precio_base && errors.precio_base && (
                <span className="field-error">{errors.precio_base}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="duracion_minutos">Duración (minutos)</label>
              <input
                id="duracion_minutos"
                type="number"
                name="duracion_minutos"
                value={values.duracion_minutos}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="30"
                className={touched.duracion_minutos && errors.duracion_minutos ? 'input-error' : ''}
              />
              {touched.duracion_minutos && errors.duracion_minutos && (
                <span className="field-error">{errors.duracion_minutos}</span>
              )}
            </div>

            <button type="submit" className="btn-primary">
              Crear Servicio
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="list-container">
        {loading ? (
          <div className="loading">Cargando servicios...</div>
        ) : !servicios || servicios.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay servicios registrados</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Crear primer servicio
            </button>
          </div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Citas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td className="cell-strong">{servicio.nombre}</td>
                  <td className="cell-price">${servicio.precio_base.toFixed(2)}</td>
                  <td className="cell-center">{servicio.duracion_minutos} min</td>
                  <td className="cell-center">{servicio._count?.citas || 0}</td>
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
