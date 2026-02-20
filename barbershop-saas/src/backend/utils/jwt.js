// src/backend/utils/jwt.js

/**
 * UTILIDADES JWT
 * Generar y validar tokens de autenticación
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_super_secreto_desarrollo';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tu_super_secreto_refresh_desarrollo';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generar JWT access token
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Token firmado
 */
function generarAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

/**
 * Generar JWT refresh token
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} Refresh token firmado
 */
function generarRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });
}

/**
 * Verificar y decodificar access token
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload del token o null si es inválido
 */
function verificarAccessToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verificar y decodificar refresh token
 * @param {string} token - Token a verificar
 * @returns {Object|null} Payload del token o null si es inválido
 */
function verificarRefreshToken(token) {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Decodificar token sin verificar (solo lectura)
 * @param {string} token - Token a decodificar
 * @returns {Object|null} Payload del token
 */
function decodificarToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generarAccessToken,
  generarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
  decodificarToken,
};
