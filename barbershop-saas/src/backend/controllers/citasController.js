// src/backend/controllers/citasController.js

/**
 * CONTROLADOR DE CITAS
 * CRUD de citas con validaciones de disponibilidad
 */

const { PrismaClient } = require('@prisma/client');
const { validarRequerido } = require('../utils/validators');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Utilidad: Convertir tiempo "HH:MM" a minutos desde medianoche
 */
function timeToMinutes(timeString) {
  const [horas, minutos] = timeString.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Utilidad: Convertir minutos a "HH:MM"
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Validar disponibilidad del empleado en una fecha/hora
 */
async function validarDisponibilidad(empleado_id, fecha, hora_inicio, hora_fin) {
  // Obtener día de la semana (0=lunes, 6=domingo)
  const date = new Date(fecha);
  const diaSemana = date.getDay() === 0 ? 6 : date.getDay() - 1; // Convertir a lunes=0

  // Obtener disponibilidades del empleado para ese día
  const disponibilidades = await prisma.disponibilidad.findMany({
    where: {
      empleado_id,
      dia_semana: diaSemana,
      activa: true,
    },
  });

  if (disponibilidades.length === 0) {
    return {
      valida: false,
      razon: 'El empleado no está disponible ese día',
    };
  }

  // Convertir horas a minutos
  const inicioMinutos = timeToMinutes(hora_inicio);
  const finMinutos = timeToMinutes(hora_fin);

  // Verificar que esté dentro de alguna disponibilidad
  const estaDentroDeHorario = disponibilidades.some(d => {
    const dispInicio = timeToMinutes(d.hora_inicio);
    const dispFin = timeToMinutes(d.hora_fin);
    return inicioMinutos >= dispInicio && finMinutos <= dispFin;
  });

  if (!estaDentroDeHorario) {
    return {
      valida: false,
      razon: 'La hora está fuera del horario disponible',
    };
  }

  return { valida: true };
}

/**
 * Validar que no hay solapamiento de citas
 */
async function validarNoSolapamiento(empleado_id, fecha, hora_inicio, hora_fin, excluir_cita_id = null) {
  const inicioMinutos = timeToMinutes(hora_inicio);
  const finMinutos = timeToMinutes(hora_fin);

  // Buscar citas del mismo empleado ese día
  const citasExistentes = await prisma.cita.findMany({
    where: {
      empleado_id,
      fecha: new Date(fecha),
      estado: {
        in: ['confirmada', 'en_proceso'], // No contar canceladas
      },
      NOT: {
        id: excluir_cita_id, // Excluir la cita si es actualización
      },
    },
  });

  // Verificar solapamiento
  for (const cita of citasExistentes) {
    const citaInicio = timeToMinutes(cita.hora_inicio);
    const citaFin = timeToMinutes(cita.hora_fin);

    // Hay solapamiento si: inicio < citaFin AND fin > citaInicio
    if (inicioMinutos < citaFin && finMinutos > citaInicio) {
      return {
        valida: false,
        razon: 'El empleado ya tiene una cita en ese horario',
      };
    }
  }

  return { valida: true };
}

/**
 * Obtener horarios disponibles para agendar
 */
async function obtenerHorariosDisponibles(empleado_id, fecha) {
  try {
    const date = new Date(fecha);
    const diaSemana = date.getDay() === 0 ? 6 : date.getDay() - 1;

    // Obtener disponibilidades del empleado
    const disponibilidades = await prisma.disponibilidad.findMany({
      where: {
        empleado_id,
        dia_semana: diaSemana,
        activa: true,
      },
    });

    if (disponibilidades.length === 0) {
      return [];
    }

    // Obtener citas existentes
    const citas = await prisma.cita.findMany({
      where: {
        empleado_id,
        fecha: date,
        estado: {
          in: ['confirmada', 'en_proceso'],
        },
      },
      orderBy: { hora_inicio: 'asc' },
    });

    // Generar horarios disponibles (cada 30 minutos)
    const horarios = [];
    const duracionIntervalo = 30; // minutos

    for (const disp of disponibilidades) {
      let tiempo = timeToMinutes(disp.hora_inicio);
      const fin = timeToMinutes(disp.hora_fin);

      while (tiempo + duracionIntervalo <= fin) {
        const horaInicio = minutesToTime(tiempo);
        const horaFin = minutesToTime(tiempo + duracionIntervalo);

        // Verificar que no hay solapamiento
        let ocupado = false;
        for (const cita of citas) {
          const citaInicio = timeToMinutes(cita.hora_inicio);
          const citaFin = timeToMinutes(cita.hora_fin);

          if (tiempo < citaFin && tiempo + duracionIntervalo > citaInicio) {
            ocupado = true;
            break;
          }
        }

        if (!ocupado) {
          horarios.push({ horaInicio, horaFin });
        }

        tiempo += duracionIntervalo;
      }
    }

    return horarios;
  } catch (error) {
    console.error('Error en obtenerHorariosDisponibles:', error);
    return [];
  }
}

/**
 * POST /citas
 * Crear nueva cita
 */
async function crearCita(req, res) {
  try {
    const { cliente_id, empleado_id, servicio_id, sucursal_id, fecha, hora_inicio } = req.body;

    // Validar campos requeridos
    if (!validarRequerido(cliente_id) || !validarRequerido(empleado_id) ||
        !validarRequerido(servicio_id) || !validarRequerido(fecha) ||
        !validarRequerido(hora_inicio)) {
      return res.status(400).json({
        exito: false,
        mensaje: 'Todos los campos son requeridos',
      });
    }

    // Obtener servicio para saber duración
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicio_id },
      include: { sucursal: true },
    });

    if (!servicio) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Servicio no encontrado',
      });
    }

    // Verificar que pertenece al negocio
    if (servicio.sucursal.negocio_id !== req.user.negocio_id) {
      return res.status(403).json({
        exito: false,
        mensaje: 'No tiene acceso a este servicio',
      });
    }

    // Calcular hora fin
    const inicioMinutos = timeToMinutes(hora_inicio);
    const finMinutos = inicioMinutos + servicio.duracion_minutos;
    const hora_fin = minutesToTime(finMinutos);

    // Validar disponibilidad del empleado
    const validezDisp = await validarDisponibilidad(empleado_id, fecha, hora_inicio, hora_fin);
    if (!validezDisp.valida) {
      return res.status(400).json({
        exito: false,
        mensaje: validezDisp.razon,
      });
    }

    // Validar no solapamiento
    const validezSolap = await validarNoSolapamiento(empleado_id, fecha, hora_inicio, hora_fin);
    if (!validezSolap.valida) {
      return res.status(400).json({
        exito: false,
        mensaje: validezSolap.razon,
      });
    }

    // Verificar cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: cliente_id },
    });

    if (!cliente || cliente.negocio_id !== req.user.negocio_id) {
      return res.status(404).json({
        exito: false,
        mensaje: 'Cliente no encontrado',
      });
    }

    // Crear cita
    const cita = await prisma.cita.create({
      data: {
        id: uuidv4(),
        negocio_id: req.user.negocio_id,
        sucursal_id,
        cliente_id,
        empleado_id,
        servicio_id,
        fecha: new Date(fecha),
        hora_inicio,
        hora_fin,
        estado: 'confirmada',
        creado_por: req.user.id,
      },
      include: {
        cliente: {
          select: { nombre: true, telefono: true },
        },
        empleado: {
          select: {
            usuario: { select: { nombre: true } },
          },
        },
        servicio: {
          select: { nombre: true, precio_base: true },
        },
      },
    });

    return res.status(201).json({
      exito: true,
      mensaje: 'Cita creada exitosamente',
      data: {
        id: cita.id,
        fecha: cita.fecha,
        hora: `${cita.hora_inicio} - ${cita.hora_fin}`,
        cliente: cita.cliente.nombre,
        empleado: cita.empleado.usuario.nombre,
        servicio: cita.servicio.nombre,
        precio: cita.servicio.precio_base,
      },
    });
  } catch (error) {
    console.error('Error en crearCita:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al crear cita',
    });
  }
}

