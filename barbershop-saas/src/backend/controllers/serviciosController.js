// src/backend/controllers/serviciosController.js

/**
 * CONTROLADOR DE SERVICIOS
 * CRUD de servicios
 */

const { PrismaClient } = require('@prisma/client');
const { validarNombre, validarRequerido } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /servicios
 * Crear nuevo servicio
 */
async function crearServicio(req, res) {
  try {
    const { sucursal_id, nombre, precio_base, duracion_minutos } = req.body;

    // Validar campos requeridos
    if (!validarRequerido(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre del servicio es requerido',
      });
    }

    if (!validarNombre(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
      });
    }

    if (!validarRequerido(precio_base) || isNaN(precio_base) || precio_base < 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El precio base debe ser un número positivo',
      });
    }

    if (!validarRequerido(duracion_minutos) || isNaN(duracion_minutos) || duracion_minutos <= 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La duración debe ser mayor a 0 minutos',
      });
    }

    // Verificar que la sucursal existe y pertenece al negocio
    const sucursal = await prisma.sucursal.findUnique({
      where: { id: sucursal_id },
    });

    if (!sucursal || sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Sucursal no encontrada',
      });
    }

    // Crear servicio
    const servicio = await prisma.servicio.create({
      data: {
        id: uuidv4(),
        sucursal_id,
        nombre,
        precio_base: parseFloat(precio_base),
        duracion_minutos: parseInt(duracion_minutos),
        activo: true,
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Servicio creado exitosamente',
      data: {
        id: servicio.id,
        nombre: servicio.nombre,
        precio_base: servicio.precio_base,
        duracion_minutos: servicio.duracion_minutos,
      },
    });
  } catch (error) {
    console.error('Error en crearServicio:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear servicio',
    });
  }
}

/**
 * GET /servicios
 * Listar servicios con filtros
 */
async function listarServicios(req, res) {
  try {
    const { sucursal_id, activo } = req.query;

    // Construir filtro
    const filtro = {
      sucursal: {
        negocio_id: req.user.negocio_id,
      },
    };

    if (sucursal_id) {
      filtro.sucursal_id = sucursal_id;
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    const servicios = await prisma.servicio.findMany({
      where: filtro,
      include: {
        sucursal: {
          select: {
            id: true,
            nombre: true,
          },
        },
        citas: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { sucursal_id: 'asc' },
        { nombre: 'asc' },
      ],
    });

    return res.status(200).json({
      exito: true,
      data: servicios,
      total: servicios.length,
    });
  } catch (error) {
    console.error('Error en listarServicios:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar servicios',
    });
  }
}

/**
 * GET /servicios/:id
 * Obtener servicio por ID
 */
async function obtenerServicio(req, res) {
  try {
    const { id } = req.params;

    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        sucursal: true,
      },
    });

    if (!servicio) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Servicio no encontrado',
      });
    }

    // Verificar pertenencia al negocio
    if (servicio.sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este servicio',
      });
    }

    return res.status(200).json({
      exito: true,
      data: servicio,
    });
  } catch (error) {
    console.error('Error en obtenerServicio:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener servicio',
    });
  }
}

/**
 * PUT /servicios/:id
 * Actualizar servicio
 */
async function actualizarServicio(req, res) {
  try {
    const { id } = req.params;
    const { nombre, precio_base, duracion_minutos, activo } = req.body;

    // Obtener servicio actual
    const servicioActual = await prisma.servicio.findUnique({
      where: { id },
      include: { sucursal: true },
    });

    if (!servicioActual) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Servicio no encontrado',
      });
    }

    // Verificar pertenencia
    if (servicioActual.sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este servicio',
      });
    }

    // Validar datos
    if (nombre && !validarNombre(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
      });
    }

    if (precio_base !== undefined && (isNaN(precio_base) || precio_base < 0)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El precio base debe ser un número positivo',
      });
    }

    if (duracion_minutos !== undefined && (isNaN(duracion_minutos) || duracion_minutos <= 0)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La duración debe ser mayor a 0 minutos',
      });
    }

    // Construir datos de actualización
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (precio_base !== undefined) datosActualizar.precio_base = parseFloat(precio_base);
    if (duracion_minutos !== undefined) datosActualizar.duracion_minutos = parseInt(duracion_minutos);
    if (activo !== undefined) datosActualizar.activo = activo;

    // Actualizar
    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: datosActualizar,
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Servicio actualizado',
      data: {
        id: servicioActualizado.id,
        nombre: servicioActualizado.nombre,
        precio_base: servicioActualizado.precio_base,
        duracion_minutos: servicioActualizado.duracion_minutos,
      },
    });
  } catch (error) {
    console.error('Error en actualizarServicio:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar servicio',
    });
  }
}

/**
 * DELETE /servicios/:id
 * Soft delete de servicio
 */
async function eliminarServicio(req, res) {
  try {
    const { id } = req.params;

    const servicio = await prisma.servicio.findUnique({
      where: { id },
      include: {
        sucursal: true,
        citas: true,
      },
    });

    if (!servicio) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Servicio no encontrado',
      });
    }

    // Verificar pertenencia
    if (servicio.sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este servicio',
      });
    }

    // Verificar que no hay citas futuras
    const ahora = new Date();
    const citasFuturas = servicio.citas.filter(c => new Date(`${c.fecha} ${c.hora_inicio}`) > ahora);

    if (citasFuturas.length > 0) {
      return res.status(400).json({
        exito: false,
        mensaje: `No se puede eliminar. Tiene ${citasFuturas.length} cita(s) futura(s)`,
      });
    }

    // Soft delete
    await prisma.servicio.update({
      where: { id },
      data: { activo: false },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Servicio desactivado',
    });
  } catch (error) {
    console.error('Error en eliminarServicio:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar servicio',
    });
  }
}

module.exports = {
  crearServicio,
  listarServicios,
  obtenerServicio,
  actualizarServicio,
  eliminarServicio,
};
