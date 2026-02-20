// src/backend/scripts/seed.js

/**
 * SCRIPT DE SEED PARA DATOS DE PRUEBA
 * Genera:
 * - 1 negocio
 * - 2 sucursales
 * - 5 roles
 * - 1 usuario owner + 3 empleados
 * - 5 clientes
 * - 3 servicios
 * - Suscripción activa
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Iniciando seed de datos...\n');

    // ============================================
    // 1. CREAR NEGOCIO
    // ============================================
    console.log('📍 Creando negocio...');
    const negocio = await prisma.negocio.create({
      data: {
        id: uuidv4(),
        nombre: 'Barberría Premium',
        estado: 'activo',
      },
    });
    console.log(`✅ Negocio creado: ${negocio.nombre} (${negocio.id})\n`);

    // ============================================
    // 2. CREAR SUCURSALES
    // ============================================
    console.log('🏢 Creando sucursales...');
    const sucursal1 = await prisma.sucursal.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'Sucursal Centro',
        direccion: 'Calle Principal 123',
        telefono: '+1-555-0101',
        horario_apertura: '09:00:00',
        horario_cierre: '18:00:00',
        activa: true,
      },
    });

    const sucursal2 = await prisma.sucursal.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'Sucursal Norte',
        direccion: 'Avenida Norte 456',
        telefono: '+1-555-0102',
        horario_apertura: '10:00:00',
        horario_cierre: '19:00:00',
        activa: true,
      },
    });

    console.log(`✅ Sucursal 1: ${sucursal1.nombre}`);
    console.log(`✅ Sucursal 2: ${sucursal2.nombre}\n`);

    // ============================================
    // 3. CREAR ROLES
    // ============================================
    console.log('👤 Creando roles...');
    const rolOwner = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'owner',
        descripcion: 'Propietario del negocio',
        activo: true,
      },
    });

    const rolRecepcionista = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'recepcionista',
        descripcion: 'Personal de recepción',
        activo: true,
      },
    });

    const rolBarbero = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'barbero',
        descripcion: 'Barbero / Estilista',
        activo: true,
      },
    });

    const rolLimpieza = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        nombre: 'limpieza',
        descripcion: 'Personal de limpieza',
        activo: true,
      },
    });

    console.log(`✅ Roles creados: Owner, Recepcionista, Barbero, Limpieza\n`);

    // ============================================
    // 4. CREAR USUARIOS Y EMPLEADOS
    // ============================================
    console.log('👨‍💼 Creando usuarios...');

    // Usuario Owner
    const passwordHash = await bcrypt.hash('password123', 10);
    const usuarioOwner = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        sucursal_id: sucursal1.id,
        rol_id: rolOwner.id,
        nombre: 'Juan Pérez',
        email: 'owner@barbershop.com',
        password_hash: passwordHash,
        es_super_admin: false,
        activo: true,
      },
    });
    console.log(`✅ Owner: ${usuarioOwner.nombre} (${usuarioOwner.email})`);

    // Usuario Recepcionista
    const usuarioRecepcionista = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        sucursal_id: sucursal1.id,
        rol_id: rolRecepcionista.id,
        nombre: 'María García',
        email: 'recepcion@barbershop.com',
        password_hash: passwordHash,
        es_super_admin: false,
        activo: true,
      },
    });
    console.log(`✅ Recepcionista: ${usuarioRecepcionista.nombre}`);

    // Usuario Barbero 1
    const usuarioBarbero1 = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        sucursal_id: sucursal1.id,
        rol_id: rolBarbero.id,
        nombre: 'Carlos López',
        email: 'carlos@barbershop.com',
        password_hash: passwordHash,
        es_super_admin: false,
        activo: true,
      },
    });
    console.log(`✅ Barbero 1: ${usuarioBarbero1.nombre}`);

    // Usuario Barbero 2 (Sucursal 2)
    const usuarioBarbero2 = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        sucursal_id: sucursal2.id,
        rol_id: rolBarbero.id,
        nombre: 'David Rodríguez',
        email: 'david@barbershop.com',
        password_hash: passwordHash,
        es_super_admin: false,
        activo: true,
      },
    });
    console.log(`✅ Barbero 2: ${usuarioBarbero2.nombre}\n`);

    // ============================================
    // 5. CREAR EMPLEADOS
    // ============================================
    console.log('💼 Creando empleados...');

    const empleado1 = await prisma.empleado.create({
      data: {
        id: uuidv4(),
        usuario_id: usuarioBarbero1.id,
        sucursal_id: sucursal1.id,
        porcentaje_comision: 40.00,
        activo: true,
      },
    });
    console.log(`✅ Empleado 1: ${usuarioBarbero1.nombre} - 40% comisión`);

    const empleado2 = await prisma.empleado.create({
      data: {
        id: uuidv4(),
        usuario_id: usuarioBarbero2.id,
        sucursal_id: sucursal2.id,
        porcentaje_comision: 35.00,
        activo: true,
      },
    });
    console.log(`✅ Empleado 2: ${usuarioBarbero2.nombre} - 35% comisión\n`);

    // ============================================
    // 6. CREAR DISPONIBILIDADES
    // ============================================
    console.log('⏰ Creando disponibilidades...');

    // Lunes a viernes: 9 AM - 6 PM para empleado1
    for (let dia = 0; dia < 5; dia++) {
      await prisma.disponibilidad.create({
        data: {
          id: uuidv4(),
          empleado_id: empleado1.id,
          dia_semana: dia,
          hora_inicio: '09:00:00',
          hora_fin: '18:00:00',
          activa: true,
        },
      });
    }
    console.log(`✅ Disponibilidad creada para ${usuarioBarbero1.nombre} (Lunes-Viernes 9AM-6PM)`);

    // Lunes a viernes: 10 AM - 7 PM para empleado2
    for (let dia = 0; dia < 5; dia++) {
      await prisma.disponibilidad.create({
        data: {
          id: uuidv4(),
          empleado_id: empleado2.id,
          dia_semana: dia,
          hora_inicio: '10:00:00',
          hora_fin: '19:00:00',
          activa: true,
        },
      });
    }
    console.log(`✅ Disponibilidad creada para ${usuarioBarbero2.nombre} (Lunes-Viernes 10AM-7PM)\n`);

    // ============================================
    // 7. CREAR CLIENTES
    // ============================================
    console.log('👥 Creando clientes...');

    const clientes = [
      {
        nombre: 'Roberto Silva',
        telefono: '+1-555-1001',
        sucursal_id: sucursal1.id,
      },
      {
        nombre: 'Antonio Morales',
        telefono: '+1-555-1002',
        sucursal_id: sucursal1.id,
      },
      {
        nombre: 'Francisco Gutiérrez',
        telefono: '+1-555-1003',
        sucursal_id: sucursal1.id,
      },
      {
        nombre: 'Jorge Díaz',
        telefono: '+1-555-1004',
        sucursal_id: sucursal2.id,
      },
      {
        nombre: 'Miguel Ramírez',
        telefono: '+1-555-1005',
        sucursal_id: sucursal2.id,
      },
    ];

    const clientesCreados = [];
    for (const cliente of clientes) {
      const nuevoCliente = await prisma.cliente.create({
        data: {
          id: uuidv4(),
          negocio_id: negocio.id,
          sucursal_id: cliente.sucursal_id,
          nombre: cliente.nombre,
          telefono: cliente.telefono,
          activo: true,
        },
      });
      clientesCreados.push(nuevoCliente);
      console.log(`✅ Cliente: ${nuevoCliente.nombre}`);
    }
    console.log();

    // ============================================
    // 8. CREAR SERVICIOS
    // ============================================
    console.log('✂️  Creando servicios...');

    const servicios = [
      {
        nombre: 'Corte de Cabello',
        precio_base: 25.00,
        duracion_minutos: 30,
        sucursal_id: sucursal1.id,
      },
      {
        nombre: 'Afeitado',
        precio_base: 15.00,
        duracion_minutos: 20,
        sucursal_id: sucursal1.id,
      },
      {
        nombre: 'Corte + Afeitado',
        precio_base: 35.00,
        duracion_minutos: 50,
        sucursal_id: sucursal1.id,
      },
    ];

    // Agregar mismos servicios a sucursal 2
    servicios.push({
      nombre: 'Corte de Cabello',
      precio_base: 25.00,
      duracion_minutos: 30,
      sucursal_id: sucursal2.id,
    });
    servicios.push({
      nombre: 'Afeitado',
      precio_base: 15.00,
      duracion_minutos: 20,
      sucursal_id: sucursal2.id,
    });
    servicios.push({
      nombre: 'Corte + Afeitado',
      precio_base: 35.00,
      duracion_minutos: 50,
      sucursal_id: sucursal2.id,
    });

    const serviciosCreados = [];
    for (const servicio of servicios) {
      const nuevoServicio = await prisma.servicio.create({
        data: {
          id: uuidv4(),
          sucursal_id: servicio.sucursal_id,
          nombre: servicio.nombre,
          precio_base: servicio.precio_base,
          duracion_minutos: servicio.duracion_minutos,
          activo: true,
        },
      });
      serviciosCreados.push(nuevoServicio);
      console.log(`✅ Servicio: ${nuevoServicio.nombre} - $${nuevoServicio.precio_base}`);
    }
    console.log();

    // ============================================
    // 9. CREAR PLAN Y SUSCRIPCIÓN
    // ============================================
    console.log('📋 Creando plan y suscripción...');

    // Obtener plan básico
    const plan = await prisma.plan.findFirst({
      where: { nombre: 'Profesional' },
    });

    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes de prueba

    const suscripcion = await prisma.suscripcion.create({
      data: {
        id: uuidv4(),
        negocio_id: negocio.id,
        plan_id: plan.id,
        estado: 'activa',
        fecha_fin: fechaFin,
        auto_renovar: true,
      },
    });
    console.log(`✅ Suscripción activa: ${plan.nombre}\n`);

    // ============================================
    // 10. CREAR SUPER ADMIN (opcional)
    // ============================================
    console.log('🛡️  Creando Super Admin...');

    // Crear negocio fantasma para super admin
    const negocioAdmin = await prisma.negocio.create({
      data: {
        id: uuidv4(),
        nombre: 'Plataforma Admin',
        estado: 'activo',
      },
    });

    const rolAdmin = await prisma.rol.create({
      data: {
        id: uuidv4(),
        negocio_id: negocioAdmin.id,
        nombre: 'super_admin',
        descripcion: 'Administrador de plataforma',
        activo: true,
      },
    });

    const usuarioAdmin = await prisma.usuario.create({
      data: {
        id: uuidv4(),
        negocio_id: negocioAdmin.id,
        rol_id: rolAdmin.id,
        nombre: 'Administrador',
        email: 'admin@barbershop.com',
        password_hash: passwordHash,
        es_super_admin: true,
        activo: true,
      },
    });
    console.log(`✅ Super Admin: ${usuarioAdmin.nombre} (${usuarioAdmin.email})\n`);

    // ============================================
    // RESUMEN
    // ============================================
    console.log('═════════════════════════════════════════════');
    console.log('✅ SEED COMPLETADO EXITOSAMENTE');
    console.log('═════════════════════════════════════════════\n');
    console.log('📊 DATOS GENERADOS:');
    console.log(`   • Negocios: 2`);
    console.log(`   • Sucursales: 2`);
    console.log(`   • Roles: 5`);
    console.log(`   • Usuarios: 5 (1 owner, 1 recepcionista, 2 barberos, 1 super admin)`);
    console.log(`   • Empleados: 2`);
    console.log(`   • Clientes: 5`);
    console.log(`   • Servicios: 6`);
    console.log(`   • Disponibilidades: 10`);
    console.log(`   • Suscripción: 1 (activa)\n`);

    console.log('🔑 CREDENCIALES DE PRUEBA:');
    console.log('   Owner:');
    console.log('      Email: owner@barbershop.com');
    console.log('      Password: password123\n');
    console.log('   Recepcionista:');
    console.log('      Email: recepcion@barbershop.com');
    console.log('      Password: password123\n');
    console.log('   Barbero 1:');
    console.log('      Email: carlos@barbershop.com');
    console.log('      Password: password123\n');
    console.log('   Barbero 2:');
    console.log('      Email: david@barbershop.com');
    console.log('      Password: password123\n');
    console.log('   Super Admin:');
    console.log('      Email: admin@barbershop.com');
    console.log('      Password: password123\n');
  } catch (error) {
    console.error('❌ Error durante seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
