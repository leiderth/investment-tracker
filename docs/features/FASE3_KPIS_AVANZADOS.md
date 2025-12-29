# FASE 3: KPIs AVANZADOS - Plan de Implementación

## 🎯 Objetivos

Mejorar el análisis de portafolio con métricas profesionales de inversión:
- Índice de diversificación optimizado
- Análisis de volatilidad histórica
- Correlación entre inversiones
- Sugerencias de rebalanceo automático
- Reportes exportables (PDF)

---

## 📊 COMPONENTES A IMPLEMENTAR

### 1. Backend - Nuevas Utilidades

#### 📁 `backend/src/utils/advancedMetrics.js` (NUEVO)

**Funciones a implementar:**

##### 1.1 Índice de Diversificación Mejorado
```javascript
function calculateDiversificationIndex(investments)
// Retorna: número 0-100
// Fórmula: Herfindahl–Hirschman Index (HHI)
// HHI = 1 - Σ(si²) donde si = peso de inversión i
// Interpretación:
//   - 0-20: Muy concentrada (alto riesgo)
//   - 20-40: Concentrada
//   - 40-60: Moderadamente diversificada
//   - 60-80: Bien diversificada
//   - 80-100: Excelentemente diversificada
```

##### 1.2 Volatilidad Histórica
```javascript
function calculateHistoricalVolatility(investmentValues, period = 'monthly')
// Retorna: volatilidad anualizada (%)
// Entrada: Array de valores históricos
// Cálculo: Desviación estándar de retornos periódicos
// Anualización: σ_anual = σ_periodo × √(períodos en año)
```

##### 1.3 Correlación de Portafolio
```javascript
function calculateCorrelationMatrix(investments)
// Retorna: matriz NxN de correlaciones
// Muestra: qué inversiones se mueven juntas
// Rango: -1 a 1
//   - Cercano a 1: Altamente correlacionadas
//   - Cercano a 0: Sin correlación
//   - Cercano a -1: Negativamente correlacionadas (excelente para diversificación)
```

##### 1.4 Varianza del Portafolio
```javascript
function calculatePortfolioVariance(weights, volatilities, correlations)
// Retorna: varianza total del portafolio
// Fórmula: σ²p = Σ Σ (wi × wj × σi × σj × ρij)
// Donde: wi = peso, σi = volatilidad, ρij = correlación
```

##### 1.5 Rebalanceo Sugerido
```javascript
function suggestRebalancing(currentWeights, targetWeights, threshold = 5)
// Retorna: sugerencias de compra/venta
// Entrada: pesos actuales vs pesos objetivo
// Umbral: solo sugiere si desviación > 5%
// Respuesta: {
//   needsRebalancing: boolean,
//   suggestions: [
//     { asset: 'AAPL', currentWeight: 35, targetWeight: 25, action: 'SELL', percentage: 10 }
//   ]
// }
```

##### 1.6 Ratio de Sharpe Mejorado
```javascript
function calculatePortfolioSharpe(portfolioReturn, volatility, riskFreeRate = 3)
// Retorna: Sharpe Ratio del portafolio total
// Más alto = mejor retorno ajustado por riesgo
```

##### 1.7 Valor en Riesgo (VaR)
```javascript
function calculateValueAtRisk(returns, confidence = 0.95)
// Retorna: pérdida máxima esperada con 95% confianza
// Ejemplo: "Con 95% confianza, máxima pérdida = 5% del portafolio"
```

##### 1.8 Análisis de Concentración por Sector
```javascript
function analyzeConcentrationBySector(investments)
// Retorna: distribución por sector
// Identifica: si hay concentración excesiva en un sector
// Riesgo: sectores con >50% son riesgosos
```

---

### 2. Backend - Nuevos Endpoints en Dashboard

#### 📁 `backend/src/controllers/dashboard.controller.js` (MEJORADO)

**Endpoint nuevo:**

