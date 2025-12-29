# ⚙️ Setup - Instalación y Configuración

## 🚀 Instalación Rápida

### 1. Requisitos Previos
- Node.js 18+ ([descargar](https://nodejs.org/))
- MySQL 8.0+ ([descargar](https://dev.mysql.com/downloads/mysql/))
- Git ([descargar](https://git-scm.com/))

### 2. Clonar y Preparar

```bash
# Clonar repositorio
git clone <repo> investment-tracker
cd investment-tracker

# Instalar dependencias backend
cd backend
npm install
cd ..

# Instalar dependencias frontend
cd frontend
npm install
cd ..
```

### 3. Configurar Base de Datos

#### Opción A: Crear BD manualmente
```bash
# Conectar a MySQL
mysql -u root -p

# En MySQL:
CREATE DATABASE investment_tracker;
USE investment_tracker;

# Ejecutar migraciones (ver backend/database/migrations/)
```

#### Opción B: Usar script de Node.js
```bash
cd backend
node src/scripts/run-migrations.js
```

### 4. Configurar Variables de Entorno

**Backend** (`backend/.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=investment_tracker
PORT=5000
NODE_ENV=development
```

**Frontend**: Usar config por defecto en `frontend/src/config/api.js`

### 5. Ejecutar Aplicación

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Debería mostrar: "✅ Servidor ejecutándose en http://localhost:5000"

# Terminal 2 - Frontend
cd frontend
npm run dev
# Debería mostrar: "VITE v... ready in ... ms"
```

Abre http://localhost:5173 en tu navegador.

## 🔧 Comandos Disponibles

### Backend
```bash
cd backend

npm run dev      # Ejecutar en desarrollo (con nodemon)
npm run build    # Compilar para producción
npm start        # Ejecutar producción
npm test         # Ejecutar tests
```

### Frontend
```bash
cd frontend

npm run dev      # Ejecutar en desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build
npm run lint     # Verificar eslint
```

## 📋 Verificar Instalación

```bash
# Verificar Node.js
node --version  # Debe ser v18+

# Verificar npm
npm --version

# Verificar MySQL
mysql --version

# Verificar que backend está corriendo
curl http://localhost:5000/health

# Verificar que frontend está disponible
curl http://localhost:5173
```

## 🆘 Problemas Comunes

### "Port 5000 already in use"
```bash
# Cambiar puerto en backend/.env
PORT=5001

# O matar proceso
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### "Cannot find module 'mysql2'"
```bash
cd backend
npm install mysql2
```

### "ECONNREFUSED" (No puede conectar a BD)
```bash
# Verificar que MySQL está corriendo
# Windows: Services → MySQL80
# Mac: brew services list
# Linux: sudo systemctl status mysql

# Verificar credenciales en backend/.env
```

### "Port 5173 already in use"
```bash
# Vite usa el siguiente puerto disponible automáticamente
# O cambiar en frontend/vite.config.js
```

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios del sistema
- `investments` - Inversiones registradas
- `investment_snapshots` - Histórico diario
- `exchange_rates` - Tasas de cambio
- `portfolio_daily_metrics` - Métricas diarias
- `financial_goals` - Metas financieras

### Ver esquema completo
```bash
cat database/schema.sql
```

## 📚 Siguientes Pasos

1. Ir a http://localhost:5173
2. Crear cuenta o iniciar sesión
3. Agregar tus primeras inversiones
4. Explorar el dashboard

## 🆘 Soporte

Si tienes problemas:
1. Revisar este documento nuevamente
2. Revisar la documentación en [docs/](../)
3. Crear un issue en GitHub

---

**Última actualización**: Diciembre 2025
