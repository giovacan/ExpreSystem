// src/backend/routes/pagos.js

/**
 * RUTAS DE PAGOS Y COMISIONES
 */

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarPermiso } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearPago,
  crearPropina,
  listarComisiones,
  obtenerComisionesEmpleado,
  listarPagos,
} = require('../controllers/pagosController');

// Aplicar rate limiter
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /pagos
 * Registrar pago de cita
 */
router.post('/', validarPermiso('editar_precio_cobro'), crearPago);

/**
 * GET /pagos
 * Listar pagos registrados
 * Query: ?sucursal_id=xxx&metodo_pago=efectivo&fecha_desde=2025-02-01&fecha_hasta=2025-02-28
 */
router.get('/', listarPagos);

/**
 * POST /propinas
 * Registrar propina
 */
router.post('/propinas', crearPropina);

/**
 * GET /comisiones
 * Listar comisiones
 * Query: ?empleado_id=xxx&fecha_desde=2025-02-01&fecha_hasta=2025-02-28
 */
router.get('/comisiones', validarPermiso('ver_propinas_comisiones'), listarComisiones);

/**
 * GET /comisiones/:empleado_id
 * Obtener comisiones de un empleado específico
 * Query: ?fecha_desde=2025-02-01&fecha_hasta=2025-02-28
 */
router.get('/comisiones/:empleado_id', validarPermiso('ver_propinas_comisiones'), obtenerComisionesEmpleado);

module.exports = router;
