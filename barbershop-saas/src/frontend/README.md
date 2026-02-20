# 🎨 Frontend - Barbershop SaaS

## Descripción

Frontend React para el sistema de gestión de barberías Barbershop SaaS.

**Tecnologías:**
- React 18
- React Router v6
- Axios (HTTP client)
- CSS puro (sin dependencias)

## 📋 Estructura

```
src/
├── pages/              # Páginas principales
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── CitasPage.jsx
│   ├── ClientesPage.jsx
│   ├── ServiciosPage.jsx
│   └── ReportesPage.jsx
│
├── components/         # Componentes reutilizables
│   ├── Layout.jsx
│   └── ProtectedRoute.jsx
│
├── hooks/              # Custom hooks
│   ├── useAuth.js
│   ├── useFetch.js
│   └── useForm.js
│
├── services/           # Servicios HTTP
│   ├── apiClient.js
│   └── authService.js
│
├── styles/             # Estilos CSS
│   ├── globals.css
│   ├── auth.css
│   ├── layout.css
│   ├── list-page.css
│   └── reportes.css
│
└── App.jsx             # App principal
```

## 🚀 Instalación

### Requisitos
- Node.js >= 16
- npm o yarn

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
cp .env.example .env

# 3. Configurar API (en .env)
REACT_APP_API_URL=http://localhost:3001/api

# 4. Iniciar desarrollo
npm start
```

El frontend estará en: `http://localhost:3000`

## 📄 Páginas Implementadas

### 🔐 Autenticación
- **Login** (`/login`)
  - Email y contraseña
  - Validaciones básicas
  - Redirección a dashboard

- **Register** (`/register`)
  - Crear nuevo negocio
  - Nombre del propietario
  - Email y contraseña
  - Aceptar términos

### 📊 Dashboard
- **Dashboard** (`/dashboard`)
  - Estadísticas rápidas
  - Accesos rápidos a módulos
  - Actividad reciente

### 👥 Gestión
- **Clientes** (`/clientes`)
  - Crear cliente (nombre, teléfono)
  - Listar clientes activos
  - Editar y eliminar

- **Servicios** (`/servicios`)
  - Crear servicio (nombre, precio, duración)
  - Listar servicios
  - Editar y eliminar

- **Citas** (`/agenda`)
  - Agendar cita
  - Validaciones: no pasado, disponibilidad
  - Cambiar estado (confirmada → finalizada)
  - Cancelar cita

### 📊 Reportes
- **Reportes** (`/reportes`)
  - Ventas totales
  - Comisiones pagadas
  - Últimos pagos
  - Comisiones por empleado

## 🎣 Hooks Personalizados

### useAuth()
Maneja autenticación del usuario.

```javascript
const { usuario, login, logout, register, loading, error } = useAuth();
```

### useFetch(url, options)
Fetch genérico para peticiones HTTP.

```javascript
const { data, loading, error, refetch } = useFetch('/clientes');
```

### useForm(initialValues, onSubmit, validate)
Gestiona formularios con validaciones.

```javascript
const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm(
  { email: '', password: '' },
  async (values) => { /* submit */ },
  (values) => { /* validate */ }
);
```

## 🔒 Autenticación

### Tokens
- **Access Token**: 24 horas (en localStorage)
- **Refresh Token**: 7 días (en localStorage)

### Interceptor
Los tokens se envían automáticamente en cada request mediante `Authorization: Bearer <token>`.

Si el token expira, intenta renovarse automáticamente con el refresh token.

## 📝 Validaciones

### Formularios
- Email válido (formato)
- Contraseña mínimo 8 caracteres
- Campos obligatorios
- Confirmación de contraseña
- Teléfono válido
- Fechas no en el pasado

### Citas
- Cliente existe
- Empleado disponible
- No hay solapamiento
- Hora válida

## 🎨 Diseño

**Paleta de colores:**
- Primario: `#2563eb` (Azul)
- Éxito: `#10b981` (Verde)
- Peligro: `#ef4444` (Rojo)
- Advertencia: `#f59e0b` (Amarillo)

**Responsive:**
- Desktop: Sidebar fijo
- Tablet/Móvil: Menú colapsable (próximo)

## 🧪 Pruebas

### Credenciales de demo
```
Email: owner@barbershop.com
Contraseña: password123
```

### En desarrollo
```bash
npm start
```

### Build para producción
```bash
npm run build
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel
```

### Netlify

```bash
# 1. Build
npm run build

# 2. Deploy folder: build/
```

## 📦 Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.2.0 | Framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.20.0 | Routing |
| axios | ^1.6.2 | HTTP client |
| react-scripts | 5.0.1 | Build tools |

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Cambiar puerto
PORT=3001 npm start
```

### "Cannot GET /api/..."
Asegúrate que:
1. Backend está corriendo en `http://localhost:3001`
2. `.env` tiene `REACT_APP_API_URL` correcto
3. Reinicia servidor `npm start`

### CORS errors
Backend debe tener CORS habilitado (ya está configurado).

## 📚 Recursos

- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

## 📞 Soporte

Ver documentación backend en: `/barbershop-saas/API_ENDPOINTS.md`
