# 📁 Estructura del Proyecto - Investment Tracker

## Resumen Ejecutivo
Proyecto fullstack de seguimiento de inversiones con autenticación JWT, análisis financiero avanzado, soporte multimoneda (Fase 12) y simuladores.

---

## 🎯 Frontend (`/frontend`)

### `/src`
```
├── App.jsx                    # Routing principal con ProtectedRoute
├── main.jsx                   # Entry point de Vite
├── index.css                  # Estilos globales
│
├── /pages                     # Páginas principales (una por ruta)
│   ├── Dashboard.jsx         # 📊 KPIs, métricas, patrimonio
│   ├── Investments.jsx       # 💰 CRUD de inversiones
│   ├── Simulations.jsx       # 🎲 Calculadora y escenarios
│   ├── Goals.jsx             # 🎯 Metas financieras
│   ├── Currency.jsx          # 💱 Gestor multimoneda (Fase 12)
│   ├── AdvancedKPIs.jsx      # 📈 Análisis avanzado
│   ├── Analytics.jsx         # 📉 Estadísticas
│   ├── Login.jsx             # Autenticación
│   └── Registrer.jsx         # Registro
│
├── /components               # Componentes reutilizables
│   ├── /common              # Componentes genéricos
│   │   ├── StatCard.jsx     # Tarjeta de métrica
│   │   ├── PatrimonyChart.jsx # Gráfico de evolución
│   │   ├── RiskBadge.jsx    # Badge de riesgo
│   │   └── CurrencySelector.jsx # Selector multimoneda
│   │
│   ├── /layout              # Estructura de página
│   │   ├── Layout.jsx       # Wrapper con Navbar
│   │   └── Navbar.jsx       # Navegación principal
│   │
│   ├── /investments         # Componentes de inversiones
│   │   ├── UpdateValueModal.jsx
│   │   └── TransactionsModal.jsx
│   │
│   ├── /goals               # Componentes de metas
│   │   └── GoalCard.jsx
│   │
│   └── /risk                # Análisis de riesgo
│       └── RiskAnalysisCard.jsx
│
├── /services                # Servicios de API
│   └── api.js              # Cliente axios con endpoints
│
├── /context                 # Estado global
│   └── AuthContext.jsx     # Contexto de autenticación
│
├── /hooks                  # Hooks personalizados
│   └── useAuth.js         # Hook para autenticación
│
├── /utils                 # Utilidades
│   ├── format.js          # Formateo de valores
│   └── export.js          # Exportación a Excel
│
├── /config                # Configuración
│   └── backend.js         # URLs y config del backend
│
└── /assets               # Recursos estáticos
    └── ...
```

---

## 🔧 Backend (`/backend`)

### `/src`
```
├── server.js                # Punto de entrada Express
│
├── /config                  # Configuración
│   └── database.js         # Pool de conexión MySQL
│
├── /routes                 # Rutas API (REST endpoints)
│   ├── auth.routes.js      # POST /login, /register, /profile
│   ├── investments.routes.js # CRUD /investments
│   ├── transactions.routes.js # POST /transactions
│   ├── dashboard.routes.js # GET /stats, /evolution, /risk-analysis
│   ├── goals.routes.js     # CRUD /goals
│   ├── risk.routes.js      # GET /portfolio-analysis, /distribution
│   ├── simulations.routes.js # POST /calculate, /compare
│   ├── analytics.routes.js # GET /metrics, /trends
│   └── currency.routes.js  # POST /convert, GET /rates (Fase 12)
│
├── /controllers            # Lógica de negocio
│   ├── auth.controller.js  # login(), register(), getProfile()
│   ├── investments.controller.js # CRUD de inversiones
│   ├── dashboard.controller.js # Estadísticas y evolución
│   ├── goals.controller.js # Gestión de metas
│   ├── risk.controller.js  # Análisis de riesgo
│   ├── simulations.controller.js # Escenarios financieros
│   ├── transactions.controller.js # Transacciones
│   ├── analytics.controller.js # Métricas avanzadas
│   └── currency.controller.js # Conversión multimoneda (Fase 12)
│
├── /middleware            # Middlewares Express
│   ├── auth.js           # JWT verification
│   ├── validation.js     # Validación de datos
│   └── errorHandler.js   # Manejo global de errores
│
├── /utils                # Funciones auxiliares
│   ├── logger.js         # Sistema de logging
│   ├── calculations.js   # Cálculos financieros
│   ├── financialMetrics.js # Métricas (ROI, volatilidad)
│   ├── advancedMetrics.js # KPIs avanzados
│   ├── riskAnalysis.js   # Análisis de riesgo
│   ├── simulations.js    # Lógica de simuladores
│   ├── validator.js      # Validaciones reutilizables
│   ├── format.js         # Formateo de datos
│   ├── currency.js       # Conversiones básicas (COP/cents)
│   └── currencyConverter.js # Conversiones multimoneda (Fase 12)
│
└── /migrations           # Scripts de base de datos
    ├── 001_create_financial_goals.sql
    ├── 002_add_risk_fields.sql
    └── 003_add_multimoneda_support.sql
```

---

## 📊 Base de Datos

### Tablas principales
- `users` - Usuarios registrados
- `investments` - Inversiones del usuario
- `transactions` - Movimientos de dinero
- `financial_goals` - Metas financieras
- `exchange_rates` - Tasas de cambio (Fase 12)
- `currency_conversions` - Historial de conversiones (Fase 12)
- `user_currency_preferences` - Preferencias multimoneda (Fase 12)

---

## 🔄 Flujo de Datos

```
Usuario → Login → Token JWT
         ↓
    Dashboard (API /stats) ← Controllers ← DB
         ↓
    Crear Inversión → /investments POST → Validación → DB
         ↓
    Convertir Moneda → /currency/convert → currencyConverter → DB rates
```

---

## 📦 Dependencias Principales

### Frontend
- React 18 - UI Framework
- Vite - Build tool
- Tailwind CSS - Estilos
- Axios - HTTP client
- Lucide React - Iconos
- Recharts - Gráficos (opcional)

### Backend
- Node.js + Express - Framework
- MySQL2 - Driver de BD
- JWT - Autenticación
- Dotenv - Variables de entorno
- CORS - Control de acceso

---

## 🔒 Arquitectura de Autenticación

```
Login (credentials)
    ↓
auth.controller.js → Validar → Generar JWT
    ↓
localStorage.setItem('token')
    ↓
Cada request → Bearer token en header Authorization
    ↓
auth.middleware.js → Verificar JWT → Continuar o rechazar
```

---

## ✅ Checklist de Refactorización

- [x] Imports sin duplicación en controllers
- [x] Manejo de errores consistente
- [x] Logging centralizado
- [x] Estructura clara de carpetas
- [x] API service bien organizado
- [x] Componentes sin estado redundante
- [ ] Documentación de APIs en `/docs`
- [ ] Tests unitarios
- [ ] Tests de integración

---

## 🚀 Fase Actual

**Fase 12 - Multimoneda**: En progreso
- Backend completado (endpoints + BD)
- Frontend completo (Currency.jsx)
- Pendiente: Integración en Dashboard e Investments

---

## 📝 Notas Importantes

1. **JWT**: Almacenado en localStorage, valida en cada request
2. **Validación**: Tanto en frontend (UX) como backend (seguridad)
3. **Error Handling**: Middleware global + try-catch en controllers
4. **Logging**: Sistema centralizado con timestamps
5. **Multimoneda**: Datos almacenados en COP, conversión dinámica

