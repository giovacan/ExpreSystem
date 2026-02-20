// src/backend/controllers/clientesController.js

/**
 * CONTROLADOR DE CLIENTES
 * CRUD de clientes
 */

const { PrismaClient } = require('@prisma/client');
const { validarNombre, validarTelefono, validarRequerido } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /clientes
 * Crear nuevo cliente
 */
async function crearCliente(req, res) {
  try {
    const { nombre, telefono, sucursal_id, fecha_nacimiento, notas } = req.body;

    // Validar campos requeridos
    if (!validarRequerido(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre es requerido',
      });
    }

    if (!validarNombre(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
      });
    }

    if (!validarRequerido(sucursal_id)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'La sucursal es requerida',
      });
    }

    if (telefono && !validarTelefono(telefono)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El teléfono debe tener entre 10 y 20 caracteres',
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

    // Crear cliente
    const cliente = await prisma.cliente.create({
      data: {
        id: uuidv4(),
        negocio_id: req.user.negocio_id,
        sucursal_id,
        nombre,
        telefono: telefono || null,
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        notas: notas || null,
        activo: true,
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Cliente creado exitosamente',
      data: {
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        fecha_registro: cliente.fecha_registro,
      },
    });
  } catch (error) {
    console.error('Error en crearCliente:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear cliente',
    });
  }
}

/**
 * GET /clientes
 * Listar clientes con filtros
 */
async function listarClientes(req, res) {
  try {
    const { sucursal_id, nombre, activo } = req.query;

    // Construir filtro
    const filtro = {
      negocio_id: req.user.negocio_id,
    };

    if (sucursal_id) {
      filtro.sucursal_id = sucursal_id;
    }

    if (nombre) {
      filtro.nombre = {
        contains: nombre,
        mode: 'insensitive',
      };
    }

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    const clientes = await prisma.cliente.findMany({
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
            fecha: true,
            estado: true,
          },
          orderBy: { fecha: 'desc' },
          take: 5, // Últimas 5 citas
        },
      },
      orderBy: {
        fecha_registro: 'desc',
      },
    });

    return res.status(200).json({
      exito: true,
      data: clientes,
      total: clientes.length,
    });
  } catch (error) {
    console.error('Error en listarClientes:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar clientes',
    });
  }
}

/**
 * GET /clientes/:id
 * Obtener cliente por ID
 */
async function obtenerCliente(req, res) {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        sucursal: true,
        citas: {
          include: {
            empleado: {
              select: {
                id: true,
                usuario: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
            servicio: {
              select: {
                nombre: true,
                precio_base: true,
              },
            },
            pagos: true,
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!cliente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
      });
    }

    // Verificar pertenencia al negocio
    if (cliente.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este cliente',
      });
    }

    return res.status(200).json({
      exito: true,
      data: cliente,
    });
  } catch (error) {
    console.error('Error en obtenerCliente:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener cliente',
    });
  }
}

/**
 * PUT /clientes/:id
 * Actualizar cliente
 */
async function actualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const { nombre, telefono, fecha_nacimiento, notas } = req.body;

    // Obtener cliente actual
    const clienteActual = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteActual) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
      });
    }

    // Verificar pertenencia
    if (clienteActual.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este cliente',
      });
    }

    // Validar datos
    if (nombre && !validarNombre(nombre)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El nombre debe tener entre 2 y 255 caracteres',
      });
    }

    if (telefono && !validarTelefono(telefono)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El teléfono es inválido',
      });
    }

    // Construir datos de actualización
    const datosActualizar = {};
    if (nombre) datosActualizar.nombre = nombre;
    if (telefono) datosActualizar.telefono = telefono;
    if (fecha_nacimiento) datosActualizar.fecha_nacimiento = new Date(fecha_nacimiento);
    if (notas !== undefined) datosActualizar.notas = notas || null;

    // Actualizar
    const clienteActualizado = await prisma.cliente.update({
      where: { id },
      data: datosActualizar,
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Cliente actualizado',
      data: {
        id: clienteActualizado.id,
        nombre: clienteActualizado.nombre,
        telefono: clienteActualizado.telefono,
      },
    });
  } catch (error) {
    console.error('Error en actualizarCliente:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar cliente',
    });
  }
}

/**
 * DELETE /clientes/:id
 * Soft delete de cliente
 */
async function eliminarCliente(req, res) {
  try {
    const { id } = req.params;

    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
      });
    }

    // Verificar pertenencia
    if (cliente.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este cliente',
      });
    }

    // Soft delete
    await prisma.cliente.update({
      where: { id },
      data: { activo: false },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Cliente desactivado',
    });
  } catch (error) {
    console.error('Error en eliminarCliente:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al eliminar cliente',
    });
  }
}

module.exports = {
  crearCliente,
  listarClientes,
  obtenerCliente,
  actualizarCliente,
  eliminarCliente,
};
