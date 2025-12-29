# 🚀 INICIO RÁPIDO - InvestTracker v2.0

## Requisitos Previos
- **Node.js** v18+
- **MySQL** 8.0+ (XAMPP)
- **npm** v9+

---

## 1️⃣ INSTALACIÓN INICIAL

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

### Base de Datos
```bash
# 1. Iniciar XAMPP (Apache + MySQL)
# 2. Crear base de datos:
mysql -u root -p
CREATE DATABASE investment_tracker;

# 3. Ejecutar migraciones:
mysql -u root -p investment_tracker < ../database/schema.sql
mysql -u root -p investment_tracker < ../database/seeds.sql
```

---

## 2️⃣ CONFIGURACIÓN

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=investment_tracker
JWT_SECRET=your_jwt_secret_here_change_in_production
NODE_ENV=development
PORT=5000
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 3️⃣ EJECUTAR LA APLICACIÓN

### Terminal 1 - Backend
```bash
cd backend
npm start
# Esperado: 🚀 Servidor corriendo en http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
# Esperado: 🚀 Frontend en http://localhost:5173
```

---

## 4️⃣ PRIMEROS PASOS

### Acceder a la Aplicación
- Abrir: http://localhost:5173
- Registrarse con email y contraseña
- Login

### Crear Primera Inversión
1. Hacer clic en "Nueva Inversión"
2. Llenar formulario:
   - **Nombre**: Ej. "Apple Stock"
   - **Tipo**: Ej. "Acción"
   - **Plataforma**: Ej. "Interactive Brokers"
   - **Capital Inicial**: $1,000
   - **Valor Actual**: $1,200
3. Guardar

### Explorar Funcionalidades
- **Dashboard**: Resumen del patrimonio
- **Inversiones**: Gestionar inversiones
- **Metas**: Crear metas financieras
- **Simuladores**: Proyectar rendimientos
- **Analytics**: KPIs avanzados y análisis

---

## 5️⃣ CARACTERÍSTICAS PRINCIPALES

### ✅ Versión 2.0 - Completa
- ✓ Dashboard profesional
- ✓ Gestión de inversiones
- ✓ Metas financieras
- ✓ Simuladores de rendimiento
- ✓ Análisis de riesgo
- ✓ KPIs avanzados
- ✓ Análisis técnico
- ✓ Exportación de datos
- ✓ Autenticación JWT
- ✓ Base de datos MySQL

### 🔄 Próximas Fases
- **Fase 12**: Soporte multimoneda
- **Fase 13**: Alertas automáticas
- **Fase 14**: Integración de APIs
- **Fase 15**: Análisis predictivo

---

## 6️⃣ TROUBLESHOOTING

### ❌ "Cannot GET /api/dashboard/stats"
**Solución**: Verificar que Backend está corriendo en terminal
```bash
cd backend && npm start
```

### ❌ "NetworkError when attempting to fetch resource"
**Solución**: Frontend no puede conectar con backend
- Verificar `VITE_API_URL` en `.env.local`
- Verificar que backend está en puerto 5000

### ❌ "Error: ER_ACCESS_DENIED_ERROR"
**Solución**: Problemas con credenciales MySQL
- Verificar usuario/contraseña en `.env`
- Verificar que MySQL está corriendo

### ❌ "npm ERR! Cannot find module"
**Solución**: 
```bash
npm install
# Luego intentar de nuevo
```

---

## 7️⃣ DEVELOPMENT

### Build Frontend
```bash
cd frontend
npm run build
# Genera carpeta dist/
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- [README_v2.0.md](./README_v2.0.md) - Descripción general del proyecto
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Guía de instalación detallada
- [ROADMAP_FASES_12-15.md](./ROADMAP_FASES_12-15.md) - Próximas fases
- [CHANGELOG_v2.0.md](./CHANGELOG_v2.0.md) - Cambios y mejoras

---

## 💡 TIPS

1. **Usar datos de prueba**: Ejecutar `seeds.sql` para datos de ejemplo
2. **Monitorear logs**: Ver `/backend/logs/app.log` para debugging
3. **Performance**: El dashboard carga 30 días de datos; ajustar en settings
4. **Seguridad**: Cambiar `JWT_SECRET` en producción

---

## 🆘 SOPORTE

Para problemas específicos:
1. Revisar [RESUMEN_EJECUTIVO_v2.0.md](./RESUMEN_EJECUTIVO_v2.0.md)
2. Verificar logs en `/backend/logs/`
3. Revisar console.log en navegador (F12)

---

**¡Disfruta usando InvestTracker! 🎉**
