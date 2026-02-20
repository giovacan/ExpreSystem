// src/backend/routes/auth.js

/**
 * RUTAS DE AUTENTICACIÓN
 */

const express = require('express');
const router = express.Router();
const { login, register, refreshToken, logout } = require('../controllers/authController');
const { limiterLogin, limiterRegistro } = require('../middleware/rateLimiter');

/**
 * POST /auth/login
 * Iniciar sesión
 * Body: { email, password }
 */
router.post('/login', limiterLogin, login);

/**
 * POST /auth/register
 * Registrar nuevo negocio
 * Body: { nombre_negocio, nombre_owner, email, password, password_confirmacion }
 */
router.post('/register', limiterRegistro, register);

/**
 * POST /auth/refresh
 * Generar nuevo access token
 * Body: { refreshToken }
 */
router.post('/refresh', refreshToken);

/**
 * POST /auth/logout
 * Logout
 */
router.post('/logout', logout);

module.exports = router;
