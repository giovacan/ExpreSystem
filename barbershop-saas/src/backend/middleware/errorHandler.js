// src/backend/middleware/errorHandler.js

/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 * Captura y formatea errores
 */

/**
 * Middleware para capturar errores no manejados
 */
function errorHandler(error, req, res, next) {
  console.error('Error:', {
    mensaje: error.message,
    stack: error.stack,
    path: req.path,
    metodo: req.method,
  });

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      exito: false,
      mensaje: 'Error de validación',
      errores: error.details || error.message,
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token inválido',
    });
  }

  // Error de token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      exito: false,
      mensaje: 'Token expirado',
    });
  }

  // Error de Prisma (base de datos)
  if (error.code === 'P2002') {
    // Unique constraint failed
    return res.status(400).json({
      exito: false,
      mensaje: 'El valor ya existe',
    });
  }

  if (error.code === 'P2025') {
    // Record not found
    return res.status(404).json({
      exito: false,
      mensaje: 'Registro no encontrado',
    });
  }

  // Error genérico
  const statusCode = error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    exito: false,
    mensaje,
  });
}

/**
 * Middleware para rutas no encontradas
 */
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    exito: false,
    mensaje: 'Ruta no encontrada',
    path: req.path,
  });
}

module.exports = {
  errorHandler,
  rutaNoEncontrada,
};
