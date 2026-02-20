// src/backend/utils/hash.js

/**
 * UTILIDADES HASH
 * Hashear y verificar contraseñas
 */

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hashear contraseña
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} Contraseña hasheada
 */
async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    throw new Error('Error al hashear contraseña: ' + error.message);
  }
}

/**
 * Verificar contraseña contra hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} true si coinciden, false si no
 */
async function verificarPassword(password, hash) {
  try {
    const esValido = await bcrypt.compare(password, hash);
    return esValido;
  } catch (error) {
    throw new Error('Error al verificar contraseña: ' + error.message);
  }
}

module.exports = {
  hashPassword,
  verificarPassword,
};
