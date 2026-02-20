# 💾 Base de Datos - Prisma ORM

Este directorio contiene toda la configuración de la base de datos usando Prisma.

## 📁 Estructura

```
prisma/
├── schema.prisma        # Schema principal (todas las tablas y relaciones)
├── schema.sql          # SQL puro para PostgreSQL (opcional)
├── migrations/         # Migraciones de Prisma
└── README.md          # Este archivo
```

## 🚀 Setup Inicial

### 1. Instalar dependencias
```bash
npm install
npm run prisma:generate
```

### 2. Configurar base de datos

Editar `.env` en raíz del proyecto:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/barbershop_saas"
```

### 3. Ejecutar migraciones

```bash
# Crear tablas en BD
npm run prisma:migrate

# Generar cliente Prisma
npm run prisma:generate
```

### 4. Cargar datos de prueba

```bash
npm run seed
```

Esto creará:
- 1 negocio (Barberría Premium)
- 2 sucursales
- 5 roles
- 5 usuarios (1 owner, 1 recepcionista, 2 barberos, 1 super admin)
- 2 empleados
- 5 clientes
- 6 servicios
- 10 disponibilidades

**Credenciales de prueba:**
- Owner: owner@barbershop.com / password123
- Recepcionista: recepcion@barbershop.com / password123
- Barbero: carlos@barbershop.com / password123
- Super Admin: admin@barbershop.com / password123

## 📊 Modelos

### Núcleo Operativo
- **Negocio** – Tenant principal
- **Sucursal** – Ubicaciones del negocio
- **Rol** – Roles por negocio
- **Usuario** – Usuarios del sistema
- **Empleado** – Barberos/Estilistas
- **Disponibilidad** – Horarios de trabajo
- **Cliente** – Clientes del salón
- **Servicio** – Servicios ofrecidos
- **Cita** – Citas agendadas
- **Pago** – Pagos de citas
- **Propina** – Propinas (separadas)
- **Comisión** – Comisiones calculadas automáticamente

### Núcleo SaaS
- **Plan** – Planes de suscripción
- **Suscripción** – Suscripción del negocio
- **PagoSuscripción** – Pagos de suscripción

### Seguridad
- **ActivityLog** – Auditoría de todas las acciones

## 🔑 Relaciones Clave

```
Negocio (1) ──→ (N) Sucursal
Negocio (1) ──→ (N) Usuario
Negocio (1) ──→ (N) Cliente
Negocio (1) ──→ (N) Rol
Negocio (1) ──→ (1) Suscripción

Sucursal (1) ──→ (N) Empleado
Sucursal (1) ──→ (N) Servicio
Sucursal (1) ──→ (N) Cliente

Usuario (1) ──→ (0-1) Empleado
Empleado (1) ──→ (N) Disponibilidad

Cliente (1) ──→ (N) Cita
Empleado (1) ──→ (N) Cita
Servicio (1) ──→ (N) Cita

Cita (1) ──→ (1) Pago
Cita (1) ──→ (N) Propina
Cita (1) ──→ (N) Comisión

Plan (1) ──→ (N) Suscripción
Suscripción (1) ──→ (N) PagoSuscripción
```

## 🔒 Soft Delete

Todas las tablas principales tienen un campo `activo` (boolean) para soft delete.

```javascript
// Borrar lógico
await prisma.usuario.update({
  where: { id: usuarioId },
  data: { activo: false }
});

// Buscar solo activos
await prisma.usuario.findMany({
  where: { activo: true }
});
```

## 📝 Validaciones en BD

- **UUID** para todos los IDs
- **Foreign Keys** con integridad referencial
- **Unique Constraints** en campos clave (email, etc.)
- **Check Constraints** en estados y enumerables
- **Índices** estratégicos para performance

## 🛠️ Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear una nueva migración
npx prisma migrate dev --name mi_migracion

# Resetear BD (cuidado: borra todo)
npx prisma migrate reset

# Abrir Prisma Studio (UI para BD)
npx prisma studio

# Generar cliente
npx prisma generate

# Ver esquema en JSON
npx prisma format
```

## 📌 Notas Importantes

1. **Multi-tenant:** Siempre filtrar por `negocio_id`
2. **Soft delete:** Recordar filtrar por `activo = true` en consultas
3. **Timestamps:** Cada tabla tiene `created_at` y `updated_at`
4. **Activity logs:** Registrar cambios importantes
5. **Índices:** Revisar si es necesario agregar más según uso

## 🚨 Troubleshooting

### Error de conexión
```bash
# Verificar que PostgreSQL está corriendo
psql -U usuario -d barbershop_saas -c "SELECT 1"
```

### Migraciones fallidas
```bash
# Reset completo (solo desarrollo)
npm run prisma:migrate -- --force
```

### Generar cliente después de cambios
```bash
npm run prisma:generate
```

## 📚 Recursos

- [Documentación Prisma](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