```javascript
// GET /api/dashboard/advanced-metrics
exports.getAdvancedMetrics = async (req, res) => {
  // Retorna:
  {
    diversificationIndex: 72.5,                    // HHI
    volatility: {
      historical: 12.3,                            // % anualizado
      period: 'monthly',
      dataPoints: 12
    },
    correlationMatrix: [ [...], [...] ],           // NxN matrix
    portFolioVariance: 0.0156,                     // σ²
    sharpeRatio: 1.45,                             // (Retorno - Rf) / σ
    valueAtRisk: {
      loss95: 85000,                               // Pérdida máxima 95%
      loss99: 150000                               // Pérdida máxima 99%
    },
    sectorConcentration: {
      'Tech': 35,
      'Finance': 25,
      'Energy': 15,
      'Other': 25
    },
    rebalancingSuggestions: [
      {
        asset: 'AAPL',
        currentWeight: 15,
        targetWeight: 12,
        action: 'SELL',
        amount: 15000
      }
    ],
    riskMetrics: {
      portfolioRiskLevel: 'medio',
      concentration: 'moderada',
      volatilityTrend: 'estable'
    }
  }
}
```

---

### 3. Frontend - Página de KPIs Avanzados

#### 📁 `frontend/src/pages/AdvancedKPIs.jsx` (NUEVO)

**Secciones:**

1. **KPI Cards** (4 grandes tarjetas)
   - Diversification Index (HHI) con gauge
   - Historical Volatility (%)
   - Sharpe Ratio (performance ajustado por riesgo)
   - Value at Risk (pérdida máxima)

2. **Gráfico de Correlación**
   - Matriz de correlaciones con heat map
   - Colores: rojo (correlacionadas), verde (diversificadas), azul (negativas)

3. **Análisis de Concentración**
   - Gráfico de donut por sector
   - Alertas si hay concentración >50%

4. **Rebalanceo Sugerido**
   - Tabla con sugerencias de compra/venta
   - Botón para ejecutar rebalanceo (solo cálculo, sin ejecutar)

5. **Volatilidad Histórica**
   - Gráfico de línea con tendencia
   - Comparación: volatilidad actual vs promedio

6. **Indicadores de Riesgo**
   - VaR 95% y 99%
   - Máxima pérdida esperada

---

### 4. Frontend - Componentes Reutilizables

#### 📁 `frontend/src/components/metrics/` (NUEVA CARPETA)

```
MetricCard.jsx         // Card reutilizable para KPIs
HeatmapCorrelation.jsx // Matriz de correlaciones interactiva
VolatilityChart.jsx    // Gráfico de volatilidad
RebalancingTable.jsx   // Tabla de sugerencias
SectorDistribution.jsx // Gráfico por sector
VaRIndicator.jsx       // Indicador de Value at Risk
DiversificationGauge.jsx // Gauge para HHI
```

---

### 5. Actualización de Base de Datos

#### 📁 `database/migrations/add-historical-metrics.sql`

```sql
-- Tabla para almacenar valores históricos (para calcular volatilidad)
CREATE TABLE investment_historical_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_id INT NOT NULL,
  date DATE NOT NULL,
  value_cents BIGINT NOT NULL,
  return_percentage DECIMAL(8, 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inv_date (investment_id, date),
  INDEX idx_date (date)
);

-- Tabla para almacenar volatilidad calculada
CREATE TABLE portfolio_volatility_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  calculation_date DATE NOT NULL,
  historical_volatility DECIMAL(6, 4),
  portfolio_variance DECIMAL(10, 8),
  sharpe_ratio DECIMAL(6, 4),
  diversification_index DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, calculation_date)
);
```

---

### 6. API Routes

#### 📁 `backend/src/routes/metrics.routes.js` (NUEVA)

