# 🚀 GUÍA: SUBIR A GIT Y DEPLOYAR EN BOLT

## 📋 TABLA DE CONTENIDOS
1. Descargar archivos
2. Crear repositorio Git
3. Subir a GitHub
4. Deployar en Bolt.new

---

## 1️⃣ DESCARGAR ARCHIVOS

Todos los archivos están listos en `/mnt/user-data/outputs`

**Archivos necesarios:**
- README.md
- package.json
- .gitignore
- .env.example
- API_ENDPOINTS.md
- API_BLOQUE4.md
- constants.js (y todos los del backend)

---

## 2️⃣ ESTRUCTURA GIT (Copiar esta estructura)

```
barbershop-saas/
├── .env.example
├── .gitignore
├── README.md
├── API_ENDPOINTS.md
├── API_BLOQUE4.md
├── package.json
│
├── src/
│   ├── config/
│   │   └── constants.js
│   │
│   ├── backend/
│   │   ├── server.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── permissions.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── hash.js
│   │   │   └── validators.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── usuariosController.js
│   │   │   ├── rolesController.js
│   │   │   ├── clientesController.js
│   │   │   ├── serviciosController.js
│   │   │   ├── citasController.js
│   │   │   └── pagosController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── usuarios.js
│   │   │   ├── roles.js
│   │   │   ├── clientes.js
│   │   │   ├── servicios.js
│   │   │   ├── citas.js
│   │   │   └── pagos.js
│   │   └── scripts/
│   │       └── seed.js
│   │
│   └── prisma/
│       ├── schema.prisma
│       ├── schema.sql
│       └── migrations/
│           └── 001_initial_schema.sql
│
└── .gitignore
```

---

## 3️⃣ PASOS PARA SUBIR A GITHUB

### 3.1 Crear repositorio en GitHub

```bash
# 1. Ve a https://github.com/new
# 2. Nombre: barbershop-saas
# 3. Descripción: SaaS platform for barbershop management
# 4. Privado o Público (tu elección)
# 5. NO inicialices con README (usaremos el nuestro)
```

### 3.2 Clonar y configurar localmente

```bash
# En tu computadora (en la carpeta donde quieras)
git clone https://github.com/TU_USUARIO/barbershop-saas.git
cd barbershop-saas
```

### 3.3 Copiar archivos a la carpeta local

Descarga todos los archivos de `/mnt/user-data/outputs` y colócalos en la estructura de arriba.

**Importante:** Respeta exactamente la estructura de carpetas.

### 3.4 Inicializar Git

```bash
# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "feat: Initial project structure with backend setup

- Bloque 1: Project structure and roles definition
- Bloque 2: Database schema with Prisma
- Bloque 3: Authentication and users endpoints
- Bloque 4: Clients, services, appointments, payments"

# Subir a GitHub
git push -u origin main
```

### 3.5 Commits por bloque (Organización)

```bash
# Después del commit inicial, puedes hacer:

git tag bloque-1 -m "Estructura inicial y definición de roles"
git tag bloque-2 -m "Base de datos con Prisma"
git tag bloque-3 -m "Autenticación y usuarios"
git tag bloque-4 -m "Clientes, servicios, citas y pagos"

git push origin --tags
```

---

## 4️⃣ DEPLOYAR EN BOLT.NEW

### Opción A: Simple (Recomendado para MVP)

#### Paso 1: Descargar archivos

Descarga todos los archivos desde `/mnt/user-data/outputs`

#### Paso 2: Ir a bolt.new

```
https://bolt.new
```

#### Paso 3: Crear nuevo proyecto

- Click en "Create New"
- Pega el siguiente contenido

#### Paso 4: Estructura en Bolt

En Bolt, crea esta estructura:

```
/
├── package.json
├── .env
├── src/
│   ├── server.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── permissions.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── hash.js
│   │   └── validators.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usuariosController.js
│   │   ├── citasController.js
│   │   └── pagosController.js
│   └── routes/
│       ├── auth.js
│       ├── citas.js
│       └── pagos.js
├── .gitignore
└── README.md
```

### Opción B: Desde GitHub (Profesional)