/**
 * GET /citas
 * Listar citas con filtros
 */
async function listarCitas(req, res) {
  try {
    const { sucursal_id, empleado_id, cliente_id, estado, fecha_desde, fecha_hasta } = req.query;

    // Construir filtro
    const filtro = {
      negocio_id: req.user.negocio_id,
    };

    if (sucursal_id) {
      filtro.sucursal_id = sucursal_id;
    }

    if (empleado_id) {
      filtro.empleado_id = empleado_id;
    }

    if (cliente_id) {
      filtro.cliente_id = cliente_id;
    }

    if (estado) {
      filtro.estado = estado;
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

    const citas = await prisma.cita.findMany({
      where: filtro,
      include: {
        cliente: {
          select: { nombre: true, telefono: true },
        },
        empleado: {
          select: {
            usuario: { select: { nombre: true } },
          },
        },
        servicio: {
          select: { nombre: true, precio_base: true },
        },
        pagos: {
          select: { precio_final: true, metodo_pago: true },
        },
      },
      orderBy: [
        { fecha: 'desc' },
        { hora_inicio: 'desc' },
      ],
    });

    return res.status(200).json({
      exito: true,
      data: citas,
      total: citas.length,
    });
  } catch (error) {
    console.error('Error en listarCitas:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al listar citas',
    });
  }
}

