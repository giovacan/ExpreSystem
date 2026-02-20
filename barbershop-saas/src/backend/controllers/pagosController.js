// src/backend/controllers/pagosController.js

/**
 * CONTROLADOR DE PAGOS Y COMISIONES
 * Registrar pagos, propinas y calcular comisiones automáticamente
 */

const { PrismaClient } = require('@prisma/client');
const { validarRequerido } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * POST /pagos
 * Registrar pago de cita
 */
async function crearPago(req, res) {
  try {
    const { cita_id, precio_final, metodo_pago } = req.body;

    // Validar campos requeridos
    if (!validarRequerido(cita_id) || !validarRequerido(precio_final) || !validarRequerido(metodo_pago)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Todos los campos son requeridos',
      });
    }

    const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'cheque'];
    if (!metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({
        exito: false,
        mensaje: `Método inválido. Válidos: ${metodosValidos.join(', ')}`,
      });
    }

    if (isNaN(precio_final) || precio_final < 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El precio final debe ser un número positivo',
      });
    }

    // Obtener cita
    const cita = await prisma.cita.findUnique({
      where: { id: cita_id },
      include: {
        servicio: true,
        empleado: {
          include: { usuario: true },
        },
      },
    });

    if (!cita) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cita no encontrada',
      });
    }

    // Verificar pertenencia
    if (cita.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a esta cita',
      });
    }

    // Verificar que no hay pago ya registrado
    const pagoPrevio = await prisma.pago.findUnique({
      where: { cita_id },
    });

    if (pagoPrevio) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Esta cita ya tiene un pago registrado',
      });
    }

    // Crear pago en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear pago
      const pago = await tx.pago.create({
        data: {
          id: uuidv4(),
          cita_id,
          negocio_id: cita.negocio_id,
          precio_base: cita.servicio.precio_base,
          precio_final: parseFloat(precio_final),
          metodo_pago,
        },
      });

      // 2. Cambiar estado de cita a finalizada
      await tx.cita.update({
        where: { id: cita_id },
        data: { estado: 'finalizada' },
      });

      // 3. Calcular y crear comisión automáticamente
      const comisionMonto = (parseFloat(precio_final) * cita.empleado.porcentaje_comision) / 100;

      const comision = await tx.comision.create({
        data: {
          id: uuidv4(),
          cita_id,
          empleado_id: cita.empleado_id,
          monto: comisionMonto,
          porcentaje_aplicado: cita.empleado.porcentaje_comision,
        },
      });

      return { pago, comision };
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Pago registrado exitosamente',
      data: {
        pago: {
          id: resultado.pago.id,
          cita_id: resultado.pago.cita_id,
          precio_base: resultado.pago.precio_base,
          precio_final: resultado.pago.precio_final,
          metodo_pago: resultado.pago.metodo_pago,
        },
        comision: {
          id: resultado.comision.id,
          monto: resultado.comision.monto,
          porcentaje: resultado.comision.porcentaje_aplicado,
        },
      },
    });
  } catch (error) {
    console.error('Error en crearPago:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al registrar pago',
    });
  }
}

/**
 * POST /propinas
 * Registrar propina (separada del pago)
 */
async function crearPropina(req, res) {
  try {
    const { cita_id, empleado_id, monto } = req.body;

    // Validar campos
    if (!validarRequerido(cita_id) || !validarRequerido(empleado_id) || !validarRequerido(monto)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Todos los campos son requeridos',
      });
    }

    if (isNaN(monto) || monto < 0) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El monto debe ser un número positivo',
      });
    }

    // Obtener cita
    const cita = await prisma.cita.findUnique({
      where: { id: cita_id },
    });

    if (!cita) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cita no encontrada',
      });
    }

    // Verificar pertenencia
    if (cita.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a esta cita',
      });
    }

    // Verificar que el empleado es el correcto
    if (cita.empleado_id !== empleado_id) {
      return res.status(400).json({
        exito: false,
        mensaje: 'El empleado no coincide con la cita',
      });
    }

    // Crear propina
    const propina = await prisma.propina.create({
      data: {
        id: uuidv4(),
        cita_id,
        empleado_id,
        monto: parseFloat(monto),
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Propina registrada',
      data: {
        id: propina.id,
        monto: propina.monto,
        fecha: propina.fecha,
      },
    });
  } catch (error) {
    console.error('Error en crearPropina:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al registrar propina',
    });
  }
}

/**
 * GET /comisiones
 * Listar comisiones con filtros
 */
