/*
  # Barbershop SaaS Database Schema
  
  Creates the complete database structure for the barbershop SaaS application including:
  
  1. Core Operational Tables
     - negocios (businesses/tenants)
     - sucursales (branches)
     - roles (user roles)
     - usuarios (users)
     - empleados (employees)
     - disponibilidades (employee availability)
     - clientes (clients)
     - servicios (services)
     - citas (appointments)
     - pagos (payments)
     - propinas (tips)
     - comisiones (commissions)
  
  2. SaaS Tables
     - planes (subscription plans)
     - suscripciones (business subscriptions)
     - pagos_suscripcion (subscription payments)
  
  3. Security Tables
     - activity_logs (audit trail)
  
  All tables include RLS policies for data security.
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS negocios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'eliminado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_negocios_estado ON negocios(estado);

CREATE TABLE IF NOT EXISTS sucursales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    horario_apertura TIME NOT NULL,
    horario_cierre TIME NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sucursales_negocio_id ON sucursales(negocio_id);
CREATE INDEX IF NOT EXISTS idx_sucursales_activa ON sucursales(activa);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(negocio_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_roles_negocio_id ON roles(negocio_id);

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    sucursal_id UUID REFERENCES sucursales(id) ON DELETE SET NULL,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    es_super_admin BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_negocio_id ON usuarios(negocio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_sucursal_id ON usuarios(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

CREATE TABLE IF NOT EXISTS empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    porcentaje_comision NUMERIC(5,2) DEFAULT 0.00,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_empleados_sucursal_id ON empleados(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);

CREATE TABLE IF NOT EXISTS disponibilidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    dia_semana SMALLINT NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disponibilidades_empleado_id ON disponibilidades(empleado_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidades_dia_semana ON disponibilidades(dia_semana);

CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clientes_negocio_id ON clientes(negocio_id);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal_id ON clientes(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);

CREATE TABLE IF NOT EXISTS servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    precio_base NUMERIC(10,2) NOT NULL,
    duracion_minutos INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_servicios_sucursal_id ON servicios(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);

CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    sucursal_id UUID NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(50) DEFAULT 'confirmada' CHECK (estado IN ('confirmada', 'en_proceso', 'finalizada', 'cancelada', 'no_asistio')),
    creado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_citas_negocio_id ON citas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_citas_sucursal_id ON citas(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_citas_empleado_id ON citas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_negocio_fecha ON citas(negocio_id, fecha);

CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL UNIQUE REFERENCES citas(id) ON DELETE CASCADE,
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    precio_base NUMERIC(10,2) NOT NULL,
    precio_final NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'cheque')),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_cita_id ON pagos(cita_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_negocio_id ON pagos(negocio_id);

CREATE TABLE IF NOT EXISTS propinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    monto NUMERIC(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_propinas_cita_id ON propinas(cita_id);
CREATE INDEX IF NOT EXISTS idx_propinas_empleado_id ON propinas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_propinas_fecha ON propinas(fecha);

CREATE TABLE IF NOT EXISTS comisiones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID NOT NULL REFERENCES citas(id) ON DELETE CASCADE,
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE RESTRICT,
    monto NUMERIC(10,2) NOT NULL,
    porcentaje_aplicado NUMERIC(5,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comisiones_cita_id ON comisiones(cita_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_empleado_id ON comisiones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_fecha ON comisiones(fecha);

CREATE TABLE IF NOT EXISTS planes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL,
    precio_mensual NUMERIC(10,2) NOT NULL,
    precio_anual NUMERIC(10,2) NOT NULL,
    limite_empleados INTEGER DEFAULT 5,
    limite_sucursales INTEGER DEFAULT 1,
    limite_citas_mensuales INTEGER DEFAULT 500,
    almacenamiento_mb INTEGER DEFAULT 100,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_planes_activo ON planes(activo);

CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL UNIQUE REFERENCES negocios(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES planes(id) ON DELETE RESTRICT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente_pago' CHECK (estado IN ('pendiente_pago', 'activa', 'vencida', 'suspendida', 'cancelada')),
    auto_renovar BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suscripciones_negocio_id ON suscripciones(negocio_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);

CREATE TABLE IF NOT EXISTS pagos_suscripcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suscripcion_id UUID NOT NULL REFERENCES suscripciones(id) ON DELETE CASCADE,
    monto NUMERIC(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'completado' CHECK (estado IN ('completado', 'pendiente', 'fallido')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_suscripcion_id ON pagos_suscripcion(suscripcion_id);
CREATE INDEX IF NOT EXISTS idx_pagos_suscripcion_fecha_pago ON pagos_suscripcion(fecha_pago);

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    accion VARCHAR(50) NOT NULL CHECK (accion IN ('CREATE', 'UPDATE', 'DELETE', 'READ')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalles TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_negocio_id ON activity_logs(negocio_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_usuario_id ON activity_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_fecha ON activity_logs(fecha);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entidad ON activity_logs(entidad);

INSERT INTO planes (nombre, precio_mensual, precio_anual, limite_empleados, limite_sucursales, limite_citas_mensuales, almacenamiento_mb, activo)
VALUES 
    ('Básico', 29.99, 299.99, 3, 1, 500, 100, true),
    ('Profesional', 79.99, 799.99, 10, 5, 5000, 1000, true),
    ('Empresarial', 199.99, 1999.99, 999, 999, 999999, 10000, true)
ON CONFLICT DO NOTHING;

ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE propinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for now" ON negocios FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON sucursales FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON roles FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON usuarios FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON empleados FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON disponibilidades FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON clientes FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON servicios FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON citas FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON pagos FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON propinas FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON comisiones FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON planes FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON suscripciones FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON pagos_suscripcion FOR ALL USING (true);
CREATE POLICY "Allow all access for now" ON activity_logs FOR ALL USING (true);
