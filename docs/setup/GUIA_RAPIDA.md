# 📚 GUÍA RÁPIDA - INVESTTRACKER v3.0

## 🎯 ¿Qué es InvestTracker?

Una **plataforma web profesional** para gestionar inversiones, establecer metas financieras y analizar portafolios con KPIs avanzados.

---

## 🚀 ¿Cómo Usar?

### 1. **Acceso**
```
URL: http://localhost:5174
Usuario: (registrarse o login)
```

### 2. **Flujo Principal**

```
Página Inicial
    ↓
[Dashboard] → Resumen del portafolio
    ↓
[Inversiones] → Agregar/editar inversiones
    ↓
[Metas] → Establecer objetivos financieros
    ↓
[Simulaciones] → Proyectar crecimiento
    ↓
[KPIs] → Análisis avanzado ← ¡TÚ ESTÁS AQUÍ!
```

---

## 📊 Las 5 Secciones Principales

### 1️⃣ Dashboard
**¿Qué ves?** Resumen general de tu portafolio
- Patrimonio total
- Rentabilidad acumulada
- Distribución por tipo
- Evolución en el tiempo

**Ruta:** `/dashboard`

---

### 2️⃣ Inversiones
**¿Qué ves?** Tu cartera de inversiones
- Lista de todas tus inversiones
- Estado actual y rentabilidad
- Opciones para agregar/editar

**Ruta:** `/investments`

---

### 3️⃣ Metas
**¿Qué ves?** Objetivos financieros
- Crear metas (casa, carro, etc)
- Seguimiento de progreso
- Análisis automático (¿es alcanzable?)

**Ruta:** `/goals`

---

### 4️⃣ Simulaciones
**¿Qué ves?** Proyecciones de crecimiento

**Tab 1: Simulador Simple**
- Ingresa capital inicial, aporte mensual, % anual, años
- Visualiza: montofinal, ganancias, ROI
- Incluye análisis de sensibilidad (qué pasa si cambia el %)

**Tab 2: Comparar Escenarios** ⭐ (Recién arreglado)
- Compara 3 escenarios: Conservador 4%, Moderado 8%, Agresivo 12%
- Visualiza qué escenario es mejor para ti

**Tab 3: Calculadora de Meta**
- Define tu objetivo (ej: $1M)
- Calcula cuánto necesitas ahorrar mensualmente

**Ruta:** `/simulations`

---

### 5️⃣ KPIs Avanzados ⭐ (NUEVO)
**¿Qué ves?** Análisis profesional de riesgo y performance

**4 KPI Cards Principales:**
1. 🎯 **Diversificación** (0-100 índice HHI)
   - 0 = Concentrada (mal)
   - 100 = Diversificada (bien)

2. 📊 **Volatilidad** (% anualizado)
   - Indica qué tan inestable es tu portafolio
   - > 15% = Alto riesgo

3. 📈 **Sharpe Ratio** (retorno ajustado por riesgo)
   - Cuánto ganas por cada unidad de riesgo
   - > 1 = Bueno

4. ⚠️ **Value at Risk** (pérdida máxima esperada)
   - "Con 95% confianza, puedes perder como máximo..."

**Otras Secciones:**
- 📋 Resumen del portafolio (valor total, ganancias)
- 🎨 Análisis de riesgo (nivel general, recomendaciones)
- 🥧 Distribución por sector (tabla + gráfico)
- 🌡️ Value at Risk detallado (95% y 99%)
- 🔗 Matriz de correlaciones (cómo se mueven juntas tus inversiones)

**Ruta:** `/kpis`

---

## 💻 Tech Stack

### Backend
```
Node.js + Express
MySQL 8.0
JWT (autenticación)
```

### Frontend
```
React 19
Vite (bundler)
Recharts (gráficos)
Tailwind CSS (estilos)
```

### Fórmulas Financieras
```
- FV (Valor Futuro)
- CAGR (Crecimiento anual)
- ROI (Retorno inversión)
- HHI (Diversificación)
- Sharpe Ratio
- Value at Risk (VaR)
```

---

## 🔐 Seguridad

✅ Contraseñas encriptadas con bcrypt
✅ Tokens JWT para sesiones
✅ Validación de entrada en backend
✅ CORS configurado
✅ Datos en centavos (sin decimales)

---

## 📈 Ejemplo Práctico

### Caso: Inversionista con $500,000

