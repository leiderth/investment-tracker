# 🚀 GUÍA COMPLETA DE INSTALACIÓN - InvestTracker v2.0

## 📋 Requisitos Previos

- **Node.js** v18+ (https://nodejs.org/)
- **MySQL** 8.0+ (vía XAMPP/phpMyAdmin o instalación local)
- **Git** (opcional pero recomendado)

---

## 🔧 SETUP INICIAL

### 1. Clonar/Descargar el Proyecto
```bash
cd c:\xampp\htdocs
# O navegar a la carpeta del proyecto
cd investment-tracker
```

### 2. Instalar Dependencias Backend
```bash
cd backend
npm install
# Esperar a que se complete la instalación
```

### 3. Instalar Dependencias Frontend
```bash
cd ../frontend
npm install
# Esperar a que se complete la instalación
```

### 4. Configurar Base de Datos

#### Opción A: Con XAMPP (Recomendado)
```bash
1. Abrir XAMPP Control Panel
2. Iniciar MySQL
3. Acceder a http://localhost/phpmyadmin
4. Crear nueva base de datos: "invest_tracker"
5. Ejecutar script de migración
```

#### Opción B: Desde Terminal
```bash
# Conectarse a MySQL
mysql -u root

# Crear base de datos
CREATE DATABASE invest_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Seleccionar base de datos
USE invest_tracker;

# Ejecutar migraciones
SOURCE C:\xampp\htdocs\investment-tracker\backend\database\migrations\002_add_risk_fields.sql;
```

### 5. Configurar Variables de Entorno

#### Backend
```bash
# Copiar archivo de ejemplo
copy backend\.env.example backend\.env

# Editar backend\.env con tus valores:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=invest_tracker
JWT_SECRET=tu_secret_muy_seguro_aqui
```

---

## 🎯 INICIAR LA APLICACIÓN

### Terminal 1: Backend (Puerto 5000)
```bash
cd backend
npm run dev
# Output esperado:
# 🚀 Servidor corriendo en http://localhost:5000
```

### Terminal 2: Frontend (Puerto 5173)
```bash
cd frontend
npm run dev
# Output esperado:
# Local: http://localhost:5173
```

### Acceder a la Aplicación
- **URL:** http://localhost:5173
- **Usuario de prueba:**
  - Email: test@example.com
  - Password: Test@123

---

## 🧪 VERIFICAR QUE TODO FUNCIONA

### 1. Health Check Backend
```bash
curl http://localhost:5000/api/health
# Respuesta esperada: { "status": "OK", "message": "InvestTracker API funcionando" }
```

### 2. Crear Nuevo Usuario
```
1. Ir a http://localhost:5173
2. Hacer clic en "Crear cuenta"
3. Llenar formulario y registrarse
4. Automáticamente redirige a Dashboard
```

### 3. Crear Primera Inversión
```
1. Ir a tab "Inversiones"
2. Clic en "Nueva Inversión"
3. Llenar datos:
   - Tipo: CDT
   - Plataforma: Mi Banco
   - Monto Inicial: 1,000,000 COP
   - Rendimiento Esperado: 5%
   - Fecha: Hoy
4. Guardar
```

### 4. Verificar Dashboard
```
1. Ir a "Dashboard"
2. Debería mostrar:
   - Patrimonio Total: 1,000,000 COP
   - Capital Invertido: 1,000,000 COP
   - Ganancia/Pérdida: 0 COP (sin transacciones)
   - Gráfico de evolución
```

### 5. Probar Transacciones
```
1. En tab Inversiones, clic en "Transacciones"
2. Agregar:
   - Tipo: Dividendo
   - Monto: 50,000 COP
   - Fecha: Hoy
3. Guardar
4. Dashboard debe actualizar automáticamente
```

### 6. Ver Analytics
```
1. Clic en "Analytics" en navbar
2. Ver resumen de KPIs
3. Navegar por tabs: ROI, Diversificación, Desempeño
```

---

## 📊 ESTRUCTURA DE CARPETAS

```
investment-tracker/
│
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, etc)
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Funciones auxiliares
│   │   └── server.js        # Entry point
│   ├── database/
│   │   └── migrations/      # Scripts SQL
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # API calls
│   │   ├── utils/           # Utilidades
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Context API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── database/
    └── schema.sql           # Schema completo
```

---

## 🔑 ENDPOINTS PRINCIPALES

### Autenticación
- `POST /api/auth/register` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Perfil actual

### Inversiones
- `GET /api/investments` - Listar todas
- `POST /api/investments` - Crear
- `PUT /api/investments/:id` - Actualizar
- `DELETE /api/investments/:id` - Cerrar

### Transacciones
- `GET /api/investments/:id/transactions` - Listar
- `POST /api/investments/:id/transactions` - Crear
- `DELETE /api/transactions/:id` - Eliminar

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas
- `GET /api/dashboard/evolution` - Evolución histórica

### Analytics (NUEVO)
- `GET /api/analytics/metrics` - KPIs avanzados

### Riesgo
- `GET /api/risk/portfolio-analysis` - Análisis portafolio
- `GET /api/risk/distribution` - Distribución de riesgo

---

## 🐛 TROUBLESHOOTING

### Error: "Cannot find module 'mysql2'"
```bash
cd backend && npm install mysql2
```

### Error: "ECONNREFUSED" (BD no conecta)
```bash
1. Verificar que MySQL está corriendo
2. Verificar credenciales en .env
3. Verificar que la base de datos existe
```

### Error: "Duplicated export 'dashboardAPI'"
```bash
✅ SOLUCIONADO en v2.0
- Actualizar a última versión
- Limpiar node_modules y reinstalar
```

### Frontend no abre en http://localhost:5173
```bash
1. Verificar que npm run dev está ejecutando
2. Revisar terminal de errores
3. Intentar acceder directamente a http://localhost:5173
4. Limpiar caché del navegador
```

### Base de datos llena/errores
```bash
# Hacer backup y limpiar
mysqldump -u root invest_tracker > backup.sql

# Eliminar y recrear
mysql -u root
DROP DATABASE invest_tracker;
CREATE DATABASE invest_tracker CHARACTER SET utf8mb4;
USE invest_tracker;
SOURCE backend/database/migrations/002_add_risk_fields.sql;
```

---

## 📚 DOCUMENTACIÓN

- [CHANGELOG v2.0](./CHANGELOG_v2.0.md) - Cambios implementados
- [GUÍA_RAPIDA.md](./GUIA_RAPIDA.md) - Uso rápido
- [README.md](./README.md) - Información general

---

## 💡 TIPS PARA DESARROLLO

### VS Code Extensions Recomendadas
- **ES7+ React/Redux/React-Native snippets** - dsznajder.es7-react-js-snippets
- **Tailwind CSS IntelliSense** - bradlc.vscode-tailwindcss
- **MySQL** - cweijan.vscode-mysql-client2

### Atajos Útiles
```bash
# Frontend - Hot reload automático
npm run dev

# Backend - Reinicia con cambios
npm run dev (usando nodemon)

# Build para producción
npm run build
```

### Tips de Base de Datos
```sql
-- Ver estructura de tabla
DESCRIBE investments;

-- Ver primeros registros
SELECT * FROM investments LIMIT 10;

-- Contar registros
SELECT COUNT(*) FROM investments;

-- Backup rápido
mysqldump -u root invest_tracker > backup.sql
```

---

## 🚀 DEPLOYMENT (Futuro)

Para producción, considerar:
1. **Backend:** Heroku, Railway, DigitalOcean
2. **Frontend:** Vercel, Netlify, GitHub Pages
3. **BD:** AWS RDS, Heroku PostgreSQL

---

## 📞 SOPORTE

Para reportar bugs o sugerencias:
1. Revisar CHANGELOG
2. Verificar que esté en última versión
3. Limpiar node_modules y reinstalar
4. Verificar logs de error en console

---

**Última actualización:** 28 de Diciembre, 2025
**Versión:** 2.0
**Estado:** ✅ READY FOR PRODUCTION