async function listarComisiones(req, res) {
  try {
    const { empleado_id, fecha_desde, fecha_hasta } = req.query;

    // Construir filtro
    const filtro = {
      cita: {
        negocio_id: req.user.negocio_id,
      },
    };

    if (empleado_id) {
      filtro.empleado_id = empleado_id;
    }

    if (fecha_desde || fecha_hasta) {
      filtro.fecha = {};
      if (fecha_desde) {
        filtro.fecha.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        filtro.fecha.lte = new Date(fecha_hasta);
      }
    }

    const comisiones = await prisma.comision.findMany({
      where: filtro,
      include: {
        cita: {
          select: {
            id: true,
            fecha: true,
            cliente: { select: { nombre: true } },
            servicio: { select: { nombre: true } },
          },
        },
        empleado: {
          select: {
            usuario: { select: { nombre: true } },
            porcentaje_comision: true,
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Calcular totales
    const totalComisiones = comisiones.reduce((sum, c) => sum + parseFloat(c.monto), 0);

    return res.status(200).json({
      exito: true,
      data: comisiones,
      total: comisiones.length,
      total_comisiones: totalComisiones.toFixed(2),
    });
  } catch (error) {
    console.error('Error en listarComisiones:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar comisiones',
    });
  }
}

/**
 * GET /comisiones/:empleado_id
 * Obtener comisiones de un empleado específico
 */
async function obtenerComisionesEmpleado(req, res) {
  try {
    const { empleado_id } = req.params;
    const { fecha_desde, fecha_hasta } = req.query;

    // Obtener empleado para verificar pertenencia
    const empleado = await prisma.empleado.findUnique({
      where: { id: empleado_id },
      include: {
        sucursal: true,
      },
    });

    if (!empleado) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Empleado no encontrado',
      });
    }

    // Verificar que el empleado es del negocio
    if (empleado.sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este empleado',
      });
    }

    // Construir filtro
    const filtro = {
      empleado_id,
    };

    if (fecha_desde || fecha_hasta) {
      filtro.fecha = {};
      if (fecha_desde) {
        filtro.fecha.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        filtro.fecha.lte = new Date(fecha_hasta);
      }
    }

    // Obtener comisiones
    const comisiones = await prisma.comision.findMany({
      where: filtro,
      include: {
        cita: {
          select: {
            fecha: true,
            cliente: { select: { nombre: true } },
            servicio: { select: { nombre: true, precio_base: true } },
            pagos: { select: { precio_final: true } },
          },
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Obtener propinas del mismo período
    const filtrosPropinas = {
      empleado_id,
    };

    if (fecha_desde || fecha_hasta) {
      filtrosPropinas.fecha = {};
      if (fecha_desde) {
        filtrosPropinas.fecha.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        filtrosPropinas.fecha.lte = new Date(fecha_hasta);
      }
    }

    const propinas = await prisma.propina.findMany({
      where: filtrosPropinas,
      orderBy: { fecha: 'desc' },
    });

    // Calcular totales
    const totalComisiones = comisiones.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const totalPropinas = propinas.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const totalGanancia = totalComisiones + totalPropinas;

    return res.status(200).json({
      exito: true,
      data: {
        empleado: {
          id: empleado.id,
          nombre: empleado.usuario.nombre,
          porcentaje_comision: empleado.porcentaje_comision,
        },
        comisiones,
        propinas,
        resumen: {
          total_comisiones: totalComisiones.toFixed(2),
          total_propinas: totalPropinas.toFixed(2),
          total_ganancia: totalGanancia.toFixed(2),
          cantidad_comisiones: comisiones.length,
          cantidad_propinas: propinas.length,
        },
      },
    });
  } catch (error) {
    console.error('Error en obtenerComisionesEmpleado:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener comisiones',
    });
  }
}

/**
 * GET /pagos
 * Listar pagos registrados
 */
async function listarPagos(req, res) {
  try {
    const { sucursal_id, metodo_pago, fecha_desde, fecha_hasta } = req.query;

    // Construir filtro
    const filtro = {
      negocio_id: req.user.negocio_id,
    };

    if (sucursal_id) {
      filtro.cita = {
        sucursal_id,
      };
    }

    if (metodo_pago) {
      filtro.metodo_pago = metodo_pago;
    }

    if (fecha_desde || fecha_hasta) {
      filtro.fecha_pago = {};
      if (fecha_desde) {
        filtro.fecha_pago.gte = new Date(fecha_desde);
      }
      if (fecha_hasta) {
        filtro.fecha_pago.lte = new Date(fecha_hasta);
      }
    }

    const pagos = await prisma.pago.findMany({
      where: filtro,
      include: {
        cita: {
          select: {
            id: true,
            fecha: true,
            cliente: { select: { nombre: true } },
            empleado: { select: { usuario: { select: { nombre: true } } } },
            servicio: { select: { nombre: true } },
          },
        },
      },
      orderBy: {
        fecha_pago: 'desc',
      },
    });

    // Calcular totales
    const totalPagos = pagos.reduce((sum, p) => sum + parseFloat(p.precio_final), 0);

    return res.status(200).json({
      exito: true,
      data: pagos,
      total: pagos.length,
      total_pagos: totalPagos.toFixed(2),
    });
  } catch (error) {
    console.error('Error en listarPagos:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar pagos',
    });
  }
}

module.exports = {
  crearPago,
  crearPropina,
  listarComisiones,
  obtenerComisionesEmpleado,
  listarPagos,
};
