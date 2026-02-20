# 🔌 API ENDPOINTS – BLOQUE 4 (Clientes, Servicios, Citas, Pagos)

**Continuación de:** `API_ENDPOINTS.md` - Lee Bloque 3 primero.

## 📌 Base URL
```
http://localhost:3001/api
```

---

## 👥 CLIENTES (/clientes)

### 1. Crear Cliente
**POST** `/clientes`

Registrar nuevo cliente.

**Requerimientos:**
- Autenticado: ✅
- Permiso: `registrar_clientes`

**Request:**
```json
{
  "nombre": "Roberto Silva",
  "telefono": "+1-555-1001",
  "sucursal_id": "uuid-sucursal",
  "fecha_nacimiento": "1990-05-15",
  "notas": "Cliente VIP, preferencias especiales"
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Cliente creado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "Roberto Silva",
    "telefono": "+1-555-1001",
    "fecha_registro": "2025-02-19T10:00:00Z"
  }
}
```

---

### 2. Listar Clientes
**GET** `/clientes`

Listar clientes con filtros y últimas 5 citas.

**Query Parameters:**
- `sucursal_id` (opcional)
- `nombre` (opcional) – búsqueda parcial
- `activo` (opcional) – true/false

**Example:**
```
GET /clientes?sucursal_id=uuid&activo=true
```

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Roberto Silva",
      "telefono": "+1-555-1001",
      "sucursal": {
        "id": "uuid",
        "nombre": "Sucursal Centro"
      },
      "citas": [
        {
          "id": "uuid",
          "fecha": "2025-02-19",
          "estado": "finalizada"
        }
      ],
      "activo": true,
      "fecha_registro": "2025-02-19T10:00:00Z"
    }
  ],
  "total": 5
}
```

---

### 3. Obtener Cliente
**GET** `/clientes/:id`

Obtener cliente con todas sus citas.

**Response (200):**
```json
{
  "exito": true,
  "data": {
    "id": "uuid",
    "nombre": "Roberto Silva",
    "telefono": "+1-555-1001",
    "citas": [
      {
        "id": "uuid",
        "fecha": "2025-02-19",
        "empleado": { "usuario": { "nombre": "Carlos López" } },
        "servicio": { "nombre": "Corte", "precio_base": 25.00 },
        "pagos": [ /* ... */ ]
      }
    ]
  }
}
```

---

### 4. Actualizar Cliente
**PUT** `/clientes/:id`

Actualizar datos del cliente.

**Request:**
```json
{
  "nombre": "Roberto S. Silva",
  "telefono": "+1-555-1010",
  "notas": "Preferencias actualizadas"
}
```

---

### 5. Eliminar Cliente (Soft Delete)
**DELETE** `/clientes/:id`

---

## ✂️ SERVICIOS (/servicios)

### 1. Crear Servicio
**POST** `/servicios`

Crear nuevo servicio con precio y duración.

**Requerimientos:**
- Permiso: `editar_precios`

**Request:**
```json
{
  "sucursal_id": "uuid",
  "nombre": "Corte de Cabello",
  "precio_base": 25.00,
  "duracion_minutos": 30
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Servicio creado exitosamente",
  "data": {
    "id": "uuid",
    "nombre": "Corte de Cabello",
    "precio_base": 25.00,
    "duracion_minutos": 30
  }
}
```

---

### 2. Listar Servicios
**GET** `/servicios`

Listar servicios activos.

**Query:**
- `sucursal_id` (opcional)
- `activo` (opcional) – true/false

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "nombre": "Corte de Cabello",
      "precio_base": 25.00,
      "duracion_minutos": 30,
      "sucursal": { "id": "uuid", "nombre": "Centro" },
      "activo": true,
      "_count": { "citas": 45 }
    }
  ],
  "total": 3
}
```

---

### 3. Obtener Servicio
**GET** `/servicios/:id`

---

### 4. Actualizar Servicio
**PUT** `/servicios/:id`

Cambiar nombre, precio, duración o estado.

---

### 5. Eliminar Servicio
**DELETE** `/servicios/:id`

⚠️ No permite eliminar si hay citas futuras.

---

## 📅 CITAS (/citas)

### 1. Crear Cita
**POST** `/citas`

