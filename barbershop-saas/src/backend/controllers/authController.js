// src/backend/controllers/authController.js

/**
 * CONTROLADOR DE AUTENTICACIÓN
 * Maneja login, register, refresh token
 */

const { PrismaClient } = require('@prisma/client');
const { hashPassword, verificarPassword } = require('../utils/hash');
const { validarEmail, validarPassword, validarNombre, validarEsquema } = require('../utils/validators');
const { generarAccessToken, generarRefreshToken, verificarRefreshToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /auth/login
 * Autenticar usuario con email y contraseña
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    const validacion = validarEsquema(
      { email, password },
      {
        email: ['requerido', 'email'],
        password: ['requerido'],
      }
    );

    if (!validacion.valido) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Validación fallida',
        errores: validacion.errores,
      });
    }

    // Buscar usuario por email (incluyendo inactivos para mejor mensaje de error)
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        negocio: true,
        sucursal: true,
        rol: true,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({
        exito: false,
        mensaje: 'Usuario inactivo. Contacte al administrador.',
      });
    }

    // Verificar contraseña
    const passwordValida = await verificarPassword(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    // Validar suscripción si no es super admin
    if (!usuario.es_super_admin && usuario.negocio_id) {
      const suscripcion = await prisma.suscripcion.findUnique({
        where: { negocio_id: usuario.negocio_id },
      });

      if (!suscripcion || suscripcion.estado === 'suspendida') {
        return res.status(403).json({
          exito: false,
          mensaje: 'Su suscripción ha sido suspendida. Contacte al soporte.',
        });
      }

      if (suscripcion.estado === 'vencida' || suscripcion.estado === 'pendiente_pago') {
        return res.status(403).json({
          exito: false,
          mensaje: 'Su suscripción está vencida. Renuévela para continuar.',
        });
      }
    }

    // Generar tokens
    const payload = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      negocio_id: usuario.negocio_id,
      sucursal_id: usuario.sucursal_id,
      rol_id: usuario.rol_id,
      rol: usuario.rol.nombre,
      es_super_admin: usuario.es_super_admin,
    };

    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    // Respuesta exitosa
    return res.status(200).json({
      exito: true,
      mensaje: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol.nombre,
          es_super_admin: usuario.es_super_admin,
          negocio: usuario.negocio ? {
            id: usuario.negocio.id,
            nombre: usuario.negocio.nombre,
          } : null,
          sucursal: usuario.sucursal ? {
            id: usuario.sucursal.id,
            nombre: usuario.sucursal.nombre,
          } : null,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al iniciar sesión',
    });
  }
}

/**
 * POST /auth/register
 * Registrar nuevo negocio y usuario owner
 */
