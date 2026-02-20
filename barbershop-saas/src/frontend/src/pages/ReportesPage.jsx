// src/frontend/src/pages/ReportesPage.jsx

/**
 * PÁGINA: Reportes
 */

import React from 'react';
import { useFetch } from '../hooks/useFetch';
import '../styles/reportes.css';

export default function ReportesPage() {
  const { data: pagos, loading: loadingPagos } = useFetch('/pagos');
  const { data: comisiones, loading: loadingComisiones } = useFetch('/pagos/comisiones');

  const totalPagos = pagos?.reduce((sum, p) => sum + parseFloat(p.precio_final), 0) || 0;
  const totalComisiones = comisiones?.reduce((sum, c) => sum + parseFloat(c.monto), 0) || 0;

  return (
    <div className="reportes-page">
      <header className="list-header">
        <h1>📊 Reportes</h1>
      </header>

      {/* Resumen */}
      <section className="reportes-summary">
        <div className="report-card">
          <h3>Ventas Totales</h3>
          <p className="report-number">${totalPagos.toFixed(2)}</p>
          <p className="report-subtitle">Todos los tiempos</p>
        </div>
        <div className="report-card">
          <h3>Comisiones</h3>
          <p className="report-number">${totalComisiones.toFixed(2)}</p>
          <p className="report-subtitle">Pagadas a empleados</p>
        </div>
        <div className="report-card">
          <h3>Ganancia Neta</h3>
          <p className="report-number">${(totalPagos - totalComisiones).toFixed(2)}</p>
          <p className="report-subtitle">Para el negocio</p>
        </div>
      </section>

      {/* Tabla de Pagos */}
      <section className="reportes-section">
        <h2>Últimos Pagos</h2>
        {loadingPagos ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Empleado</th>
                <th>Servicio</th>
                <th>Monto</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              {pagos?.slice(0, 10).map((pago) => (
                <tr key={pago.id}>
                  <td>{new Date(pago.fecha_pago).toLocaleDateString()}</td>
                  <td>{pago.cita?.cliente?.nombre}</td>
                  <td>{pago.cita?.empleado?.usuario?.nombre}</td>
                  <td>{pago.cita?.servicio?.nombre}</td>
                  <td className="cell-price">${pago.precio_final.toFixed(2)}</td>
                  <td>
                    <span className="badge badge-blue">{pago.metodo_pago}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Tabla de Comisiones */}
      <section className="reportes-section">
        <h2>Comisiones por Empleado</h2>
        {loadingComisiones ? (
          <div className="loading">Cargando...</div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>% Comisión</th>
                <th>Monto</th>
                <th>Cita</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {comisiones?.slice(0, 10).map((comision) => (
                <tr key={comision.id}>
                  <td className="cell-strong">
                    {comision.empleado?.usuario?.nombre}
                  </td>
                  <td className="cell-center">
                    {comision.porcentaje_aplicado}%
                  </td>
                  <td className="cell-price">${comision.monto.toFixed(2)}</td>
                  <td className="cell-muted">{comision.cita?.cliente?.nombre}</td>
                  <td className="cell-muted">
                    {new Date(comision.fecha).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Botones de Exportación */}
      <section className="reportes-actions">
        <button className="btn-primary">📥 Exportar a CSV</button>
        <button className="btn-primary">🖨️ Imprimir Reporte</button>
      </section>
    </div>
  );
}
