// src/backend/middleware/rateLimiter.js

/**
 * MIDDLEWARE DE RATE LIMITING
 * Limita requests por IP
 */

const rateLimit = require('express-rate-limit');

// Rate limiter general: 50 requests por minuto
const limiterGeneral = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 50, // máximo 50 requests
  message: {
    exito: false,
    mensaje: 'Demasiadas solicitudes. Intente más tarde.',
  },
  standardHeaders: true, // Retorna info en RateLimit-* headers
  legacyHeaders: false, // Desactiva X-RateLimit-* headers
  skip: (req) => {
    // No aplicar rate limit a super admin
    if (req.user?.es_super_admin) {
      return true;
    }
    return false;
  },
});

// Rate limiter para login: 5 intentos por 15 minutos
const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: {
    exito: false,
    mensaje: 'Demasiados intentos de login. Intente más tarde.',
  },
  skipSuccessfulRequests: true, // No contar intentos exitosos
});

// Rate limiter para registro: 3 por hora por IP
const limiterRegistro = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 registros
  message: {
    exito: false,
    mensaje: 'Demasiados registros. Intente más tarde.',
  },
});

module.exports = {
  limiterGeneral,
  limiterLogin,
  limiterRegistro,
};