async function register(req, res) {
  try {
    const { nombre_negocio, nombre_owner, email, password, password_confirmacion } = req.body;

    // Validar campos
    const validacion = validarEsquema(
      { nombre_negocio, nombre_owner, email, password },
      {
        nombre_negocio: ['requerido', 'nombre'],
        nombre_owner: ['requerido', 'nombre'],
        email: ['requerido', 'email'],
        password: ['requerido', 'password'],
      }
    );

    if (!validacion.valido) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Validación fallida',
        errores: validacion.errores,
      });
    }

    // Validar que las contraseñas coincidan
    if (password !== password_confirmacion) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Las contraseñas no coinciden.',
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

    // Crear negocio, sucursal, roles, usuario y suscripción en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear negocio
      const negocio = await tx.negocio.create({
        data: {
          id: uuidv4(),
          nombre: nombre_negocio,
          estado: 'activo',
        },
      });

      // 2. Crear sucursal principal
      const sucursal = await tx.sucursal.create({
        data: {
          id: uuidv4(),
          negocio_id: negocio.id,
          nombre: `${nombre_negocio} - Sucursal Principal`,
          direccion: '',
          telefono: '',
          horario_apertura: '09:00:00',
          horario_cierre: '18:00:00',
          activa: true,
        },
      });

      // 3. Crear rol owner
      const rolOwner = await tx.rol.create({
        data: {
          id: uuidv4(),
          negocio_id: negocio.id,
          nombre: 'owner',
          descripcion: 'Propietario del negocio',
          activo: true,
        },
      });

      // 4. Crear usuario owner
      const passwordHash = await hashPassword(password);
      const usuario = await tx.usuario.create({
        data: {
          id: uuidv4(),
          negocio_id: negocio.id,
          sucursal_id: sucursal.id,
          rol_id: rolOwner.id,
          nombre: nombre_owner,
          email,
          password_hash: passwordHash,
          es_super_admin: false,
          activo: true,
        },
        include: {
          rol: true,
        },
      });

      // 5. Crear plan básico si no existe
      let planBasico = await tx.plan.findFirst({
        where: { nombre: 'Profesional' },
      });

      if (!planBasico) {
        planBasico = await tx.plan.create({
          data: {
            id: uuidv4(),
            nombre: 'Profesional',
            precio_mensual: 79.99,
            precio_anual: 799.99,
            limite_empleados: 10,
            limite_sucursales: 5,
            limite_citas_mensuales: 5000,
            almacenamiento_mb: 1000,
            activo: true,
          },
        });
      }

      // 6. Crear suscripción en estado pendiente
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1);

      const suscripcion = await tx.suscripcion.create({
        data: {
          id: uuidv4(),
          negocio_id: negocio.id,
          plan_id: planBasico.id,
          fecha_fin: fechaFin,
          estado: 'pendiente_pago',
          auto_renovar: true,
        },
      });

      return { negocio, sucursal, usuario, suscripcion };
    });

    // Generar tokens
    const payload = {
      id: resultado.usuario.id,
      email: resultado.usuario.email,
      nombre: resultado.usuario.nombre,
      negocio_id: resultado.negocio.id,
      sucursal_id: resultado.sucursal.id,
      rol_id: resultado.usuario.rol_id,
      rol: resultado.usuario.rol.nombre,
      es_super_admin: false,
    };

    const accessToken = generarAccessToken(payload);
    const refreshToken = generarRefreshToken(payload);

    return res.status(201).json({
      exito: true,
      mensaje: 'Registro exitoso',
      data: {
        usuario: {
          id: resultado.usuario.id,
          nombre: resultado.usuario.nombre,
          email: resultado.usuario.email,
          rol: resultado.usuario.rol.nombre,
        },
        negocio: {
          id: resultado.negocio.id,
          nombre: resultado.negocio.nombre,
        },
        sucursal: {
          id: resultado.sucursal.id,
          nombre: resultado.sucursal.nombre,
        },
        suscripcion: {
          estado: resultado.suscripcion.estado,
          fecha_fin: resultado.suscripcion.fecha_fin,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al registrar',
    });
  }
}

/**
 * POST /auth/refresh
 * Generar nuevo access token usando refresh token
 */
async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Refresh token requerido.',
      });
    }

    // Verificar refresh token
    const payload = verificarRefreshToken(token);

    if (!payload) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Refresh token inválido o expirado.',
      });
    }

    // Generar nuevo access token
    const newAccessToken = generarAccessToken(payload);

    return res.status(200).json({
      exito: true,
      mensaje: 'Token renovado',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error('Error en refreshToken:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al renovar token',
    });
  }
}

/**
 * POST /auth/logout
 * Logout (principalmente para UI, backend es stateless)
 */
async function logout(req, res) {
  try {
    // En JWT stateless no hay mucho que hacer en backend
    // El cliente debe eliminar tokens del localStorage

    return res.status(200).json({
      exito: true,
      mensaje: 'Logout exitoso. Elimine los tokens del cliente.',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error en logout',
    });
  }
}

module.exports = {
  login,
  register,
  refreshToken,
  logout,
};