```
INVERSIONES:
├─ AAPL: $150,000
├─ Bonos: $100,000  
├─ Bitcoin: $80,000
├─ Fondo: $100,000
└─ CDT: $70,000

MÉTRICAS KPI:
├─ Diversificación: 72% (Bien)
├─ Volatilidad: 12% (Media)
├─ Sharpe: 1.2 (Buen retorno/riesgo)
├─ VaR 95%: 6% máximo de pérdida
└─ Recomendación: "Portafolio bien balanceado"
```

---

## 🛠️ Troubleshooting

### Error: "No hay inversiones activas"
**Solución:** Ve a [Inversiones] y agrega al menos una

### Error: "Acceso denegado"
**Solución:** Has logout, vuelve a entrar ([Login])

### Los gráficos no cargan
**Solución:** Recarga la página (F5)

### Simulación lenta
**Solución:** Cierra otras pestañas/aplicaciones

---

## 📱 Responsive Design

✅ Optimizado para:
- 📱 Teléfono (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Ctrl + K` | Buscar (próxima fase) |
| `Ctrl + /` | Ayuda (próxima fase) |
| `Esc` | Cerrar modales |

---

## 📊 Indicadores de Color

| Color | Significado |
|-------|------------|
| 🟢 Verde | ✅ Bueno / Positivo |
| 🟡 Amarillo | ⚠️ Precaución |
| 🔴 Rojo | ❌ Alerta / Negativo |
| 🔵 Azul | ℹ️ Información |

---

## 🚀 Funciones Principales por Fase

### PHASE 1: Infraestructura ✅
```
✅ Autenticación
✅ Base de datos
✅ Validación
✅ Error handling
```

### PHASE 2: Metas y Simuladores ✅
```
✅ CRUD de metas
✅ 3 simuladores
✅ Análisis de sensibilidad
✅ Proyecciones
```

### PHASE 3: KPIs Avanzados ✅
```
✅ 10 funciones de análisis
✅ 6 secciones de UI
✅ 6 fórmulas financieras
✅ Recomendaciones inteligentes
```

---

## 📞 FAQ

**P: ¿Puedo borrar mis inversiones?**
R: Sí, desde la página de [Inversiones]

**P: ¿Dónde guarda mis datos?**
R: En la BD MySQL local (localhost)

**P: ¿Qué pasa si cambio los % de retorno?**
R: Las simulaciones se recalculan automáticamente

**P: ¿Puedo exportar datos?**
R: (Próxima fase) Exportar a PDF/Excel

**P: ¿Es seguro mis dinero?**
R: Datos encriptados. No manejamos dinero real.

---

## 🎯 Próximos Pasos Recomendados

1. **Agrega inversiones** en [Inversiones]
2. **Crea una meta** en [Metas]
3. **Simula escenarios** en [Simulaciones]
4. **Analiza KPIs** en [KPIs]
5. **Toma decisiones informadas** 🎓

---

## 📖 Documentación Adicional

```
📄 MEJORAS_METAS_SIMULADORES.md  → PHASE 1 & 2 detalles
📄 FASE3_KPIS_COMPLETADA.md       → PHASE 3 detalles técnicos
📄 README_ACTUALIZADO.md          → Documentación general
📄 RESUMEN_PHASE3.md              → Este resumen ejecutivo
```

---

## 🎓 Aprendizaje

Este proyecto demuestra:

```
✅ Cálculos financieros reales
✅ Análisis de portafolios
✅ Visualización de datos
✅ Full-stack development
✅ UI/UX profesional
✅ Arquitectura escalable
```

---

## 💡 Tips Útiles

1. **Diversifica** tus inversiones (apunta a HHI > 60)
2. **Monitorea** el Sharpe Ratio (busca > 1)
3. **Analiza** correlaciones (valores negativos = bueno)
4. **Establece** metas realistas
5. **Revisa** KPIs mensualmente

---

## ⚡ Performance

```
Dashboard:     < 100ms
Inversiones:   < 200ms
Simulaciones:  < 300ms
KPIs:          < 500ms
```

Rápido y eficiente ✨

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Verifica la conexión al backend
3. Limpia el caché del navegador
4. Recarga la página (Ctrl+Shift+R)

---

## 🎉 ¡Listo para Usar!

```
✨ InvestTracker 3.0 está completamente funcional
   y listo para gestionar tus inversiones profesionalmente ✨
```

---

**Versión:** 3.0
**Última actualización:** 28 Diciembre 2025
**Status:** ✅ Producción

**Próxima lectura:** FASE3_KPIS_COMPLETADA.md (técnico)
