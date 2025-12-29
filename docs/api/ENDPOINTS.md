# 📡 API REST - Investment Tracker

Documentación completa de los endpoints del backend.

## 🌐 Base URL

```
http://localhost:5000/api
```

## 🔐 Autenticación

Todos los endpoints (excepto auth) requieren JWT en el header:

```
Authorization: Bearer <token>
```

Obtén el token con POST `/auth/login`

## 📊 Endpoints Principales

### 📈 Dashboard

#### Obtener datos completos del dashboard
```http
GET /dashboard/complete
Content-Type: application/json
Authorization: Bearer <token>

# Respuesta (200 OK):
{
  "stats": {
    "totalInvestments": 3,
    "activeInvestments": 2,
    "totalCapital": 5000,
    "totalPatrimony": 5342.50,
    "totalProfit": 342.50,
    "returnPercentage": 6.85,
    "healthStatus": "bueno"
  },
  "evolution": [
    { "date": "2024-12-20", "value": 5000 },
    { "date": "2024-12-21", "value": 5150 },
    { "date": "2024-12-22", "value": 5342.50 }
  ],
  "topInvestments": [
    {
      "id": 1,
      "name": "Tesla",
      "type": "Acciones",
      "platform": "Interactive Brokers",
      "currentAmount": 2150,
      "returnPercentage": 7.5
    }
  ],
  "byType": [
    { "type": "Acciones", "count": 2, "total": 3100 },
    { "type": "Cripto", "count": 1, "total": 2242.50 }
  ],
  "riskAnalysis": {
    "riskScore": 65,
    "riskLevel": "Medio",
    "diversificationScore": 72
  },
  "advancedMetrics": {
    "volatility": 18.5,
    "sharpeRatio": 1.23,
    "maxDrawdown": 12.5
  },
  "currencies": {
    "baseCurrency": "USD",
    "baseAmount": 5342.50,
    "conversions": {
      "EUR": 4920,
      "COP": 21543000
    }
  }
}
```

### 💰 Inversiones

#### Listar inversiones
```http
GET /investments
Authorization: Bearer <token>

# Query parameters opcionales:
# ?type=Acciones    - Filtrar por tipo
# ?status=activa    - Filtrar por estado
# ?sort=return      - Ordenar por campo

# Respuesta (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Tesla",
      "type": "Acciones",
      "platform": "Interactive Brokers",
      "initialAmount": 2000,
      "currentAmount": 2150,
      "purchaseDate": "2024-12-01",
      "currency": "USD",
      "status": "activa"
    }
  ],
  "count": 3
}
```

#### Crear inversión
```http
POST /investments
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Tesla",
  "type": "Acciones",
  "platform": "Interactive Brokers",
  "initialAmount": 2000,
  "currency": "USD",
  "purchaseDate": "2024-12-01",
  "notes": "Primera compra de Tesla"
}

# Respuesta (201 Created):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tesla",
    "type": "Acciones",
    ...
  }
}
```

#### Obtener inversión
```http
GET /investments/:id
Authorization: Bearer <token>

# Respuesta (200 OK):
{
  "success": true,
  "data": { ... }
}
```

#### Actualizar inversión
```http
PUT /investments/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentAmount": 2200,
  "notes": "Actualización manual"
}

# Respuesta (200 OK):
{
  "success": true,
  "data": { ... }
}
```

#### Eliminar inversión
```http
DELETE /investments/:id
Authorization: Bearer <token>

# Respuesta (204 No Content)
```

### 📊 Análisis

#### Análisis de riesgo
```http
GET /analytics/risk
Authorization: Bearer <token>

# Respuesta (200 OK):
{
  "success": true,
  "data": {
    "riskScore": 65,
    "riskLevel": "Medio",
    "volatility": 18.5,
    "diversificationScore": 72
  }
}
```

#### Rendimiento
```http
GET /analytics/performance
Authorization: Bearer <token>

# Respuesta:
{
  "success": true,
  "data": {
    "totalReturn": 342.50,
    "returnPercentage": 6.85,
    "sharpeRatio": 1.23,
    "maxDrawdown": 12.5
  }
}
```

#### Multi-moneda
```http
GET /analytics/currencies
Authorization: Bearer <token>

# Respuesta:
{
  "success": true,
  "data": {
    "baseCurrency": "USD",
    "baseAmount": 5342.50,
    "conversions": {
      "EUR": 4920,
      "COP": 21543000,
      "ARS": 4835000
    }
  }
}
```

### 🎯 Metas Financieras

#### Listar metas
```http
GET /financial-goals
Authorization: Bearer <token>

# Respuesta:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Casa",
      "targetAmount": 100000,
      "currentAmount": 35000,
      "deadline": "2025-12-31",
      "status": "en_progreso"
    }
  ]
}
```

#### Crear meta
```http
POST /financial-goals
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Casa",
  "description": "Comprar una casa",
  "targetAmount": 100000,
  "deadline": "2025-12-31",
  "priority": "alta"
}

# Respuesta (201 Created):
{
  "success": true,
  "data": { ... }
}
```

### 👤 Usuarios

#### Registrarse
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Juan"
}

# Respuesta (201 Created):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Iniciar sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}

# Respuesta (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## 🔍 Códigos de Respuesta

| Código | Significado |
|--------|------------|
| 200    | OK - Solicitud exitosa |
| 201    | Created - Recurso creado |
| 204    | No Content - Eliminado exitosamente |
| 400    | Bad Request - Datos inválidos |
| 401    | Unauthorized - Falta autenticación |
| 403    | Forbidden - No tienes permisos |
| 404    | Not Found - Recurso no existe |
| 500    | Server Error - Error del servidor |

## 📝 Validaciones

### Investment (Inversión)
```json
{
  "name": "string (1-200 caracteres)",
  "type": "enum: 'Acciones', 'Cripto', 'Bonos', 'Fondos', 'Inmuebles', 'Otros'",
  "platform": "string (1-200 caracteres)",
  "initialAmount": "number > 0",
  "currency": "string (USD, EUR, COP, ARS, etc)",
  "purchaseDate": "YYYY-MM-DD"
}
```

### Financial Goal (Meta)
```json
{
  "name": "string (1-200 caracteres)",
  "targetAmount": "number > 0",
  "deadline": "YYYY-MM-DD",
  "priority": "enum: 'baja', 'media', 'alta'",
  "status": "enum: 'en_progreso', 'completada', 'pausada'"
}
```

## 🧪 Ejemplos con cURL

```bash
# Registrarse
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

# Obtener inversiones
curl -X GET http://localhost:5000/api/investments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear inversión
curl -X POST http://localhost:5000/api/investments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Apple",
    "type": "Acciones",
    "platform": "Fidelity",
    "initialAmount": 1000,
    "currency": "USD"
  }'
```

## 🔄 Rate Limiting

No hay rate limiting en desarrollo. En producción se aplicará:
- 100 requests por minuto por usuario
- 1000 requests por hora por IP

## 🆘 Errores Comunes

### 401 Unauthorized
Token inválido, expirado o no incluido.
```json
{
  "success": false,
  "error": "Token no válido"
}
```

### 400 Bad Request
Datos faltantes o inválidos.
```json
{
  "success": false,
  "error": "Validación fallida",
  "details": {
    "initialAmount": "Must be greater than 0"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Investment not found"
}
```

---

**Última actualización**: Diciembre 2025
