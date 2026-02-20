// src/backend/routes/clientes.js

/**
 * RUTAS DE CLIENTES
 */

const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { validarPermiso } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
} = require('../controllers/clientesController');

// Aplicar rate limiter
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /clientes
 * Crear nuevo cliente
 */
router.post('/', validarPermiso('registrar_clientes'), crearCliente);

/**
 * GET /clientes
 * Listar clientes
 * Query: ?sucursal_id=xxx&nombre=xxx&activo=true
 */
router.get('/', listarClientes);

/**
 * GET /clientes/:id
 * Obtener cliente por ID
 */
router.get('/:id', obtenerCliente);

/**
 * PUT /clientes/:id
 * Actualizar cliente
 */
router.put('/:id', validarPermiso('registrar_clientes'), actualizarCliente);

/**
 * DELETE /clientes/:id
 * Eliminar cliente (soft delete)
 */
router.delete('/:id', validarPermiso('registrar_clientes'), eliminarCliente);

module.exports = router;
