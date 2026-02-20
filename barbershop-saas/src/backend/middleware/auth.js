// src/backend/middleware/auth.js

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Valida JWT y extrae usuario del token
 */

const { verificarAccessToken } = require('../utils/jwt');

/**
 * Middleware para validar JWT
 * Extrae usuario del token y lo agrega a req.user
 */
function autenticar(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({
        exito: false,
        mensaje: 'No autorizado. Token requerido.',
      });
    }

    // Formato esperado: "Bearer token"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        exito: false,
        mensaje: 'Formato de token inválido. Use "Bearer token".',
      });
    }

    const token = parts[1];

    // Verificar token
    const payload = verificarAccessToken(token);
    
    if (!payload) {
      return res.status(401).json({
        exito: false,
        mensaje: 'Token inválido o expirado.',
      });
    }

    // Agregar usuario a request
    req.user = payload;
    next();
  } catch (error) {
    console.error('Error en middleware autenticar:', error);
    return res.status(500).json({
      exito: false,
      mensaje: 'Error al validar token.',
    });
  }
}

/**
 * Middleware para validar que usuario sea super admin
 */
function validarSuperAdmin(req, res, next) {
  if (!req.user.es_super_admin) {
    return res.status(403).json({
      exito: false,
      mensaje: 'Acceso denegado. Se requiere permisos de super admin.',
    });
  }
  next();
}

module.exports = {
  autenticar,
  validarSuperAdmin,
};