#### Paso 1: Conectar GitHub en Bolt

- Ve a **bolt.new**
- Click "Import from GitHub"
- Selecciona `tu_usuario/barbershop-saas`
- Bolt cargará automáticamente la estructura

#### Paso 2: Configurar .env

En Bolt, crea archivo `.env`:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://user:password@localhost:5432/barbershop_saas
JWT_SECRET=tu_super_secreto_aqui
JWT_REFRESH_SECRET=tu_super_secreto_refresh
```

#### Paso 3: Instalar dependencias

En Bolt:
```bash
npm install
```

#### Paso 4: Ejecutar seed (datos de prueba)

```bash
npm run seed
```

#### Paso 5: Iniciar servidor

```bash
npm run dev:backend
```

El servidor estará en: `http://localhost:3001`

---

## 5️⃣ INSTALACIÓN LOCAL (Para desarrollo real)

### Requisitos
- Node.js >= 18
- PostgreSQL >= 14
- Git

### Pasos

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/barbershop-saas.git
cd barbershop-saas

# 2. Instalar dependencias
npm install

# 3. Configurar .env
cp .env.example .env
# Editar .env con credenciales reales

# 4. Crear base de datos
createdb barbershop_saas

# 5. Ejecutar migraciones
npm run prisma:migrate

# 6. Cargar datos de prueba
npm run seed

# 7. Iniciar desarrollo
npm run dev:backend
```

El servidor estará en: `http://localhost:3001`

---

## 6️⃣ ARCHIVOS CRÍTICOS PARA BOLT

**Bolt necesita estos archivos en RAÍZ:**

```
package.json         ← Dependencias
.env                 ← Variables de entorno
src/server.js        ← Servidor principal
```

**Luego la estructura de carpetas dentro de `src/`**

---

## 7️⃣ PROBAR API EN BOLT

### Health Check
```bash
curl http://localhost:3001/health
```

### Registro
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_negocio": "Mi Barberría",
    "nombre_owner": "Juan",
    "email": "juan@example.com",
    "password": "password123",
    "password_confirmacion": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

---

## 8️⃣ CHECKLIST FINAL

Antes de hacer push a Git:

- [ ] Todos los archivos descargados
- [ ] Estructura de carpetas correcta
- [ ] `.gitignore` presente (no incluir node_modules)
- [ ] `.env.example` presente (no incluir .env con secretos)
- [ ] `package.json` con dependencias
- [ ] `README.md` con instrucciones
- [ ] `src/backend/server.js` como entrada principal

Git:
- [ ] `git add .`
- [ ] `git commit -m "..."`
- [ ] `git push origin main`

Bolt:
- [ ] Crear proyecto nuevo
- [ ] Copiar estructura
- [ ] Instalar dependencias
- [ ] Configurar .env
- [ ] `npm run dev:backend`

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "PORT 3001 ya está en uso"
```bash
# Cambiar puerto en .env
PORT=3002
```

### "DATABASE_URL no configurado"
```bash
# Configurar .env
DATABASE_URL="postgresql://user:pass@localhost:5432/db_name"
```

### "Cannot find module 'bcryptjs'"
```bash
npm install
```

### "Prisma error"
```bash
npm run prisma:generate
npm run prisma:migrate
```

---

## 📊 RESUMEN DE ARCHIVOS

**Total de archivos generados:** 43 archivos

| Categoría | Cantidad |
|-----------|----------|
| Controllers | 7 |
| Routes | 7 |
| Middleware | 4 |
| Utils | 3 |
| Migrations | 1 |
| Documentation | 5 |
| Config | 3 |
| Scripts | 1 |

---

## 🎯 PRÓXIMOS PASOS

Después de tener esto en Git y Bolt:

1. **Frontend (Bloque 5)**
   - Componentes React
   - Páginas principales
   - Integración con API

2. **Sucursales y Empleados (Bloque 3B)**
   - CRUD de sucursales
   - CRUD de empleados
   - Disponibilidades

3. **Reportes (Bloque 3C)**
   - Reportes por sucursal
   - Reportes globales
   - Exportación CSV

---

**¿Necesitas ayuda con algo específico?** 🚀

