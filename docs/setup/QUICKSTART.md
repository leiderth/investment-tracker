# ⚡ QUICKSTART - Investment Tracker v2.1

**Refactorización completada ✅ | Listo para producción 🚀**

---

## 🚀 Ejecutar en 2 Minutos

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Escucha en http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
# Disponible en http://localhost:5173
```

### Resultado
- Dashboard: http://localhost:5173/dashboard
- Backend: http://localhost:5000/api/health

---

## 📊 Validar Sistema

```bash
# Test rápido
node test_simple.js

# Resultado esperado:
# ✅ PASS - Backend está funcionando
# ✅ PASS - Endpoint accesible
```

---

## 📚 Documentación

| Documento | Propósito | Tiempo |
|-----------|-----------|--------|
| **INDEX.md** | Índice general | 2 min |
| **RESUMEN_REFACTORIZACION.md** | Overview | 5 min |
| **PROJECT_STRUCTURE.md** | Arquitectura | 10 min |
| **TEST_CHECKLIST.md** | Validaciones | 5 min |

---

## 🎯 Lo Que Hace Investment Tracker

✅ **Autenticación** - Login/register con JWT  
✅ **Dashboard** - Métricas de inversiones  
✅ **Inversiones** - Agregar, editar, eliminar  
✅ **Metas** - Planificación financiera  
✅ **Simuladores** - Proyecciones  
✅ **Análisis de Riesgo** - Evaluación  
✅ **Multimoneda** - Conversión de monedas  

---

## 🔑 Features Principales

### Dashboard
```
📊 Patrimonio Total
💰 Capital Invertido
📈 Ganancia/Pérdida
📊 Inversiones Activas
```

### Módulos
```
💰 Inversiones - CRUD completo
🎯 Metas - Seguimiento
🎲 Simuladores - Proyecciones
⚠️  Riesgo - Análisis
💱 Monedas - Conversión (Fase 12)
```

---

## 💻 Stack Tecnológico

**Frontend**: React 18 + Tailwind CSS + Vite  
**Backend**: Node.js + Express + MySQL  
**Auth**: JWT  
**API**: REST con axios  

---

## 🔗 URLs Importantes

```
Frontend:      http://localhost:5173
Backend API:   http://localhost:5000/api
Dashboard:     http://localhost:5173/dashboard
Health Check:  http://localhost:5000/api/health
```

---

## ⚙️ Variables de Entorno

### Backend (`.env`)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=investment_tracker
JWT_SECRET=tu_secret_key
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 📖 Estructura Rápida

```
investment-tracker/
├── backend/          ← Server API
├── frontend/         ← React App
├── database/         ← SQL scripts
├── INDEX.md          ← Comienza aquí
└── RELEASE_NOTES.md  ← Cambios v2.1
```

---

## ✅ Checklist de Setup

- [ ] `npm install` en backend y frontend
- [ ] Variables de entorno configuradas
- [ ] MySQL corriendo
- [ ] `npm run dev` en ambas carpetas
- [ ] http://localhost:5173 cargando
- [ ] `node test_simple.js` pasando

---

## 🆘 Problemas Comunes

### Backend no responde
```bash
# Verificar puerto
netstat -ano | findstr :5000

# Verificar base de datos
mysql -u root -p
> USE investment_tracker;
> SHOW TABLES;
```

### Frontend con errores
```bash
# Limpiar dependencias
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Tests fallan
```bash
# Asegúrate que backend está corriendo
node test_simple.js

# Si sigue fallando, revisar logs
```

---

## 🎓 Para Aprender Más

1. **Structure**: Lee `PROJECT_STRUCTURE.md`
2. **Changes**: Lee `REFACTORING_REPORT.md`
3. **Tests**: Ejecuta `node test_suite.js`
4. **Docs**: Ve a `INDEX.md`

---

## 🚀 Status

```
✅ Backend: Operativo (5000)
✅ Frontend: Operativo (5173)
✅ Database: Conectada
✅ Tests: Pasados
✅ Documentación: Completa

🟢 LISTO PARA PRODUCCIÓN
```

---

## 🎉 ¡Listo!

```bash
# Ejecuta esto y disfruta:
cd backend && npm run dev &
cd ../frontend && npm run dev

# Abre: http://localhost:5173
```

---

**Última actualización**: 28 Diciembre 2025  
**Versión**: 2.1 (Refactorización Completa)  
**Status**: ✅ LISTO