```javascript
// GET /api/metrics/kpis-advanced
exports.getAdvancedKPIs = (req, res) => { ... }

// GET /api/metrics/correlation-matrix
exports.getCorrelationMatrix = (req, res) => { ... }

// POST /api/metrics/suggest-rebalancing
exports.suggestRebalancing = (req, res) => { ... }

// GET /api/metrics/volatility-history
exports.getVolatilityHistory = (req, res) => { ... }

// GET /api/metrics/sector-concentration
exports.getSectorConcentration = (req, res) => { ... }
```

---

## 🔧 PLAN DE IMPLEMENTACIÓN

### Paso 1: Backend - Utilidades Matemáticas
- [ ] Crear `advancedMetrics.js` con todas las funciones
- [ ] Crear `correlationAnalysis.js` para matriz de correlaciones
- [ ] Crear migration para tablas de históricos
- [ ] Ejecutar migration en BD

### Paso 2: Backend - Endpoints
- [ ] Crear `metrics.controller.js`
- [ ] Crear rutas en `metrics.routes.js`
- [ ] Implementar getAdvancedKPIs (integra todas las utilidades)
- [ ] Implementar endpoints de correlación, volatilidad, rebalanceo

### Paso 3: Frontend - Servicios
- [ ] Agregar endpoints a `api.js`
- [ ] Crear hooks personalizados para métricas

### Paso 4: Frontend - UI
- [ ] Crear página `AdvancedKPIs.jsx`
- [ ] Crear componentes en `components/metrics/`
- [ ] Agregar ruta en App.jsx
- [ ] Agregar enlace en Navbar

### Paso 5: Pruebas
- [ ] Probar cada endpoint manualmente
- [ ] Validar cálculos matemáticos
- [ ] Testing de UI
- [ ] Edge cases

---

## 📐 FÓRMULAS A IMPLEMENTAR

### 1. Índice de Diversificación (HHI)
```
HHI = 1 - Σ(si²)
donde si = valor inversión i / valor total

Rango: 0-1 (0-100 en porcentaje)
```

### 2. Volatilidad Anualizada
```
σ_anual = σ_retornos × √(périodos en año)

Ejemplo: σ_mensual = 2%
         σ_anual = 2% × √12 = 6.93%
```

### 3. Correlación Pearson
```
ρ(X,Y) = Cov(X,Y) / (σx × σy)

Rango: -1 a 1
```

### 4. Varianza del Portafolio
```
σ²p = Σ Σ (wi × wj × σi × σj × ρij)

Forma matricial: σ²p = w^T × Σ × w
```

### 5. Sharpe Ratio
```
Sharpe = (Rp - Rf) / σp

Rp = retorno portafolio
Rf = tasa libre de riesgo (3%)
σp = volatilidad portafolio
```

### 6. VaR (Método Paramétrico)
```
VaR = Portafolio × σp × Z_score(confianza)

Z_score(95%) = 1.645
Z_score(99%) = 2.326
```

---

## ✅ CHECKLIST DE ACEPTACIÓN

- [ ] HHI índice calcula correctamente (0-100)
- [ ] Volatilidad histórica anualizada está correcta
- [ ] Matriz de correlaciones es simétrica (-1 a 1)
- [ ] Sharpe Ratio positivo para portafolios con ganancia
- [ ] VaR muestra pérdida máxima realista
- [ ] Sugerencias de rebalanceo son lógicas
- [ ] UI muestra todos los KPIs correctamente
- [ ] Rendimiento aceptable (< 2s para cálculos)
- [ ] Manejo de error para portafolios sin datos históricos

---

## 📝 NOTAS

- **Datos Históricos**: Al principio, usaremos datos actuales con estimaciones. Conforme pasen días, acumularemos histórico real.
- **Performance**: Los cálculos de correlación pueden ser costosos (O(n²)). Implementar caché.
- **Precisión**: Usar centavos en BD para evitar errores de punto flotante.
- **Validación**: Verificar que matriz de correlaciones sea semidefinida positiva.

---

**Estado**: LISTA PARA INICIAR IMPLEMENTACIÓN
**Prioridad**: ALTA
**Estimado**: 4-5 horas de desarrollo
