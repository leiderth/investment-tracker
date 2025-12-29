# Investment Tracker

Sistema completo de gestión de inversiones con análisis en tiempo real, múltiples monedas y métricas avanzadas.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone <repo>
cd investment-tracker

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
cd ..
```

### Configuración

1. **Backend**: Crear `.env` en `backend/`
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=investment_tracker
PORT=5000
NODE_ENV=development
```

2. **Frontend**: Ya está configurado en `frontend/src/config/api.js`

### Ejecutar

```bash
# Terminal 1 - Backend (puerto 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd frontend
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## 📁 Estructura del Proyecto

```
investment-tracker/
├── backend/                 # API REST (Node.js + Express)
│   ├── src/
│   │   ├── server.js       # Punto de entrada
│   │   ├── config/         # Configuración (BD, env)
│   │   ├── routes/         # Rutas API
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos de BD
│   │   ├── middleware/     # Middleware
│   │   ├── utils/          # Utilidades
│   │   └── scripts/        # Scripts auxiliares
│   ├── database/
│   │   ├── migrations/     # Migraciones SQL
│   │   └── seeds/          # Datos iniciales
│   └── package.json
│
├── frontend/                # React App (Vite)
│   ├── src/
│   │   ├── main.jsx        # Punto de entrada
│   │   ├── App.jsx         # App principal
│   │   ├── pages/          # Páginas (Dashboard, etc)
│   │   ├── components/     # Componentes reutilizables
│   │   ├── services/       # Servicios API
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # Context API
│   │   ├── utils/          # Utilidades
│   │   ├── config/         # Configuración
│   │   └── assets/         # Imágenes, iconos
│   ├── public/             # Archivos estáticos
│   └── package.json
│
├── database/               # Documentación de BD
│   ├── schema.sql          # Esquema base
│   └── seeds.sql           # Seeds iniciales
│
├── docs/                   # Documentación
│   ├── setup/              # Guías de instalación
│   ├── api/                # Documentación API
│   ├── features/           # Documentación de features
│   └── README.md           # Índice de docs
│
├── .env.example            # Variables de ambiente ejemplo
├── .gitignore              # Git ignore
└── README.md               # Este archivo
```

## 🔧 Características Principales

- **Dashboard Completo**: Vista general del portafolio
- **Gestión de Inversiones**: CRUD completo
- **Análisis Avanzado**: Volatilidad, Sharpe, Max Drawdown
- **Multi-moneda**: Conversiones en tiempo real
- **Histórico**: Seguimiento diario del patrimonio
- **Metas Financieras**: Planificación de objetivos
- **Autenticación**: Sistema de usuarios seguro

## 📊 Stack Tecnológico

**Backend:**
- Node.js + Express
- MySQL 8
- JWT (autenticación)
- Validación con Joi

**Frontend:**
- React 19 + Vite
- TailwindCSS (estilos)
- Recharts (gráficos)
- Axios (HTTP client)

## 📝 API Endpoints Principales

### Dashboard
- `GET /api/dashboard/complete` - Datos completos del dashboard

### Inversiones
- `GET /api/investments` - Listar inversiones
- `POST /api/investments` - Crear inversión
- `PUT /api/investments/:id` - Actualizar inversión
- `DELETE /api/investments/:id` - Eliminar inversión

### Análisis
- `GET /api/analytics/risk` - Análisis de riesgo
- `GET /api/analytics/performance` - Rendimiento
- `GET /api/analytics/currencies` - Análisis multi-moneda

Para documentación completa, ver [docs/api/](docs/api/)

## 🗄️ Base de Datos

Tablas principales:
- `users` - Usuarios del sistema
- `investments` - Inversiones registradas
- `investment_snapshots` - Histórico diario
- `exchange_rates` - Tasas de cambio
- `portfolio_daily_metrics` - Métricas diarias
- `financial_goals` - Metas financieras

Para esquema completo, ver [database/schema.sql](database/schema.sql)

## 🔐 Autenticación

El sistema usa JWT. Los tokens se incluyen en el header:
```
Authorization: Bearer <token>
```

## 📚 Documentación

- [Setup Completo](docs/setup/) - Instalación detallada
- [Documentación API](docs/api/) - Endpoints y ejemplos
- [Features](docs/features/) - Características del sistema

## 🐛 Troubleshooting

**Error: "Cannot find module"**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Error: "Connection refused" (BD)**
- Verificar que MySQL está ejecutándose
- Verificar credenciales en .env

**Error: "Port already in use"**
- Backend usa puerto 5000
- Frontend usa puerto 5173
- Cambiar en `.env` o `vite.config.js` si es necesario

## 📞 Soporte

Para reportar bugs o sugerencias, crear un issue en GitHub.

---

**Estado**: Production Ready ✅
**Última actualización**: Diciembre 2025