/**
 * GET /citas/disponibles
 * Obtener horarios disponibles
 */
async function obtenerDisponibilidad(req, res) {
  try {
    const { empleado_id, fecha } = req.query;

    if (!empleado_id || !fecha) {
      return res.status(400).json({
        exito: false,
        mensaje: 'empleado_id y fecha son requeridos',
      });
    }

    const horarios = await obtenerHorariosDisponibles(empleado_id, fecha);

    return res.status(200).json({
      exito: true,
      data: {
        fecha,
        horarios_disponibles: horarios,
        total: horarios.length,
      },
    });
  } catch (error) {
    console.error('Error en obtenerDisponibilidad:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener disponibilidad',
    });
  }
}

/**
 * GET /citas/:id
 * Obtener cita por ID
 */
async function obtenerCita(req, res) {
  try {
    const { id } = req.params;

    const cita = await prisma.cita.findUnique({
      where: { id },
      include: {
        cliente: true,
        empleado: {
          include: { usuario: true },
        },
        servicio: true,
        pagos: true,
        propinas: true,
        comisiones: true,
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

    return res.status(200).json({
      exito: true,
      data: cita,
    });
  } catch (error) {
    console.error('Error en obtenerCita:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al obtener cita',
    });
  }
}

/**
 * PUT /citas/:id
 * Actualizar estado de cita
 */
async function actualizarCita(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['confirmada', 'en_proceso', 'finalizada', 'cancelada', 'no_asistio'];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        exito: false,
        mensaje: `Estado inválido. Válidos: ${estadosValidos.join(', ')}`,
      });
    }

    const cita = await prisma.cita.findUnique({
      where: { id },
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

    // Actualizar
    const citaActualizada = await prisma.cita.update({
      where: { id },
      data: { estado },
      include: {
        cliente: { select: { nombre: true } },
        empleado: { select: { usuario: { select: { nombre: true } } } },
        servicio: { select: { nombre: true } },
      },
    });

    return res.status(200).json({
      exito: true,
      mensaje: `Cita ${estado}`,
      data: {
        id: citaActualizada.id,
        estado: citaActualizada.estado,
      },
    });
  } catch (error) {
    console.error('Error en actualizarCita:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al actualizar cita',
    });
  }
}

/**
 * DELETE /citas/:id
 * Cancelar cita
 */
async function cancelarCita(req, res) {
  try {
    const { id } = req.params;

    const cita = await prisma.cita.findUnique({
      where: { id },
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

    // Actualizar a cancelada
    await prisma.cita.update({
      where: { id },
      data: { estado: 'cancelada' },
    });

    return res.status(200).json({
      exito: true,
      mensaje: 'Cita cancelada',
    });
  } catch (error) {
    console.error('Error en cancelarCita:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al cancelar cita',
    });
  }
}

module.exports = {
  crearCita,
  listarCitas,
  obtenerCita,
  obtenerDisponibilidad,
  actualizarCita,
  cancelarCita,
};
