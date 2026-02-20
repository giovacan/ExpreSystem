# Backend Routes

Este directorio contiene todas las rutas (endpoints) de la API.

Cada archivo de rutas corresponde a una entidad:
- auth.js → Rutas de autenticación (/auth/login, /auth/register, etc.)
- usuarios.js → CRUD de usuarios
- sucursales.js → CRUD de sucursales
- empleados.js → CRUD de empleados
- clientes.js → CRUD de clientes
- servicios.js → CRUD de servicios
- citas.js → CRUD de citas
- pagos.js → Rutas de pagos y comisiones
- reportes.js → Rutas de reportes

Las rutas están protegidas por middleware de autenticación y validación de permisos.
