// src/backend/controllers/rolesController.js

/**
 * CONTROLADOR DE ROLES
 * CRUD de roles
 */

const { PrismaClient } = require('@prisma/client');
const { validarNombre, validarRequerido } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /roles
 * Crear nuevo rol (solo owner)
 */
async function crearRol(req, res) {
  try {
    const { nombre, descripcion } = req.body;

    // Validar campos requeridos
    if (!validarRequerido(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre del rol es requerido',
      });
    }

    if (!validarNombre(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
      });
    }

    // Verificar que el rol no existe ya en este negocio
    const rolExistente = await prisma.rol.findFirst({
      where: {
        negocio_id: req.user.negocio_id,
        nombre,
      },
    });

    if (rolExistente) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Ya existe un rol con este nombre',
      });
    }

    // Crear rol
    const rol = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: req.user.negocio_id,
        nombre,
        descripcion: descripcion || '',
        activo: true,
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Rol creado exitosamente',
      data: {
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
      },
    });
  } catch (error) {
    console.error('Error en crearRol:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear rol',
    });
  }
}

/**
 * GET /roles
 * Listar roles del negocio
 */
async function listarRoles(req, res) {
  try {
    const { activo } = req.query;

    // Construir filtro
    const filtro = {
      negocio_id: req.user.negocio_id,
    };

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    const roles = await prisma.rol.findMany({
      where: filtro,
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        activo: true,
        _count: {
          select: { usuarios: true },
        },
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return res.status(200).json({
      exito: true,
      data: roles,
      total: roles.length,
    });
  } catch (error) {
    console.error('Error en listarRoles:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar roles',
    });
  }
}

/**
 * GET /roles/:id
 * Obtener rol por ID
 */
async function obtenerRol(req, res) {
  try {
    const { id } = req.params;

    const rol = await prisma.rol.findUnique({
      where: { id },
      include: {
        usuarios: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!rol) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Rol no encontrado',
      });
    }

    // Verificar que pertenece al mismo negocio
    if (rol.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este rol',
      });
    }

    return res.status(200).json({
      exito: true,
      data: rol,
    });
  } catch (error) {
    console.error('Error en obtenerRol:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener rol',
    });
  }
}

/**
 * PUT /roles/:id
 * Actualizar rol
 */
async function actualizarRol(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    // Obtener rol actual
    const rolActual = await prisma.rol.findUnique({
      where: { id },
    });

    if (!rolActual) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Rol no encontrado',
      });
    }

    // Verificar permisos
    if (rolActual.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este rol',
      });
    }

    // Validar que no sean roles del sistema
    const rolesDelSistema = ['owner', 'recepcionista', 'barbero', 'limpieza'];
    if (rolesDelSistema.includes(rolActual.nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede modificar un rol del sistema',
      });
    }

    // Construir datos de actualización
    const datosActualizar = {};

    if (nombre && nombre !== rolActual.nombre) {
      if (!validarNombre(nombre)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
        });
      }

      // Verificar que nuevo nombre no exista
      const nombreExistente = await prisma.rol.findFirst({
        where: {
          negocio_id: req.user.negocio_id,
          nombre,
        },
      });

      if (nombreExistente) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Ya existe un rol con este nombre',
        });
      }

      datosActualizar.nombre = nombre;
    }

    if (descripcion !== undefined) {
      datosActualizar.descripcion = descripcion;
    }

    if (activo !== undefined) {
      datosActualizar.activo = activo;
    }

    // Actualizar rol
    const rolActualizado = await prisma.rol.update({
      where: { id },
      data: datosActualizar,
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Rol actualizado',
      data: {
        id: rolActualizado.id,
        nombre: rolActualizado.nombre,
        descripcion: rolActualizado.descripcion,
        activo: rolActualizado.activo,
      },
    });
  } catch (error) {
    console.error('Error en actualizarRol:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar rol',
    });
  }
}

/**
 * DELETE /roles/:id
 * Soft delete de rol (desactivar)
 */
async function eliminarRol(req, res) {
  try {
    const { id } = req.params;

    // Obtener rol
    const rol = await prisma.rol.findUnique({
      where: { id },
      include: {
        usuarios: true,
      },
    });

    if (!rol) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Rol no encontrado',
      });
    }

    // Verificar permisos
    if (rol.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este rol',
      });
    }

    // Validar que no sea rol del sistema
    const rolesDelSistema = ['owner', 'recepcionista', 'barbero', 'limpieza'];
    if (rolesDelSistema.includes(rol.nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No se puede eliminar un rol del sistema',
      });
    }

    // Verificar que no hay usuarios asignados
    if (rol.usuarios.length > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `No se puede eliminar el rol porque tiene ${rol.usuarios.length} usuario(s) asignado(s)`,
      });
    }

    // Soft delete
    const rolEliminado = await prisma.rol.update({
      where: { id },
      data: { activo: false },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Rol desactivado',
    });
  } catch (error) {
    console.error('Error en eliminarRol:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar rol',
    });
  }
}

module.exports = {
  crearRol,
  listarRoles,
  obtenerRol,
  actualizarRol,
  eliminarRol,
};