Agendar nueva cita. **Valida automáticamente:**
- ✅ Disponibilidad del empleado
- ✅ No solapamiento
- ✅ Duración según servicio

**Requerimientos:**
- Permiso: `crear_citas`

**Request:**
```json
{
  "cliente_id": "uuid-cliente",
  "empleado_id": "uuid-empleado",
  "servicio_id": "uuid-servicio",
  "sucursal_id": "uuid-sucursal",
  "fecha": "2025-02-20",
  "hora_inicio": "10:00"
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Cita creada exitosamente",
  "data": {
    "id": "uuid",
    "fecha": "2025-02-20",
    "hora": "10:00 - 10:30",
    "cliente": "Roberto Silva",
    "empleado": "Carlos López",
    "servicio": "Corte de Cabello",
    "precio": 25.00
  }
}
```

**Errores:**
- `400` – El empleado no está disponible ese día
- `400` – La hora está fuera del horario disponible
- `400` – El empleado ya tiene una cita en ese horario

---

### 2. Obtener Horarios Disponibles
**GET** `/citas/disponibles?empleado_id=uuid&fecha=2025-02-20`

Ver todos los horarios disponibles para agendar.

**Response (200):**
```json
{
  "exito": true,
  "data": {
    "fecha": "2025-02-20",
    "horarios_disponibles": [
      { "horaInicio": "09:00", "horaFin": "09:30" },
      { "horaInicio": "09:30", "horaFin": "10:00" },
      { "horaInicio": "10:00", "horaFin": "10:30" }
    ],
    "total": 3
  }
}
```

---

### 3. Listar Citas
**GET** `/citas`

Listar citas con múltiples filtros.

**Query:**
- `sucursal_id` (opcional)
- `empleado_id` (opcional)
- `cliente_id` (opcional)
- `estado` (opcional) – confirmada, en_proceso, finalizada, cancelada, no_asistio
- `fecha_desde` (opcional) – 2025-02-01
- `fecha_hasta` (opcional) – 2025-02-28

**Example:**
```
GET /citas?estado=confirmada&fecha_desde=2025-02-01&fecha_hasta=2025-02-28
```

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "fecha": "2025-02-20",
      "hora_inicio": "10:00",
      "estado": "confirmada",
      "cliente": { "nombre": "Roberto Silva" },
      "empleado": { "usuario": { "nombre": "Carlos López" } },
      "servicio": { "nombre": "Corte", "precio_base": 25.00 }
    }
  ],
  "total": 15
}
```

---

### 4. Obtener Cita
**GET** `/citas/:id`

Ver detalles completos de una cita (incluye pagos, propinas, comisiones).

---

### 5. Actualizar Estado de Cita
**PUT** `/citas/:id`

Cambiar estado de cita.

**Request:**
```json
{
  "estado": "en_proceso"
}
```

**Estados válidos:**
- `confirmada` – Agendada
- `en_proceso` – En ejecución
- `finalizada` – Completada
- `cancelada` – Cancelada
- `no_asistio` – Cliente no asistió

---

### 6. Cancelar Cita
**DELETE** `/citas/:id`

Cambiar estado a `cancelada`.

---

## 💰 PAGOS Y COMISIONES

### 1. Registrar Pago
**POST** `/pagos`

Registrar pago de cita y **calcular automáticamente la comisión**.

**Requerimientos:**
- Permiso: `editar_precio_cobro`

**Request:**
```json
{
  "cita_id": "uuid",
  "precio_final": 25.00,
  "metodo_pago": "efectivo"
}
```

**Métodos válidos:** `efectivo`, `tarjeta`, `transferencia`, `cheque`

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Pago registrado exitosamente",
  "data": {
    "pago": {
      "id": "uuid",
      "cita_id": "uuid",
      "precio_base": 25.00,
      "precio_final": 25.00,
      "metodo_pago": "efectivo"
    },
    "comision": {
      "id": "uuid",
      "monto": 10.00,
      "porcentaje": 40
    }
  }
}
```

**Notas:**
- ✅ La comisión se calcula automáticamente: `precio_final × % empleado`
- ✅ El estado de la cita cambia a `finalizada`
- ❌ No se pueden registrar dos pagos para la misma cita

---

### 2. Registrar Propina
**POST** `/pagos/propinas`

