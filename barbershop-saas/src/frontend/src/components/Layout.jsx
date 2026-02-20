// src/frontend/src/components/Layout.jsx

/**
 * COMPONENTE: Layout Principal
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';

export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🧔 Barbershop</h2>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/agenda" className="nav-item">
            <span className="nav-icon">📅</span>
            <span>Agenda</span>
          </Link>

          <Link to="/clientes" className="nav-item">
            <span className="nav-icon">👥</span>
            <span>Clientes</span>
          </Link>

          <Link to="/servicios" className="nav-item">
            <span className="nav-icon">✂️</span>
            <span>Servicios</span>
          </Link>

          <Link to="/empleados" className="nav-item">
            <span className="nav-icon">💼</span>
            <span>Empleados</span>
          </Link>

          <Link to="/reportes" className="nav-item">
            <span className="nav-icon">📊</span>
            <span>Reportes</span>
          </Link>

          {usuario.rol === 'owner' && (
            <Link to="/configuracion" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span>Configuración</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <p className="user-name">{usuario.nombre}</p>
              <p className="user-role">{usuario.rol}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
