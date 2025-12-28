#!/bin/bash
# QUICK START GUIDE - INVESTMENT TRACKER v2.0

echo "🚀 INVESTMENT TRACKER - GUÍA DE INICIO RÁPIDO"
echo "============================================="
echo ""

# Verificar Node.js
echo "1️⃣ Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Verificar npm
echo ""
echo "2️⃣ Verificando npm..."
echo "✅ npm: $(npm --version)"

# Verificar MySQL
echo ""
echo "3️⃣ Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️ MySQL CLI no encontrado, pero podrías usar phpMyAdmin"
else
    echo "✅ MySQL disponible"
fi

echo ""
echo "📋 PASOS A SEGUIR:"
echo "=================="
echo ""
echo "1. CREAR LA BASE DE DATOS"
echo "   mysql -u root -p investment-tracker < database/schema.sql"
echo ""
echo "2. CONFIGURAR BACKEND"
echo "   cd backend"
echo "   npm install"
echo "   cp .env.example .env  # Editar con tus datos de BD"
echo ""
echo "3. CONFIGURAR FRONTEND"
echo "   cd ../frontend"
echo "   npm install"
echo ""
echo "4. EJECUTAR"
echo "   # Terminal 1:"
echo "   cd backend && npm run dev"
echo ""
echo "   # Terminal 2:"
echo "   cd frontend && npm run dev"
echo ""
echo "5. ACCEDER"
echo "   http://localhost:5174  (Frontend)"
echo "   http://localhost:5000  (Backend API)"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "==============="
echo "   - MEJORAS_METAS_SIMULADORES.md  (Cambios principales)"
echo "   - README_ACTUALIZADO.md          (Descripción completa)"
echo "   - RESUMEN_EJECUTIVO.md           (Resumen técnico)"
echo ""
echo "🧪 TESTING:"
echo "=========="
echo "   Ver MEJORAS_METAS_SIMULADORES.md para checklist completo"
echo ""
echo "✅ ¡Listo para comenzar!"
