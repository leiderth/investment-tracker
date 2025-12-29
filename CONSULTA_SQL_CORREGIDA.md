# Consulta SQL corregida - SIN la columna 'name'

## Primero, para ver la estructura de la tabla investments:

```sql
DESCRIBE investments;
```

O:

```sql
SHOW COLUMNS FROM investments;
```

---

## Luego, usa esta consulta para ver tus inversiones:

```sql
SELECT 
  id,
  type,
  platform,
  initial_amount_cents / 100 as inicial_cop,
  current_amount_cents / 100 as actual_cop,
  ROUND(((current_amount_cents - initial_amount_cents) / initial_amount_cents) * 100, 2) as retorno_pct,
  status
FROM investments
WHERE user_id = 1 AND status = 'active'
ORDER BY current_amount_cents DESC;
```

---

## Si quieres ver TODOS los campos disponibles:

```sql
SELECT * FROM investments WHERE user_id = 1 AND status = 'active';
```

---

## Después dime:

**¿Cuáles de estos resultados ves?**
- ¿Cuántas filas retorna?
- ¿Qué valores ves en las columnas?
- ¿La columna 'name' existe o aparece otro nombre para el nombre de la inversión?
