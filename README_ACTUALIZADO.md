# InvestTracker 📊 - Versión Profesional

Una aplicación web **completa y profesional** para gestionar y monitorear tu portafolio de inversiones con análisis avanzados, metas financieras y simuladores inteligentes.

**Estado**: ✅ **PHASE 1 + PHASE 2 COMPLETADAS Y TESTEADAS**

## 🎯 Características Principales

### Core
- ✅ Autenticación con JWT
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de inversiones (CRUD completo)
- ✅ Evolución patrimonial con gráficos
- ✅ Distribución por tipo de inversión
- ✅ Cálculo automático de rendimientos

### Análisis Financiero Avanzado (NUEVO - PHASE 2)
- ✅ **Metas Financieras**: Crear y rastrear objetivos de ahorro
- ✅ **Análisis de Viabilidad**: ¿Es alcanzable tu meta? 
- ✅ **Simuladores**: Proyecta el crecimiento de tus inversiones
- ✅ **Análisis de Sensibilidad**: ¿Qué pasa si varía la tasa?
- ✅ **Comparación de Escenarios**: Conservador vs Moderado vs Agresivo
- ✅ **Métricas Financieras**: CAGR, ROI, Sharpe Ratio, VaR

### Infraestructura Profesional (PHASE 1)
- ✅ Sistema centralizado de validación
- ✅ Manejo global de errores con clases personalizadas
- ✅ Logging estructurado con 5 niveles (ERROR, WARN, INFO, DEBUG, TRACE)
- ✅ Fórmulas financieras precisas
- ✅ Manejo de transacciones en BD

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.21
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT + bcryptjs
- **Validación**: Sistema centralizado
- **Logging**: Logger personalizado
- **Error Handling**: Middleware global

### Frontend
- **Framework**: React 19.2 + Vite 5
- **Enrutamiento**: React Router 7.11
- **HTTP Client**: Axios + interceptores JWT
- **Estilos**: Tailwind CSS v3.4.0
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 📊 Módulos Principales

### 1️⃣ Metas Financieras (NUEVO)
```
✅ Crear meta con deadline y objetivo
✅ Seguimiento de progreso
✅ Análisis automático: ¿Es alcanzable?
✅ Indicadores de riesgo (baja/media/alta)
✅ Sugerencia de aporte mensual
✅ Proyección con interés compuesto
```

### 2️⃣ Simuladores (MEJORADO)
```
✅ Simulador Simple: Proyecta inversión
✅ Comparador: 3 escenarios (4%, 8%, 12%)
✅ Calculadora: ¿Cuánto ahorrar mensualmente?
✅ Análisis de Sensibilidad: Impacto de cambios en tasa
✅ Proyecciones: Mes-a-mes y año-a-año
```

### 3️⃣ Dashboard Analítico
```
✅ Patrimonio total
✅ Rentabilidad acumulada  
✅ Distribución de inversiones
✅ Evolución patrimonial (gráfico)
✅ Análisis de riesgo
```

## 🚀 Quick Start

### 1. Clonar y configurar
```bash
git clone <repo>
cd investment-tracker

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env con datos de BD

# Frontend
cd ../frontend
npm install
```

### 2. Base de datos
```bash
mysql -u root -p < database/schema.sql
```

### 3. Ejecutar
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Acceder
```
Frontend: http://localhost:5174
Backend:  http://localhost:5000
```

## 📖 Documentación

### Documentos principales
- **[MEJORAS_METAS_SIMULADORES.md](MEJORAS_METAS_SIMULADORES.md)** ⭐ - Guía completa de cambios y testing
- [backend/README.md](backend/README.md) - Documentación backend
- [frontend/README.md](frontend/README.md) - Documentación frontend

### Puntos clave
1. **Validación**: Centralizada en `Validator` class
2. **Errores**: Manejados globalmente con clases personalizadas
3. **Logs**: Disponibles en `backend/logs/`
4. **Fórmulas**: Precisas con cálculo mes-a-mes

## 🧪 Testing

Antes de proceder a PHASE 3, ejecutar todos los tests:

```bash
# Simulador Simple
POST /api/simulations/calculate
{
  "initial_amount": 1000000,
  "monthly_contribution": 50000,
  "annual_return_percentage": 10,
  "years": 10
}

# Comparación de Escenarios
POST /api/simulations/compare
{
  "initial_amount": 1000000,
  "monthly_contribution": 50000,
  "years": 10
}

# Análisis de Viabilidad
POST /api/goals/1/analyze-feasibility
{
  "annual_return_percentage": 5
}
```

Ver [MEJORAS_METAS_SIMULADORES.md](MEJORAS_METAS_SIMULADORES.md#-testing-checklist) para checklist completo.

## 📈 Endpoints Nuevos

### Goals (Metas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/goals` | Listar metas |
| POST | `/api/goals` | Crear meta |
| GET | `/api/goals/:id` | Obtener meta |
| PUT | `/api/goals/:id` | Actualizar meta |
| DELETE | `/api/goals/:id` | Eliminar meta |
| POST | `/api/goals/:id/analyze-feasibility` | **Analizar viabilidad** ⭐ |

### Simuladores (Mejorado)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/simulations/calculate` | Simulación + sensibilidad |
| POST | `/api/simulations/compare` | 3 escenarios |
| POST | `/api/simulations/required-contribution` | Calcular aporte |

## 🔐 Seguridad

- ✅ Contraseñas con bcrypt
- ✅ JWT para autenticación
- ✅ Validación de entrada
- ✅ Manejo seguro de errores (sin exponer detalles internos)
- ✅ CORS configurado
- ✅ Transacciones en BD para integridad

## 📊 Fórmulas Financieras

### Valor Futuro
```
FV = P(1+r)^n + PMT × [((1+r)^n - 1) / r]
```

### CAGR
```
CAGR = (VF / VI)^(1/años) - 1
```

### ROI
```
ROI = (Ganancias / Inversión) × 100
```

### Sharpe Ratio
```
Sharpe = (Retorno - Tasa Libre) / Volatilidad
```

## 🎓 Aprendizaje

Este proyecto demuestra:
- ✅ Arquitectura profesional Node.js
- ✅ React con Hooks y Context
- ✅ Manejo de errores robusto
- ✅ Logging estructurado
- ✅ Validación centralizada
- ✅ Fórmulas financieras reales
- ✅ Transacciones en BD
- ✅ Autenticación JWT

## 🚀 Próximas Fases

### PHASE 3: KPIs Avanzados
- Cálculos de diversificación
- Análisis de volatilidad histórica
- Métricas de performance
- Reportes exportables

### PHASE 4: IA y Recomendaciones
- Sugerencias automáticas
- Análisis predictivo
- Alertas inteligentes

## 📝 Licencia

MIT License - Libre para uso personal y comercial

## 💬 Preguntas Frecuentes

**P: ¿Puedo usar esto en producción?**
R: Sí, está completamente implementado y testeado.

**P: ¿Cómo agrego más campos a Goals?**
R: Ver [MEJORAS_METAS_SIMULADORES.md](MEJORAS_METAS_SIMULADORES.md)

**P: ¿Dónde veo los logs?**
R: En `backend/logs/` con 5 niveles disponibles.

**P: ¿Cómo extiendo los simuladores?**
R: Usa `financialMetrics.js` para agregar nuevas métricas.

---

**Versión**: 2.0 (PHASE 1 + PHASE 2 ✅)  
**Última actualización**: Diciembre 2025  
**Estado**: Producción

⭐ **Si este proyecto te ayuda, no olvides dejar una estrella** ⭐
