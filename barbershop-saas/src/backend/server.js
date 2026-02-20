// src/backend/server.js

/**
 * SERVIDOR EXPRESS - BACKEND
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Importar middlewares
const { errorHandler, rutaNoEncontrada } = require('./middleware/errorHandler');
const { limiterGeneral } = require('./middleware/rateLimiter');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const rolesRoutes = require('./routes/roles');
const clientesRoutes = require('./routes/clientes');
const serviciosRoutes = require('./routes/servicios');
const citasRoutes = require('./routes/citas');
const pagosRoutes = require('./routes/pagos');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Helmet para seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting general
app.use(limiterGeneral);

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    exito: true,
    mensaje: 'Servidor funcionando',
    ambiente: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API version
app.get('/api/version', (req, res) => {
  res.status(200).json({
    exito: true,
    version: '1.0.0',
    api: 'Barbershop SaaS',
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de usuarios
app.use('/api/usuarios', usuariosRoutes);

// Rutas de roles
app.use('/api/roles', rolesRoutes);

// Rutas de clientes
app.use('/api/clientes', clientesRoutes);

// Rutas de servicios
app.use('/api/servicios', serviciosRoutes);

// Rutas de citas
app.use('/api/citas', citasRoutes);

// Rutas de pagos y comisiones
app.use('/api/pagos', pagosRoutes);

// ============================================
// MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS
// ============================================

// 404 - Ruta no encontrada
app.use(rutaNoEncontrada);

// Error handler (DEBE ser el último middleware)
app.use(errorHandler);

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                  BARBERSHOP SaaS                       ║
║                   SERVIDOR INICIADO                    ║
╚════════════════════════════════════════════════════════╝

  🚀 Servidor: http://localhost:${PORT}
  📡 Ambiente: ${NODE_ENV}
  🎯 Frontend: ${FRONTEND_URL}
  
  Endpoints disponibles:
    GET    /health
    GET    /api/version
    
    AUTENTICACIÓN:
    POST   /api/auth/login
    POST   /api/auth/register
    POST   /api/auth/refresh
    
    USUARIOS Y ROLES:
    GET    /api/usuarios
    POST   /api/usuarios
    GET    /api/roles
    POST   /api/roles
    
    CLIENTES:
    GET    /api/clientes
    POST   /api/clientes
    
    SERVICIOS:
    GET    /api/servicios
    POST   /api/servicios
    
    CITAS:
    GET    /api/citas
    GET    /api/citas/disponibles?empleado_id=xxx&fecha=2025-02-20
    POST   /api/citas
    
    PAGOS Y COMISIONES:
    POST   /api/pagos (registrar pago)
    GET    /api/pagos (listar pagos)
    POST   /api/pagos/propinas (registrar propina)
    GET    /api/pagos/comisiones
    GET    /api/pagos/comisiones/:empleado_id

  Documentación:
    http://localhost:${PORT}/api/docs (próximamente)
  
`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

module.exports = app;