Registrar propina (separada de la comisión).

**Request:**
```json
{
  "cita_id": "uuid",
  "empleado_id": "uuid",
  "monto": 5.00
}
```

**Response (201):**
```json
{
  "exito": true,
  "mensaje": "Propina registrada",
  "data": {
    "id": "uuid",
    "monto": 5.00,
    "fecha": "2025-02-20T10:30:00Z"
  }
}
```

**Nota:** La propina no afecta el cálculo de comisión.

---

### 3. Listar Pagos
**GET** `/pagos`

Listar todos los pagos registrados.

**Query:**
- `sucursal_id` (opcional)
- `metodo_pago` (opcional)
- `fecha_desde` (opcional)
- `fecha_hasta` (opcional)

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "cita_id": "uuid",
      "precio_base": 25.00,
      "precio_final": 25.00,
      "metodo_pago": "efectivo",
      "cita": {
        "cliente": { "nombre": "Roberto Silva" },
        "empleado": { "usuario": { "nombre": "Carlos López" } },
        "servicio": { "nombre": "Corte" }
      }
    }
  ],
  "total": 120,
  "total_pagos": "3000.00"
}
```

---

### 4. Listar Comisiones
**GET** `/pagos/comisiones`

Listar todas las comisiones del negocio.

**Query:**
- `empleado_id` (opcional)
- `fecha_desde` (opcional)
- `fecha_hasta` (opcional)

**Response (200):**
```json
{
  "exito": true,
  "data": [
    {
      "id": "uuid",
      "monto": 10.00,
      "porcentaje_aplicado": 40,
      "cita": {
        "id": "uuid",
        "fecha": "2025-02-20",
        "cliente": { "nombre": "Roberto Silva" }
      },
      "empleado": {
        "usuario": { "nombre": "Carlos López" },
        "porcentaje_comision": 40
      }
    }
  ],
  "total": 45,
  "total_comisiones": "450.00"
}
```

---

### 5. Comisiones de Empleado
**GET** `/pagos/comisiones/:empleado_id`

Ver comisiones y propinas de un empleado específico (con resumen).

**Query:**
- `fecha_desde` (opcional)
- `fecha_hasta` (opcional)

**Response (200):**
```json
{
  "exito": true,
  "data": {
    "empleado": {
      "id": "uuid",
      "nombre": "Carlos López",
      "porcentaje_comision": 40
    },
    "comisiones": [ /* ... */ ],
    "propinas": [ /* ... */ ],
    "resumen": {
      "total_comisiones": "1200.00",
      "total_propinas": "150.00",
      "total_ganancia": "1350.00",
      "cantidad_comisiones": 48,
      "cantidad_propinas": 12
    }
  }
}
```

---

## 📊 Ejemplo de Flujo Completo

```
1. Crear cliente
   POST /api/clientes

2. Ver horarios disponibles
   GET /api/citas/disponibles?empleado_id=xxx&fecha=2025-02-20

3. Crear cita
   POST /api/citas

4. Cambiar a "en_proceso"
   PUT /api/citas/:id { estado: "en_proceso" }

5. Registrar pago (calcula comisión automáticamente)
   POST /api/pagos

6. Registrar propina (opcional)
   POST /api/pagos/propinas

7. Ver comisiones del empleado
   GET /api/pagos/comisiones/:empleado_id
```

---

## 🔐 Permisos Requeridos

| Endpoint | Método | Permiso |
|----------|--------|---------|
| /clientes | POST | `registrar_clientes` |
| /servicios | POST | `editar_precios` |
| /citas | POST | `crear_citas` |
| /pagos | POST | `editar_precio_cobro` |
| /comisiones | GET | `ver_propinas_comisiones` |

---

## ⚠️ Validaciones Automáticas

### Citas
- ✅ Empleado disponible en día y hora
- ✅ Sin solapamiento de citas
- ✅ Duración según servicio
- ✅ Cliente existe
- ✅ Sucursal pertenece al negocio

### Pagos
- ✅ Cita existe
- ✅ No hay pago previo
- ✅ Monto es positivo
- ✅ Método de pago es válido
- ✅ Comisión se calcula automáticamente

### Servicios
- ✅ No se elimina si hay citas futuras

