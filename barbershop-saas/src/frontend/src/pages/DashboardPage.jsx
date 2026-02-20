// src/frontend/src/pages/DashboardPage.jsx

/**
 * PÁGINA: Dashboard Principal
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/dashboard.css';

export default function DashboardPage() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Bienvenido, {usuario.nombre}</span>
          <span className="badge badge-{usuario.rol}">{usuario.rol}</span>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <h3>Citas Hoy</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Clientes</h3>
          <p className="stat-number">248</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h3>Ingresos</h3>
          <p className="stat-number">$1,250</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h3>Calificación</h3>
          <p className="stat-number">4.8/5</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="actions-section">
        <h2>Accesos Rápidos</h2>
        <div className="actions-grid">
          <Link to="/agenda" className="action-card">
            <div className="action-icon">📅</div>
            <h3>Agenda</h3>
            <p>Ver y gestionar citas</p>
          </Link>

          <Link to="/clientes" className="action-card">
            <div className="action-icon">👥</div>
            <h3>Clientes</h3>
            <p>Registros y contactos</p>
          </Link>

          <Link to="/servicios" className="action-card">
            <div className="action-icon">✂️</div>
            <h3>Servicios</h3>
            <p>Administrar ofertas</p>
          </Link>

          <Link to="/empleados" className="action-card">
            <div className="action-icon">💼</div>
            <h3>Empleados</h3>
            <p>Equipo y horarios</p>
          </Link>

          <Link to="/reportes" className="action-card">
            <div className="action-icon">📊</div>
            <h3>Reportes</h3>
            <p>Análisis y ganancias</p>
          </Link>

          {usuario.rol === 'owner' && (
            <Link to="/configuracion" className="action-card">
              <div className="action-icon">⚙️</div>
              <h3>Configuración</h3>
              <p>Ajustes del negocio</p>
            </Link>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="activity-section">
        <h2>Actividad Reciente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-badge">✅</div>
            <div className="activity-content">
              <p className="activity-title">Cita completada</p>
              <p className="activity-time">Hace 2 horas - Carlos López</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-badge">💰</div>
            <div className="activity-content">
              <p className="activity-title">Pago registrado $50.00</p>
              <p className="activity-time">Hace 1 hora - Tarjeta</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-badge">👤</div>
            <div className="activity-content">
              <p className="activity-title">Nuevo cliente</p>
              <p className="activity-time">Hace 30 minutos - Roberto Silva</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
