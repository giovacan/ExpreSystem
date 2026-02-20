// src/backend/routes/servicios.js

/**
 * RUTAS DE SERVICIOS
 */

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarPermiso } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio,
} = require('../controllers/serviciosController');

// Aplicar rate limiter
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /servicios
 * Crear nuevo servicio
 */
router.post('/', validarPermiso('editar_precios'), crearServicio);

/**
 * GET /servicios
 * Listar servicios
 * Query: ?sucursal_id=xxx&activo=true
 */
router.get('/', listarServicios);

/**
 * GET /servicios/:id
 * Obtener servicio por ID
 */
router.get('/:id', obtenerServicio);

/**
 * PUT /servicios/:id
 * Actualizar servicio
 */
router.put('/:id', validarPermiso('editar_precios'), actualizarServicio);

/**
 * DELETE /servicios/:id
 * Eliminar servicio (soft delete)
 */
router.delete('/:id', validarPermiso('editar_precios'), eliminarServicio);

module.exports = router;
