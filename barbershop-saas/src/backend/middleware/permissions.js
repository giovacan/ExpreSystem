// src/backend/middleware/permissions.js

/**
 * MIDDLEWARE DE PERMISOS
 * Valida que usuario tenga permiso para la acción
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PERMISOS = {
  owner: [
    'ver_todas_sucursales',
    'crear_sucursal',
    'eliminar_sucursal',
    'ver_editar_empleados',
    'cambiar_comisiones',
    'editar_precios',
    'ver_reportes_globales',
    'ver_historial_completo',
    'ver_propinas_comisiones',
    'cancelar_citas',
    'gestionar_suscripcion',
    'crear_usuario',
    'editar_usuario',
    'eliminar_usuario',
    'ver_usuarios',
  ],
  recepcionista: [
    'registrar_clientes',
    'crear_citas',
    'asignar_barbero',
    'cancelar_citas',
    'editar_precio_cobro',
    'ver_reportes_sucursal',
    'ver_clientes_sucursal',
    'ver_agenda_sucursal',
  ],
  barbero: [
    'ver_mis_citas',
    'cambiar_estado_cita',
    'configurar_disponibilidad',
    'solicitar_cancelacion',
    'ver_ganancias_personales',
    'ver_propinas_acumuladas',
  ],
  limpieza: [
    'ver_estado_general',
  ],
};

/**
 * Middleware genérico para validar permisos
 * @param {string|Array} permisosRequeridos - Permiso o array de permisos
 * @returns {Function} Middleware
 */
function validarPermiso(permisosRequeridos) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          exito: false,
          mensaje: 'No autenticado.',
        });
      }

      // Super admin tiene todos los permisos
      if (req.user.es_super_admin) {
        return next();
      }

      // Obtener rol del usuario
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.id },
        include: { rol: true },
      });

      if (!usuario || !usuario.rol) {
        return res.status(403).json({
          exito: false,
          mensaje: 'Usuario sin rol asignado.',
        });
      }

      const nombreRol = usuario.rol.nombre;
      const permisosUsuario = PERMISOS[nombreRol] || [];

      // Convertir permiso único a array
      const permisos = Array.isArray(permisosRequeridos)
        ? permisosRequeridos
        : [permisosRequeridos];

      // Verificar si tiene al menos uno de los permisos
      const tienePermiso = permisos.some(p => permisosUsuario.includes(p));

      if (!tienePermiso) {
        return res.status(403).json({
          exito: false,
          mensaje: 'Acceso denegado. Permisos insuficientes.',
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al validar permisos.',
      });
    }
  };
}

/**
 * Middleware para validar que sea owner
 */
function validarOwner(req, res, next) {
  return validarPermiso('crear_usuario')(req, res, next);
}

/**
 * Middleware para validar que sea recepcionista o owner
 */
function validarRecepcionista(req, res, next) {
  return validarPermiso(['registrar_clientes', 'crear_usuario'])(req, res, next);
}

/**
 * Middleware para validar que sea barbero
 */
function validarBarbero(req, res, next) {
  return validarPermiso('ver_mis_citas')(req, res, next);
}

/**
 * Middleware para validar que sea de la misma sucursal (si no es owner)
 */
function validarSucursal(req, res, next) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          exito: false,
          mensaje: 'No autenticado.',
        });
      }

      // Super admin y owner no tienen restricción
      if (req.user.es_super_admin) {
        return next();
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: req.user.id },
        include: { rol: true },
      });

      if (usuario.rol.nombre === 'owner') {
        return next();
      }

      // Verificar que la sucursal_id en el request coincida con la del usuario
      const sucursalId = req.params.sucursal_id || req.body.sucursal_id;

      if (sucursalId && usuario.sucursal_id !== sucursalId) {
        return res.status(403).json({
          exito: false,
          mensaje: 'No tiene acceso a esta sucursal.',
        });
      }

      next();
    } catch (error) {
      console.error('Error en validación de sucursal:', error);
      return res.status(500).json({
        exito: false,
        mensaje: 'Error al validar sucursal.',
      });
    }
  };
}

module.exports = {
  validarPermiso,
  validarOwner,
  validarRecepcionista,
  validarBarbero,
  validarSucursal,
  PERMISOS,
};
