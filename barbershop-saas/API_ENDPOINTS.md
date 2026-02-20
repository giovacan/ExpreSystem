# 🔌 API ENDPOINTS – BLOQUE 3 (Autenticación y Usuarios)

## 📌 Base URL
```
http://localhost:3001/api
```

## 🔑 Autenticación

Todos los endpoints (excepto `/auth/login`, `/auth/register` y `/auth/refresh`) requieren token JWT en el header:

```
Authorization: Bearer <access_token>
```

---

## 🚪 AUTENTICACIÓN (/auth)

### 1. Login
**POST** `/auth/login`

Iniciar sesión con email y contraseña.

**Request:**
```json
{
  "email": "owner@barbershop.com",
  "password": "password123"
}
```

**Response (200 - Exitoso):**
```json
{
  "exito": true,
  "mensaje": "Login exitoso",
  "data": {
    "usuario": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "owner@barbershop.com",
      "rol": "owner",
      "es_super_admin": false,
      "negocio": {
        "id": "uuid",
        "nombre": "Barberría Premium"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**Errores:**
- `400` – Email o contraseña inválidos
- `403` – Usuario inactivo o suscripción vencida

---

### 2. Register
**POST** `/auth/register`

Registrar un nuevo negocio (crear cuenta).

**Request:**
```json
{
  "nombre_negocio": "Mi Barberría",
  "nombre_owner": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "password_confirmacion": "password123"
}
```

**Response (201 - Creado):**
```json
{
  "exito": true,
  "mensaje": "Registro exitoso",
  "data": {
    "usuario": { /* datos usuario */ },
    "negocio": { /* datos negocio */ },
    "sucursal": { /* datos sucursal principal */ },
    "suscripcion": {
      "estado": "pendiente_pago",
      "fecha_fin": "2025-03-19"
    },
    "tokens": { /* access y refresh token */ }
  }
}
```

**Errores:**
- `400` – Validación fallida (email, contraseñas, etc.)
- `400` – Email ya registrado

---

### 3. Refresh Token
**POST** `/auth/refresh`

Generar nuevo access token usando refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Token renovado",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

### 4. Logout
**POST** `/auth/logout`

Logout (principalmente para UI, backend es stateless).

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Logout exitoso. Elimine los tokens del cliente."
}
```

---

## 👤 USUARIOS (/usuarios)

### 1. Crear Usuario
**POST** `/usuarios`

Crear nuevo usuario (requiere permiso `crear_usuario`).

**Requerimientos:**
- Autenticado: ✅
- Permiso: `crear_usuario` (owner)

**Request:**
```json
{
  "nombre": "Carlos López",
  "email": "carlos@barbershop.com",
  "password": "password123",
  "rol_id": "uuid-del-rol-barbero",
  "sucursal_id": "uuid-sucursal"
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Usuario creado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "Carlos López",
    "email": "carlos@barbershop.com",
    "rol": "barbero",
    "sucursal": {
      "id": "uuid",
      "nombre": "Sucursal Centro"
    }
  }
}
```

**Errores:**
- `400` – Email ya registrado
- `404` – Rol no encontrado
- `403` – No autorizado

---

### 2. Listar Usuarios
**GET** `/usuarios`

Listar todos los usuarios del negocio.

**Requerimientos:**
- Autenticado: ✅

**Query Parameters:**
- `sucursal_id` (opcional) – Filtrar por sucursal
- `rol_id` (opcional) – Filtrar por rol
- `activo` (opcional) – true/false

**Ejemplo:**
```
GET /usuarios?activo=true&sucursal_id=uuid-123
```

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "owner@barbershop.com",
      "rol": {
        "id": "uuid",
        "nombre": "owner"
      },
      "sucursal": { /* ... */ },
      "activo": true,
      "fecha_creacion": "2025-02-19T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

### 3. Obtener Usuario
**GET** `/usuarios/:id`

Obtener usuario específico por ID.

**Requerimientos:**
- Autenticado: ✅

**Response (200):**
```json
{
  "exito": true,
  "data": { /* datos completos del usuario */ }
}
```

**Errores:**
- `404` – Usuario no encontrado
- `403` – No tiene acceso a este usuario

---

### 4. Actualizar Usuario
**PUT** `/usuarios/:id`

