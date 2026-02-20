// src/backend/routes/usuarios.js

/**
 * RUTAS DE USUARIOS
 */

const express = require('express');
const router = express.Router();
const { autenticar, validarSuperAdmin } = require('../middleware/auth');
const { validarPermiso, validarSucursal } = require('../middleware/permissions');
const { limiterGeneral } = require('../middleware/rateLimiter');
const {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuariosController');

// Aplicar rate limiter a todas las rutas
router.use(limiterGeneral);

// Todas las rutas requieren autenticación
router.use(autenticar);

/**
 * POST /usuarios
 * Crear nuevo usuario
 * Requerimientos: owner o super admin
 */
router.post(
  '/',
  validarPermiso('crear_usuario'),
  crearUsuario
);

/**
 * GET /usuarios
 * Listar usuarios del negocio
 * Query params: ?sucursal_id=xxx&rol_id=xxx&activo=true
 */
router.get('/', listarUsuarios);

/**
 * GET /usuarios/:id
 * Obtener usuario por ID
 */
router.get('/:id', obtenerUsuario);

/**
 * PUT /usuarios/:id
 * Actualizar usuario
 * Solo owner o super admin, excepto para actualizar su propio perfil
 */
router.put('/:id', validarPermiso('editar_usuario'), actualizarUsuario);

/**
 * DELETE /usuarios/:id
 * Eliminar usuario (soft delete)
 */
router.delete('/:id', validarPermiso('eliminar_usuario'), eliminarUsuario);

module.exports = router;
