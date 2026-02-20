# 🧔 Barbershop SaaS – Sistema de Gestión Multi-Sucursal

**Versión:** 1.0.0  
**Autor:** Giovanny Canela  
**Estado:** En Desarrollo

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Roles y Permisos](#roles-y-permisos)
4. [Flujo de Negocio](#flujo-de-negocio)
5. [Instalación](#instalación)
6. [Estructura de Carpetas](#estructura-de-carpetas)
7. [Base de Datos](#base-de-datos)
8. [API Endpoints](#api-endpoints)

---

## 📖 Descripción General

**Barbershop SaaS** es una plataforma de gestión para barberías y salones que permite:

- 🏢 Gestión multi-sucursal ilimitada
- 👤 Gestión de clientes y citas
- 💇 Asignación de barberos/estilistas
- 💰 Cálculo automático de comisiones
- 💵 Control de pagos y propinas
- 📊 Reportes por sucursal, global y por empleado
- 🔐 Multi-tenant SaaS con suscripciones

**Stack Tecnológico:**
- Backend: Node.js + Express.js
- Base de datos: PostgreSQL
- ORM: Prisma
- Frontend: React + TailwindCSS
- Autenticación: JWT

---

## 🏗 Arquitectura

### Modelo Multi-Tenant

- Un negocio registrado = un tenant
- Cada tenant tiene sucursales ilimitadas
- Separación lógica por `negocio_id` en todas las tablas
- UUIDs como identificadores únicos

### Flujo SaaS Básico

```
1. Registro del negocio
   ↓
2. Creación automática de suscripción (pendiente_pago)
   ↓
3. Pago
   ↓
4. Suscripción activa
   ↓
5. Validación en cada operación crítica
```

---

## 🔐 Roles y Permisos

### 👑 Dueño (Owner)

**Acceso completo al negocio.**

| Acción | Permiso |
|--------|---------|
| Ver todas las sucursales | ✅ |
| Crear/eliminar sucursales | ✅ |
| Ver y editar empleados | ✅ |
| Cambiar comisiones | ✅ |
| Editar precios de servicios | ✅ |
| Ver reportes globales | ✅ |
| Ver historial completo | ✅ |
| Ver propinas y comisiones | ✅ |
| Cancelar citas | ✅ |
| Gestionar suscripción | ✅ |

---

### 🧾 Recepcionista

**Gestión operativa de citas y clientes de su sucursal.**

| Acción | Permiso |
|--------|---------|
| Registrar clientes | ✅ |
| Crear citas | ✅ |
| Asignar barbero | ✅ |
| Cancelar citas | ✅ |
| Editar precio al cobro (con ticket) | ✅ |
| Ver reportes de su sucursal | ✅ |
| Ver clientes de su sucursal | ✅ |
| Ver agenda de su sucursal | ✅ |
| Cambiar comisiones globales | ❌ |
| Eliminar sucursales | ❌ |
| Ver datos de otras sucursales | ❌ |

---

### ✂️ Barbero / Estilista

**Gestión únicamente de sus citas.**

| Acción | Permiso |
|--------|---------|
| Ver solo sus citas | ✅ |
| Cambiar estado (En proceso → Finalizada) | ✅ |
| Configurar su disponibilidad | ✅ |
| Solicitar cancelación (<1 hora antes) | ✅ |
| Ver sus ganancias personales | ✅ |
| Ver sus propinas acumuladas | ✅ |
| Ver ingresos de otros empleados | ❌ |
| Ver reportes generales | ❌ |
| Editar comisiones | ❌ |
| Crear citas para otros | ❌ |

---

### 🧹 Limpieza / Practicantes

**Acceso mínimo (opcional en 1.0).**

| Acción | Permiso |
|--------|---------|
| Ver estado general | ✅ |
| Marcar tareas de limpieza | ✅ (futuro) |
| Acceso completo | ❌ |

---

### 🛡️ Super Admin (Administrador de Plataforma)

**Control de toda la plataforma SaaS (sin panel visual en 1.0).**

| Acción | Permiso |
|--------|---------|
| Ver todos los negocios | ✅ |
| Activar/suspender negocios | ✅ |
| Modificar suscripciones | ✅ |
| Ver activity logs globales | ✅ |
| Acceso a base de datos | ✅ (endpoints protegidos) |

---

## 📊 Flujo de Negocio

### 1️⃣ Registro de Cliente

**Quién:** Recepcionista o sistema automático  
**Cuándo:** Primera vez que llega o reserva online

```
Datos capturados:
- Nombre
- Teléfono
- Sucursal
- Notas (opcional)
```

---

### 2️⃣ Agendar Cita

**Quién:** Recepcionista  
**Cuándo:** Cliente llama o reserva online

```
El sistema valida:
1. Sucursal existe y está activa
2. Cliente existe (crear si no)
3. Empleado está disponible en horario
4. Servicio está activo
5. No hay citas duplicadas en la misma hora

Pasos:
1. Seleccionar sucursal
2. Seleccionar cliente
3. Seleccionar servicio
4. Seleccionar empleado
5. Seleccionar fecha y hora disponible
6. Confirmar cita

Estados iniciales:
- Confirmada (por defecto)
```

---

### 3️⃣ Disponibilidad del Empleado

**Quién:** Barbero o Dueño  
**Cuándo:** Configuración inicial y cambios

```
El barbero puede definir:
- Horario por día (Lunes 10-18, Martes 12-20, etc.)
- Días libres
- Bloques de tiempo específicos (descanso, comida)

El sistema solo permite agendar dentro de esos horarios.
```

---

### 4️⃣ Cambio de Estado de Cita

**Estados posibles:**
- `confirmada` → Cita agendada
- `en_proceso` → Barbero comenzó el servicio
- `finalizada` → Servicio completado
- `cancelada` → Cita cancelada
- `no_asistio` → Cliente no presentó

**Transiciones:**
```
confirmada → en_proceso → finalizada
       ↓
   cancelada

confirmada → no_asistio
```

---

### 5️⃣ Cobro y Registro de Pago

**Quién:** Recepcionista  
**Cuándo:** Al finalizar la cita

```
Se registra:
1. Precio base del servicio
2. Precio final (editable con restricción)
3. Método de pago (efectivo, tarjeta, transferencia)
4. Propina (opcional, separada del precio)

Restricción de edición de precio:
- Solo se puede editar si se adjunta ticket/factura
- La imagen se guarda 30 días
- Después se elimina automáticamente
- En futuro: OCR para validación automática
```

---

### 6️⃣ Cálculo de Comisión

**Fórmula:**
```
Comisión = Precio Final × % del Empleado

Nota: La propina NO incluye en el cálculo de comisión.
```

**Ejemplo:**
```
Servicio: Corte + Afeitado
Precio base: $50
Precio final: $50
% Comisión barbero: 40%

Comisión generada: $50 × 40% = $20

Si el cliente deja propina de $10:
- Comisión del barbero: $20 (no cambia)
- Propina del barbero: $10 (separada)
- Total para barbero: $30
```

---

### 7️⃣ Reportes

#### 📊 Por Sucursal (Recepcionista)
- Total de ventas del día/mes
- Total de propinas
- Total de comisiones pagadas
- Empleado más productivo
- Servicios más vendidos

#### 📊 Global (Dueño)
- Comparación entre sucursales
- Ventas totales
- Ranking de empleados
- Propinas por sucursal
- Comisiones pagadas

#### 📊 Por Empleado (Barbero)
- Mis servicios realizados
- Total generado
- Comisión acumulada
- Propinas acumuladas

---

## 💾 Instalación

### Requisitos
- Node.js >= 18
- PostgreSQL >= 14
- Git

### Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/tuusuario/barbershop-saas.git
cd barbershop-saas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con datos de BD y secretos

# 4. Crear base de datos y ejecutar migraciones
npm run prisma:migrate

# 5. Generar cliente Prisma
npm run prisma:generate

# 6. Ejecutar en desarrollo
npm run dev
```

---

## 📁 Estructura de Carpetas

```
barbershop-saas/
├── src/
│   ├── backend/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── usuariosController.js
│   │   │   ├── sucursalesController.js
│   │   │   ├── empleadosController.js
│   │   │   ├── clientesController.js
│   │   │   ├── serviciosController.js
│   │   │   ├── citasController.js
│   │   │   ├── pagosController.js
│   │   │   └── reportesController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── usuarios.js
│   │   │   ├── sucursales.js
│   │   │   ├── empleados.js
│   │   │   ├── clientes.js
│   │   │   ├── servicios.js
│   │   │   ├── citas.js
│   │   │   ├── pagos.js
│   │   │   └── reportes.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Appointment.js
│   │   │   └── Payment.js
│   │   ├── middleware/
│   │   │   ├── auth.js (JWT validation)
│   │   │   ├── permissions.js (role-based)
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validation.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── hash.js
│   │   │   ├── validators.js
│   │   │   └── activityLog.js
│   │   ├── scripts/
│   │   │   ├── seed.js
│   │   │   └── migrations.js
│   │   └── server.js
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Agenda.jsx
│   │   │   │   ├── Clientes.jsx
│   │   │   │   ├── Servicios.jsx
│   │   │   │   ├── Empleados.jsx
│   │   │   │   ├── Pagos.jsx
│   │   │   │   └── Reportes.jsx
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── styles/
│   │   │   ├── App.jsx
│   │   │   └── index.js
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── config/
│   │   ├── database.js
│   │   └── constants.js
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 💾 Base de Datos

### Tablas Principales

| Tabla | Propósito |
|-------|-----------|
| `negocios` | Información del negocio/tenant |
| `sucursales` | Sucursales del negocio |
| `usuarios` | Usuarios del sistema (dueño, recepcionista, barbero) |
| `roles` | Roles disponibles por negocio |
| `empleados` | Información de barberos/estilistas |
| `clientes` | Clientes del negocio |
| `servicios` | Servicios ofrecidos (corte, afeitado, etc.) |
| `citas` | Registro de citas agendadas |
| `pagos` | Registros de pagos de citas |
| `propinas` | Propinas registradas |
| `comisiones` | Comisiones calculadas automáticamente |
| `planes` | Planes de suscripción |
| `suscripciones` | Suscripciones activas de negocios |
| `activity_logs` | Auditoría de acciones del sistema |

---

## 🔌 API Endpoints

### Autenticación

```
POST   /auth/login              Login usuario / super admin
POST   /auth/register           Registro negocio
POST   /auth/refresh            Refresh token
POST   /auth/logout             Logout
```

### Usuarios y Roles

```
POST   /usuarios                Crear usuario
GET    /usuarios                Listar usuarios
PUT    /usuarios/:id            Editar usuario
DELETE /usuarios/:id            Soft delete usuario
GET    /roles                   Listar roles disponibles
```

### Sucursales

```
POST   /sucursales              Crear sucursal
GET    /sucursales              Listar sucursales
PUT    /sucursales/:id          Editar sucursal
DELETE /sucursales/:id          Desactivar sucursal
```

### Empleados

```
POST   /empleados               Crear empleado
GET    /empleados               Listar empleados
PUT    /empleados/:id           Editar empleado
DELETE /empleados/:id           Desactivar empleado
PUT    /empleados/:id/disponibilidad  Actualizar disponibilidad
```

### Clientes

```
POST   /clientes                Crear cliente
GET    /clientes                Listar clientes
PUT    /clientes/:id            Editar cliente
DELETE /clientes/:id            Soft delete cliente
```

### Servicios

```
POST   /servicios               Crear servicio
GET    /servicios               Listar servicios
PUT    /servicios/:id           Editar servicio
DELETE /servicios/:id           Desactivar servicio
```

### Citas

```
POST   /citas                   Crear cita
GET    /citas                   Listar citas
PUT    /citas/:id               Editar estado de cita
DELETE /citas/:id               Cancelar cita
GET    /citas/disponibilidad    Ver horarios disponibles
```

### Pagos y Comisiones

```
POST   /pagos                   Registrar pago
POST   /propinas                Registrar propina
GET    /comisiones              Listar comisiones
GET    /comisiones/:empleado_id Comisiones de un empleado
```

### Reportes

```
GET    /reportes/sucursal       Reporte por sucursal
GET    /reportes/global         Reporte global
GET    /reportes/empleado/:id   Reporte por empleado
GET    /reportes/exportar       Exportar a CSV
```

---

## 🔒 Seguridad

✅ JWT con refresh tokens  
✅ Validación de inputs (SQL injection, XSS)  
✅ Rate limiting (50 requests/min por IP)  
✅ HTTPS obligatorio  
✅ Soft delete en todas las tablas  
✅ Activity logs de todas las acciones  
✅ Validación de suscripción en middleware  

---

## 📝 Contribuciones

Este es un proyecto privado. Para contribuir, contactar a Giovanny Canela.

---

## 📄 Licencia

MIT License – Consultar LICENSE.md

---

**Última actualización:** Febrero 2025  
**Versión:** 1.0.0-alpha
