// src/backend/routes/citas.js

/**
 * RUTAS DE CITAS
 */

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarPermiso } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearCita,
  listarCitas,
  obtenerCita,
  obtenerDisponibilidad,
  actualizarCita,
  cancelarCita,
} = require('../controllers/citasController');

// Aplicar rate limiter
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /citas
 * Crear nueva cita
 */
router.post('/', validarPermiso('crear_citas'), crearCita);

/**
 * GET /citas/disponibles
 * Obtener horarios disponibles para un empleado
 * Query: ?empleado_id=xxx&fecha=2025-02-20
 */
router.get('/disponibles', obtenerDisponibilidad);

/**
 * GET /citas
 * Listar citas
 * Query: ?sucursal_id=xxx&empleado_id=xxx&estado=confirmada&fecha_desde=2025-02-01&fecha_hasta=2025-02-28
 */
router.get('/', listarCitas);

/**
 * GET /citas/:id
 * Obtener cita por ID
 */
router.get('/:id', obtenerCita);

/**
 * PUT /citas/:id
 * Cambiar estado de cita
 */
router.put('/:id', validarPermiso('cambiar_estado_cita'), actualizarCita);

/**
 * DELETE /citas/:id
 * Cancelar cita
 */
router.delete('/:id', validarPermiso('cancelar_citas'), cancelarCita);

module.exports = router;
