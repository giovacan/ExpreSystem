// src/backend/controllers/usuariosController.js

/**
 * CONTROLADOR DE USUARIOS
 * CRUD de usuarios
 */

const { PrismaClient } = require('@prisma/client');
const { hashPassword, verificarPassword } = require('../utils/hash');
const { validarEmail, validarPassword, validarNombre, validarEsquema } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /usuarios
 * Crear nuevo usuario (solo owner o super admin)
 */
async function crearUsuario(req, res) {
  try {
    const { nombre, email, password, rol_id, sucursal_id } = req.body;

    // Validar campos
    const validacion = validarEsquema(
      { nombre, email, password, rol_id },
      {
        nombre: ['requerido', 'nombre'],
        email: ['requerido', 'email'],
        password: ['requerido', 'password'],
        rol_id: ['requerido'],
      }
    );

    if (!validacion.valido) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Validación fallida',
        errores: validacion.errores,
      });
    }

    // Verificar que email no exista
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El email ya está registrado.',
      });
    }

    // Verificar que rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: rol_id },
    });

    if (!rol) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Rol no encontrado.',
      });
    }

    // Verificar que rol pertenece al mismo negocio
    if (rol.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No puede asignar un rol de otro negocio.',
      });
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: req.user.es_super_admin ? req.body.negocio_id : req.user.negocio_id,
        sucursal_id: sucursal_id || null,
        rol_id,
        nombre,
        email,
        password_hash: passwordHash,
        activo: true,
      },
      include: {
        rol: true,
        sucursal: true,
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol.nombre,
        sucursal: usuario.sucursal ? {
          id: usuario.sucursal.id,
          nombre: usuario.sucursal.nombre,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear usuario',
    });
  }
}

/**
 * GET /usuarios
 * Listar usuarios del negocio (con filtros opcionales)
 */
async function listarUsuarios(req, res) {
  try {
    const { sucursal_id, rol_id, activo } = req.query;

    // Construir filtro
    const filtro = {
      negocio_id: req.user.negocio_id,
    };

    if (sucursal_id) {
      filtro.sucursal_id = sucursal_id;
    }

    if (rol_id) {
      filtro.rol_id = rol_id;
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    const usuarios = await prisma.usuario.findMany({
      where: filtro,
      include: {
        rol: true,
        sucursal: true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
        sucursal: {
          select: {
            id: true,
            nombre: true,
          },
        },
        activo: true,
        fecha_creacion: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return res.status(200).json({
      exito: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar usuarios',
    });
  }
}

/**
 * GET /usuarios/:id
 * Obtener usuario por ID
 */
async function obtenerUsuario(req, res) {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: true,
        sucursal: true,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
        sucursal: {
          select: {
            id: true,
            nombre: true,
          },
        },
        activo: true,
        fecha_creacion: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado',
      });
    }

    // Verificar que pertenece al mismo negocio
    if (usuario.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este usuario',
      });
    }

    return res.status(200).json({
      exito: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error en obtenerUsuario:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener usuario',
    });
  }
}

/**
 * PUT /usuarios/:id
 * Actualizar usuario
 */
async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email, rol_id, sucursal_id, password } = req.body;

    // Obtener usuario actual
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuarioActual) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado',
      });
    }

    // Verificar permisos
    if (usuarioActual.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este usuario',
      });
    }

    // Construir datos de actualización
    const datosActualizar = {};

    if (nombre) {
      if (!validarNombre(nombre)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
        });
      }
      datosActualizar.nombre = nombre;
    }

    if (email && email !== usuarioActual.email) {
      if (!validarEmail(email)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'Email inválido',
        });
      }

      // Verificar que nuevo email no exista
      const emailExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (emailExistente) {
        return res.status(400).json({
          exito: false,
          mensaje: 'El email ya está registrado',
        });
      }

      datosActualizar.email = email;
    }

    if (password) {
      if (!validarPassword(password)) {
        return res.status(400).json({
          exito: false,
          mensaje: 'La contraseña debe tener mínimo 8 caracteres',
        });
      }
      datosActualizar.password_hash = await hashPassword(password);
    }

    if (rol_id) {
      const rol = await prisma.rol.findUnique({
        where: { id: rol_id },
      });

      if (!rol) {
        return res.status(404).json({
          exito: false,
          mensaje: 'Rol no encontrado',
        });
      }

      datosActualizar.rol_id = rol_id;
    }

    if (sucursal_id) {
      datosActualizar.sucursal_id = sucursal_id;
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id },
      data: datosActualizar,
      include: {
        rol: true,
        sucursal: true,
      },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario actualizado',
      data: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol.nombre,
      },
    });
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar usuario',
    });
  }
}

/**
 * DELETE /usuarios/:id
 * Soft delete de usuario
 */
async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    // Obtener usuario
    const usuario = await prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Usuario no encontrado',
      });
    }

    // Verificar permisos
    if (usuario.negocio_id !== req.user.negocio_id && !req.user.es_super_admin) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este usuario',
      });
    }

    // No permitir eliminar al usuario autenticado
    if (id === req.user.id) {
      return res.status(400).json({
        exito: false,
        mensaje: 'No puede eliminar su propia cuenta',
      });
    }

    // Soft delete
    const usuarioEliminado = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Usuario desactivado',
    });
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar usuario',
    });
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
};
