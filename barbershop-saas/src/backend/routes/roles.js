// src/backend/routes/roles.js

/**
 * RUTAS DE ROLES
 */

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarPermiso } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearRol,
  listarRoles,
  obtenerRol,
  actualizarRol,
  eliminarRol,
} = require('../controllers/rolesController');

// Aplicar rate limiter a todas las rutas
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /roles
 * Crear nuevo rol
 * Requerimientos: owner
 */
router.post('/', validarPermiso('cambiar_comisiones'), crearRol);

/**
 * GET /roles
 * Listar roles del negocio
 * Query params: ?activo=true
 */
router.get('/', listarRoles);

/**
 * GET /roles/:id
 * Obtener rol por ID
 */
router.get('/:id', obtenerRol);

/**
 * PUT /roles/:id
 * Actualizar rol
 * Requerimientos: owner
 */
router.put('/:id', validarPermiso('cambiar_comisiones'), actualizarRol);

/**
 * DELETE /roles/:id
 * Eliminar rol (soft delete)
 * Requerimientos: owner
 */
router.delete('/:id', validarPermiso('cambiar_comisiones'), eliminarRol);

module.exports = router;