Actualizar usuario (nombre, email, rol, contraseña).

**Requerimientos:**
- Autenticado: ✅
- Permiso: `editar_usuario`

**Request:**
```json
{
  "nombre": "Carlos Miguel López",
  "email": "carlos.lopez@barbershop.com",
  "rol_id": "uuid-nuevo-rol",
  "password": "nueva_contraseña_123"
}
```

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Usuario actualizado",
  "data": { /* datos actualizados */ }
}
```

**Errores:**
- `404` – Usuario no encontrado
- `400` – Email ya existe
- `403` – No autorizado

---

### 5. Eliminar Usuario (Soft Delete)
**DELETE** `/usuarios/:id`

Desactivar usuario (no se elimina físicamente).

**Requerimientos:**
- Autenticado: ✅
- Permiso: `eliminar_usuario`

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Usuario desactivado"
}
```

**Errores:**
- `404` – Usuario no encontrado
- `400` – No puede eliminar su propia cuenta
- `403` – No autorizado

---

## 🏷️ ROLES (/roles)

### 1. Crear Rol
**POST** `/roles`

Crear nuevo rol personalizado.

**Requerimientos:**
- Autenticado: ✅
- Permiso: `cambiar_comisiones` (owner)

**Request:**
```json
{
  "nombre": "supervisor",
  "descripcion": "Supervisor de barberías"
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Rol creado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "supervisor",
    "descripcion": "Supervisor de barberías"
  }
}
```

---

### 2. Listar Roles
**GET** `/roles`

Listar todos los roles del negocio.

**Query Parameters:**
- `activo` (opcional) – true/false

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "owner",
      "descripcion": "Propietario del negocio",
      "activo": true,
      "_count": {
        "usuarios": 1
      }
    }
  ],
  "total": 1
}
```

---

### 3. Obtener Rol
**GET** `/roles/:id`

Obtener rol específico con sus usuarios asignados.

**Response (200):**
```json
{
  "exito": true,
  "data": {
    "id": "uuid",
    "nombre": "owner",
    "descripcion": "...",
    "activo": true,
    "usuarios": [ /* usuarios con este rol */ ]
  }
}
```

---

### 4. Actualizar Rol
**PUT** `/roles/:id`

Actualizar nombre, descripción o estado.

**Request:**
```json
{
  "descripcion": "Nueva descripción",
  "activo": true
}
```

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Rol actualizado",
  "data": { /* datos actualizados */ }
}
```

---

### 5. Eliminar Rol (Soft Delete)
**DELETE** `/roles/:id`

Desactivar rol (si no tiene usuarios asignados).

**Response (200):**
```json
{
  "exito": true,
  "mensaje": "Rol desactivado"
}
```

**Errores:**
- `400` – Tiene usuarios asignados
- `400` – Es un rol del sistema (no se puede eliminar)

---

## 🔐 Códigos de Error

| Código | Significado |
|--------|-----------|
| `200` | Exitoso |
| `201` | Creado |
| `400` | Solicitud inválida (validación) |
| `401` | No autenticado |
| `403` | No autorizado (permisos insuficientes) |
| `404` | No encontrado |
| `429` | Demasiadas solicitudes (rate limit) |
| `500` | Error del servidor |

---

## 🛡️ Rate Limiting

- **General:** 50 requests/minuto por IP
- **Login:** 5 intentos/15 minutos
- **Register:** 3 registros/hora

---

## 📝 Notas

- Los tokens JWT expiran en **24 horas** (access) y **7 días** (refresh)
- Todos los datos sensibles están encriptados (contraseñas con bcrypt)
- Las contraseñas mínimo **8 caracteres**
- Los usuarios eliminados usan **soft delete** (campo `activo = false`)
- Super admin tiene acceso a todo sin restricciones

---

## 🧪 Probar con cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@barbershop.com",
    "password": "password123"
  }'

# Listar usuarios (requiere token)
curl -X GET http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer <access_token>"

# Crear usuario
curl -X POST http://localhost:3001/api/usuarios \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos López",
    "email": "carlos@barbershop.com",
    "password": "password123",
    "rol_id": "uuid-rol",
    "sucursal_id": "uuid-sucursal"
  }'
```

