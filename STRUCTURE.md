# 🗂️ STRUCTURE - Estructura del Proyecto

Guía visual de la estructura organizada del proyecto.

## 📋 Árbol Completo

```
investment-tracker/
│
├── 📄 README.md                    # Guía principal del proyecto
├── 📄 package.json                 # Dependencias root
├── 📄 .gitignore                   # Git ignore
├── 📄 .env.example                 # Plantilla de variables
│
├── 📁 backend/                     # API REST (Node.js + Express)
│   ├── 📄 package.json
│   ├── 📄 .env                     # Variables de ambiente (gitignored)
│   ├── 📁 src/
│   │   ├── 📄 server.js            # Punto de entrada
│   │   ├── 📁 config/              # Configuración
│   │   │   └── 📄 database.js
│   │   ├── 📁 routes/              # Rutas API
│   │   │   ├── 📄 auth.routes.js
│   │   │   ├── 📄 investments.routes.js
│   │   │   ├── 📄 dashboard.routes.js
│   │   │   ├── 📄 analytics.routes.js
│   │   │   └── ...
│   │   ├── 📁 controllers/         # Lógica de negocio
│   │   │   ├── 📄 auth.controller.js
│   │   │   ├── 📄 investments.controller.js
│   │   │   ├── 📄 dashboard.complete.js
│   │   │   ├── 📄 analytics.controller.js
│   │   │   └── ...
│   │   ├── 📁 middleware/          # Middleware (auth, validación)
│   │   │   ├── 📄 auth.js
│   │   │   ├── 📄 validation.js
│   │   │   └── 📄 errorHandler.js
│   │   ├── 📁 models/              # Modelos de datos
│   │   ├── 📁 utils/               # Funciones auxiliares
│   │   ├── 📁 scripts/             # Scripts de utilidad
│   │   │   ├── 📄 run-migrations.js
│   │   │   └── 📄 initialize-database.js
│   │   └── 📁 migrations/          # Migraciones (no usadas aquí)
│   ├── 📁 database/
│   │   ├── 📁 migrations/          # Scripts SQL de migración
│   │   │   ├── 📄 001_create_financial_goals.sql
│   │   │   ├── 📄 002_add_risk_fields.sql
│   │   │   ├── 📄 003_add_multimoneda_support.sql
│   │   │   └── 📄 004_add_snapshots_and_exchange_rates.sql
│   │   └── 📁 seeds/               # Datos iniciales
│   │       └── 📄 exchange_rates_seed.sql
│   └── 📁 logs/                    # Logs del servidor
│
├── 📁 frontend/                    # React App (Vite)
│   ├── 📄 package.json
│   ├── 📄 index.html
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 eslint.config.js
│   ├── 📁 src/
│   │   ├── 📄 main.jsx              # Punto de entrada
│   │   ├── 📄 App.jsx               # Componente principal
│   │   ├── 📄 App.css
│   │   ├── 📄 index.css
│   │   ├── 📁 pages/                # Páginas (componentes principales)
│   │   │   ├── 📄 Dashboard.jsx
│   │   │   ├── 📄 Investments.jsx
│   │   │   ├── 📄 Analytics.jsx
│   │   │   ├── 📄 Goals.jsx
│   │   │   └── ...
│   │   ├── 📁 components/           # Componentes reutilizables
│   │   │   ├── 📄 Navbar.jsx
│   │   │   ├── 📄 Sidebar.jsx
│   │   │   ├── 📄 Card.jsx
│   │   │   ├── 📄 Chart.jsx
│   │   │   └── ...
│   │   ├── 📁 services/             # Servicios API
│   │   │   ├── 📄 api.js            # Cliente HTTP (Axios)
│   │   │   ├── 📄 investments.api.js
│   │   │   ├── 📄 dashboard.api.js
│   │   │   └── ...
│   │   ├── 📁 hooks/                # Custom React Hooks
│   │   ├── 📁 context/              # Context API
│   │   │   └── 📄 AuthContext.jsx
│   │   ├── 📁 utils/                # Funciones auxiliares
│   │   │   ├── 📄 formatters.js
│   │   │   ├── 📄 validators.js
│   │   │   └── ...
│   │   ├── 📁 config/               # Configuración
│   │   │   └── 📄 api.js
│   │   └── 📁 assets/               # Imágenes, iconos
│   └── 📁 public/                   # Archivos estáticos
│
├── 📁 database/                    # Documentación de BD (sin uso en prod)
│   ├── 📄 schema.sql
│   └── 📄 seeds.sql
│
├── 📁 docs/                        # 📚 Documentación
│   ├── 📄 README.md                # Índice de documentación
│   ├── 📁 setup/                   # Guías de instalación
│   │   ├── 📄 INSTALACION.md
│   │   └── ...
│   ├── 📁 api/                     # Documentación API
│   │   ├── 📄 ENDPOINTS.md         # Todos los endpoints
│   │   └── ...
│   ├── 📁 features/                # Características
│   │   ├── 📄 CARACTERISTICAS.md
│   │   └── ...
│   └── 📁 _archive_sesiones_anteriores/  # Histórico (no modificar)
│       └── (archivos antiguos)
│
└── 📁 node_modules/               # Dependencias (gitignored)
```

## 🎯 Qué Cambió

### ✅ Limpieza Realizada

**Eliminados:**
- 19 archivos de documentación temporal (ARREGLAR_*, CAMBIOS_*, etc.)
- 14 scripts de setup/validación (check-setup.*, first-time-setup.*, etc.)
- 6 scripts de prueba obsoletos (test_*.js)
- Documentación desorganizada en raíz

**Reorganizado:**
- docs/ con estructura clara: setup/, api/, features/
- Archive de sesiones anteriores en _archive_sesiones_anteriores/
- Documentación clara y accesible

### 📚 Documentación Nueva

- `docs/README.md` - Índice de documentación
- `docs/setup/INSTALACION.md` - Guía de instalación completa
- `docs/api/ENDPOINTS.md` - Documentación de todos los endpoints
- `docs/features/CARACTERISTICAS.md` - Descripción de características

### 📄 Archivos Actualizados

- `README.md` - Completamente reescrito, claro y útil
- `.env.example` - Plantilla de variables de ambiente

## 📊 Comparativa

### Antes (Desorganizado)
```
Raíz: 45+ archivos (muchos temporales)
docs/: Múltiples carpetas redundantes (archive/, development/, reference/, etc.)
Documentación: Confusa, diseminada, sin índice claro
```

### Después (Organizado)
```
Raíz: 7 archivos + 4 carpetas principales
docs/: 4 carpetas lógicas (setup/, api/, features/, _archive/)
Documentación: Clara, indexada, fácil de navegar
```

## 🚀 Próximos Pasos

1. **Iniciar**: Ver [README.md](../README.md)
2. **Instalar**: Seguir [docs/setup/INSTALACION.md](setup/INSTALACION.md)
3. **Aprender**: Leer [docs/features/CARACTERISTICAS.md](features/CARACTERISTICAS.md)
4. **Integrar**: Consultar [docs/api/ENDPOINTS.md](api/ENDPOINTS.md)

---

**Proyecto limpio y listo para producción ✨**
