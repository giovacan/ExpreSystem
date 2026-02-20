# Backend Middleware

Este directorio contiene todos los middlewares de la aplicación.

Middlewares incluidos:
- auth.js → Validación de JWT y tokens
- permissions.js → Validación de permisos por rol
- errorHandler.js → Manejo centralizado de errores
- rateLimiter.js → Limitación de tasa de requests
- validation.js → Validación de inputs y campos
- subscriptionValidator.js → Validación de estado de suscripción
- activityLogger.js → Registro de auditoría

Los middlewares se aplican globalmente o por ruta según sea necesario.
