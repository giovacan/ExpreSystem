// src/backend/utils/validators.js

/**
 * UTILIDADES VALIDADORES
 * Funciones para validar inputs del usuario
 */

const validator = require('validator');

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} true si es válido
 */
function validarEmail(email) {
  return validator.isEmail(email);
}

/**
 * Validar contraseña (mínimo 8 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si es válida
 */
function validarPassword(password) {
  if (!password || password.length < 8) {
    return false;
  }
  return true;
}

/**
 * Validar nombre (2-255 caracteres)
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} true si es válido
 */
function validarNombre(nombre) {
  if (!nombre || nombre.length < 2 || nombre.length > 255) {
    return false;
  }
  return true;
}

/**
 * Validar teléfono (10-20 caracteres, solo números y símbolos)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} true si es válido
 */
function validarTelefono(telefono) {
  if (!telefono) return true; // Opcional
  const regex = /^[\d\-\+\(\)\s]+$/;
  if (telefono.length < 10 || telefono.length > 20) {
    return false;
  }
  return regex.test(telefono);
}

/**
 * Validar campo requerido
 * @param {any} valor - Valor a validar
 * @returns {boolean} true si existe y no está vacío
 */
function validarRequerido(valor) {
  return valor !== null && valor !== undefined && valor !== '';
}

/**
 * Validar UUID v4
 * @param {string} uuid - UUID a validar
 * @returns {boolean} true si es válido
 */
function validarUUID(uuid) {
  return validator.isUUID(uuid, 4);
}

/**
 * Sanitizar string (eliminar caracteres peligrosos)
 * @param {string} str - String a sanitizar
 * @returns {string} String sanitizado
 */
function sanitizar(str) {
  return validator.trim(validator.escape(str));
}

/**
 * Validar objeto con esquema básico
 * @param {Object} data - Datos a validar
 * @param {Object} schema - Esquema {campo: tipo|'requerido'}
 * @returns {Object} {valido: boolean, errores: Array}
 */
function validarEsquema(data, schema) {
  const errores = [];

  for (const [campo, regla] of Object.entries(schema)) {
    const valor = data[campo];

    if (regla.includes('requerido')) {
      if (!validarRequerido(valor)) {
        errores.push(`${campo} es requerido`);
      }
    }

    if (regla.includes('email') && valor) {
      if (!validarEmail(valor)) {
        errores.push(`${campo} debe ser un email válido`);
      }
    }

    if (regla.includes('password') && valor) {
      if (!validarPassword(valor)) {
        errores.push(`${campo} debe tener mínimo 8 caracteres`);
      }
    }

    if (regla.includes('nombre') && valor) {
      if (!validarNombre(valor)) {
        errores.push(`${campo} debe tener entre 2 y 255 caracteres`);
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
}

module.exports = {
  validarEmail,
  validarPassword,
  validarNombre,
  validarTelefono,
  validarRequerido,
  validarUUID,
  sanitizar,
  validarEsquema,
};
