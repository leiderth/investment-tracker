# Verificación y Mejora de Datos en phpMyAdmin

## Lo que acabé de hacer en el Backend:

✅ Mejoré 3 funciones para devolver datos REALES:
1. **getAdvancedMetricsData()** - Calcula volatilidad, Sharpe Ratio y Max Drawdown con DATOS REALES
2. **getByTypeData()** - Distribución por tipo con percentajes calculados
3. **getTopInvestmentsData()** - Top 10 inversiones (antes era 5) con todos los datos

---

## Qué revisar en phpMyAdmin:

Entra a: **http://localhost/phpmyadmin**

### 1. Revisar la tabla `investments`

```sql
SELECT 
  id, name, type, platform,
  initial_amount_cents, 
  current_amount_cents,
  initial_amount_cents / 100 as initial_amount,
  current_amount_cents / 100 as current_amount,
  (current_amount_cents - initial_amount_cents) / 100 as profit,
  risk_level,
  status
FROM investments
WHERE user_id = 1
ORDER BY current_amount_cents DESC;
```

**Qué buscar:**
- ¿Hay inversiones con status = 'active'?
- ¿Los valores initial_amount_cents y current_amount_cents son > 0?
- ¿Los tipos de inversiones son diferentes? (CDT, acciones, ETF, etc)

---

### 2. Si los datos son incorrectos, puedes actualizarlos así:

```sql
-- Actualizar una inversión específica
UPDATE investments 
SET 
  current_amount_cents = 500000000,  -- $5,000,000
  status = 'active'
WHERE id = 1;

-- O agregar más inversiones de prueba
INSERT INTO investments (user_id, name, type, platform, initial_amount_cents, current_amount_cents, risk_level, status, created_at)
VALUES 
(1, 'Acciones Tech', 'acciones', 'Bolsa de Valores', 100000000, 150000000, 'alto', 'active', NOW()),
(1, 'Fondo Indexado', 'ETF', 'Fondo X', 200000000, 220000000, 'bajo', 'active', NOW()),
(1, 'CDT Bancario', 'CDT', 'Banco ABC', 300000000, 310000000, 'bajo', 'active', NOW());
```

---

### 3. Verificar `portfolio_daily_metrics` (para el gráfico de evolución)

```sql
SELECT 
  id, investment_id, metric_date,
  total_value_cents / 100 as total_value,
  total_return_cents / 100 as total_return
FROM portfolio_daily_metrics
WHERE user_id = 1
ORDER BY metric_date DESC
LIMIT 30;
```

**Si está vacío:**
```sql
-- Agregar datos de prueba para los últimos 30 días
INSERT INTO portfolio_daily_metrics (user_id, metric_date, total_value_cents, total_return_cents, created_at)
VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 30 DAY), 500000000, 0, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 520000000, 20000000, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 550000000, 50000000, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 570000000, 70000000, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 600000000, 100000000, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 630000000, 130000000, NOW()),
(1, CURDATE(), 650000000, 150000000, NOW());
```

---

## O simplemente dime:

"He revisado phpMyAdmin y me dice que:" 
- La tabla investments tiene X inversiones
- Los valores están en centavos (multiplicados por 100)
- Los status son: ...
- etc

Y yo haré los ajustes necesarios en el código del backend según tus datos reales.

---

## El Dashboard ahora:

✅ Mostrará datos REALES de:
- **Métricas Avanzadas**: Volatilidad calculada, Sharpe Ratio real, Max Drawdown real
- **Distribución por Tipo**: Mostrará qué porcentaje de tu portafolio está en cada tipo
- **Top Inversiones**: Las 10 mejores inversiones ordenadas por valor actual
