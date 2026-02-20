// src/config/constants.js

/**
 * CONSTANTES GLOBALES DEL SISTEMA
 * Se usan en backend y frontend
 */

// ============================================
// ROLES DEL SISTEMA
// ============================================
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  OWNER: 'owner',
  RECEPCIONISTA: 'recepcionista',
  BARBERO: 'barbero',
  LIMPIEZA: 'limpieza',
};

// ============================================
// PERMISOS POR ROL
// ============================================
export const PERMISOS = {
  [ROLES.SUPER_ADMIN]: [
    'ver_todos_negocios',
    'activar_suspender_negocio',
    'modificar_suscripciones',
    'ver_activity_logs_globales',
  ],
  [ROLES.OWNER]: [
    'ver_todas_sucursales',
    'crear_eliminar_sucursales',
    'ver_editar_empleados',
    'cambiar_comisiones',
    'editar_precios',
    'ver_reportes_globales',
    'ver_historial_completo',
    'ver_propinas_comisiones',
    'cancelar_citas',
    'gestionar_suscripcion',
  ],
  [ROLES.RECEPCIONISTA]: [
    'registrar_clientes',
    'crear_citas',
    'asignar_barbero',
    'cancelar_citas',
    'editar_precio_cobro',
    'ver_reportes_sucursal',
    'ver_clientes_sucursal',
    'ver_agenda_sucursal',
  ],
  [ROLES.BARBERO]: [
    'ver_mis_citas',
    'cambiar_estado_cita',
    'configurar_disponibilidad',
    'solicitar_cancelacion',
    'ver_ganancias_personales',
    'ver_propinas_acumuladas',
  ],
  [ROLES.LIMPIEZA]: [
    'ver_estado_general',
  ],
};

// ============================================
// ESTADOS DE CITA
// ============================================
export const ESTADOS_CITA = {
  CONFIRMADA: 'confirmada',
  EN_PROCESO: 'en_proceso',
  FINALIZADA: 'finalizada',
  CANCELADA: 'cancelada',
  NO_ASISTIO: 'no_asistio',
};

// ============================================
// ESTADOS DE SUSCRIPCIÓN
// ============================================
export const ESTADOS_SUSCRIPCION = {
  PENDIENTE_PAGO: 'pendiente_pago',
  ACTIVA: 'activa',
  VENCIDA: 'vencida',
  SUSPENDIDA: 'suspendida',
  CANCELADA: 'cancelada',
};

// ============================================
// MÉTODOS DE PAGO
// ============================================
export const METODOS_PAGO = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  CHEQUE: 'cheque',
};

// ============================================
// VALIDACIONES
// ============================================
export const VALIDACIONES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  TELEFONO_MIN_LENGTH: 10,
  TELEFONO_MAX_LENGTH: 15,
  PASSWORD_MIN_LENGTH: 8,
  NOMBRE_MIN_LENGTH: 2,
  NOMBRE_MAX_LENGTH: 255,
};

// ============================================
// LÍMITES POR PLAN (futuro)
// ============================================
export const LIMITES_PLAN = {
  BASICO: {
    empleados: 3,
    sucursales: 1,
    citas_mensuales: 500,
    almacenamiento_mb: 100,
  },
  PROFESIONAL: {
    empleados: 10,
    sucursales: 5,
    citas_mensuales: 5000,
    almacenamiento_mb: 1000,
  },
  EMPRESARIAL: {
    empleados: Infinity,
    sucursales: Infinity,
    citas_mensuales: Infinity,
    almacenamiento_mb: Infinity,
  },
};

// ============================================
// DURACIONES POR DEFECTO
// ============================================
export const DURACIONES = {
  CORTE: 30,
  AFEITADO: 20,
  CORTE_AFEITADO: 50,
  SERVICIOS_ADICIONALES: 15,
};

// ============================================
// MENSAJES DE ERROR
// ============================================
export const MENSAJES_ERROR = {
  NO_AUTENTICADO: 'No autenticado. Por favor inicie sesión.',
  NO_AUTORIZADO: 'No tiene permisos para realizar esta acción.',
  USUARIO_NO_EXISTE: 'El usuario no existe.',
  EMAIL_YA_EXISTE: 'El email ya está registrado.',
  CONTRASEÑA_INVALIDA: 'Contraseña incorrecta.',
  SUSCRIPCION_VENCIDA: 'Su suscripción ha vencido.',
  SUSCRIPCION_SUSPENDIDA: 'Su suscripción ha sido suspendida.',
  CITA_DUPLICADA: 'Ya existe una cita en ese horario.',
  EMPLEADO_NO_DISPONIBLE: 'El empleado no está disponible en ese horario.',
  CAMPO_REQUERIDO: 'Este campo es requerido.',
  FORMATO_INVALIDO: 'El formato no es válido.',
};

// ============================================
// CONFIGURACIÓN DE SESIÓN
// ============================================
export const SESION = {
  JWT_EXPIRATION: '24h',
  JWT_REFRESH_EXPIRATION: '7d',
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 50,
};

// ============================================
// CONFIGURACIÓN DE PRUEBA TRIAL
// ============================================
export const TRIAL = {
  DIAS: 14,
  LIMITE_EMPLEADOS: 3,
  LIMITE_SUCURSALES: 1,
};

// ============================================
// CONFIGURACIÓN DE RETENCIÓN DE DATOS
// ============================================
export const RETENCION = {
  TICKET_DIAS: 30,
  ACTIVITY_LOG_DIAS: 90,
  CITA_CANCELADA_DIAS: 7,
};

export default {
  ROLES,
  PERMISOS,
  ESTADOS_CITA,
  ESTADOS_SUSCRIPCION,
  METODOS_PAGO,
  VALIDACIONES,
  LIMITES_PLAN,
  DURACIONES,
  MENSAJES_ERROR,
  SESION,
  TRIAL,
  RETENCION,
};
