// src/frontend/src/pages/CitasPage.jsx

/**
 * PÁGINA: Citas (Agenda)
 */

import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import apiClient from '../services/apiClient';
import '../styles/list-page.css';

export default function CitasPage() {
  const { data: citas, loading, refetch } = useFetch('/citas');
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validate = (values) => {
    const errors = {};
    if (!values.cliente_id) errors.cliente_id = 'Cliente requerido';
    if (!values.empleado_id) errors.empleado_id = 'Empleado requerido';
    if (!values.servicio_id) errors.servicio_id = 'Servicio requerido';
    if (!values.fecha) errors.fecha = 'Fecha requerida';
    if (!values.hora_inicio) errors.hora_inicio = 'Hora requerida';
    // Validar que no sea en el pasado
    const fechaHora = new Date(`${values.fecha}T${values.hora_inicio}`);
    if (fechaHora < new Date()) {
      errors.fecha = 'No puedes agendar en el pasado';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, resetForm } = useForm(
    {
      cliente_id: '',
      empleado_id: '',
      servicio_id: '',
      sucursal_id: '',
      fecha: '',
      hora_inicio: '',
    },
    async (formValues) => {
      try {
        setSubmitError(null);
        await apiClient.post('/citas', {
          ...formValues,
          sucursal_id: formValues.sucursal_id || '12345',
        });
        resetForm();
        setShowForm(false);
        refetch();
      } catch (error) {
        setSubmitError(error.mensaje || 'Error al crear cita');
      }
    },
    validate
  );

  const getEstadoBadge = (estado) => {
    const badges = {
      confirmada: 'badge-blue',
      en_proceso: 'badge-yellow',
      finalizada: 'badge-green',
      cancelada: 'badge-red',
      no_asistio: 'badge-gray',
    };
    return badges[estado] || 'badge-blue';
  };

  return (
    <div className="list-page">
      <header className="list-header">
        <h1>📅 Citas / Agenda</h1>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nueva Cita'}
        </button>
      </header>

      {/* Formulario */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="form-grid">
            {submitError && <div className="error-banner">{submitError}</div>}

            <div className="form-group">
              <label htmlFor="cliente_id">Cliente</label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={values.cliente_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.cliente_id && errors.cliente_id ? 'input-error' : ''}
              >
                <option value="">Seleccionar cliente...</option>
                <option value="1">Roberto Silva</option>
                <option value="2">Antonio Morales</option>
              </select>
              {touched.cliente_id && errors.cliente_id && (
                <span className="field-error">{errors.cliente_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="empleado_id">Empleado</label>
              <select
                id="empleado_id"
                name="empleado_id"
                value={values.empleado_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.empleado_id && errors.empleado_id ? 'input-error' : ''}
              >
                <option value="">Seleccionar empleado...</option>
                <option value="1">Carlos López</option>
                <option value="2">David Rodríguez</option>
              </select>
              {touched.empleado_id && errors.empleado_id && (
                <span className="field-error">{errors.empleado_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="servicio_id">Servicio</label>
              <select
                id="servicio_id"
                name="servicio_id"
                value={values.servicio_id}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.servicio_id && errors.servicio_id ? 'input-error' : ''}
              >
                <option value="">Seleccionar servicio...</option>
                <option value="1">Corte de Cabello</option>
                <option value="2">Afeitado</option>
                <option value="3">Corte + Afeitado</option>
              </select>
              {touched.servicio_id && errors.servicio_id && (
                <span className="field-error">{errors.servicio_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                value={values.fecha}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.fecha && errors.fecha ? 'input-error' : ''}
              />
              {touched.fecha && errors.fecha && (
                <span className="field-error">{errors.fecha}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hora_inicio">Hora</label>
              <input
                id="hora_inicio"
                type="time"
                name="hora_inicio"
                value={values.hora_inicio}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.hora_inicio && errors.hora_inicio ? 'input-error' : ''}
              />
              {touched.hora_inicio && errors.hora_inicio && (
                <span className="field-error">{errors.hora_inicio}</span>
              )}
            </div>

            <button type="submit" className="btn-primary">
              Agendar Cita
            </button>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="list-container">
        {loading ? (
          <div className="loading">Cargando citas...</div>
        ) : !citas || citas.length === 0 ? (
          <div className="empty-state">
            <p>📭 No hay citas agendadas</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Agendar primera cita
            </button>
          </div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Empleado</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>{new Date(cita.fecha).toLocaleDateString()}</td>
                  <td>{cita.hora_inicio}</td>
                  <td className="cell-strong">{cita.cliente?.nombre}</td>
                  <td>{cita.empleado?.usuario?.nombre}</td>
                  <td>{cita.servicio?.nombre}</td>
                  <td>
                    <span className={`badge ${getEstadoBadge(cita.estado)}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td className="cell-actions">
                    {cita.estado === 'confirmada' && (
                      <button className="btn-small">▶️ Comenzar</button>
                    )}
                    <button className="btn-small btn-danger">✕ Cancelar</button>
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
