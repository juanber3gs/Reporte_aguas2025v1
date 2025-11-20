#!/bin/bash
# Script para hacer push a GitHub

echo "======================================"
echo "PUSH A GITHUB - Bernardo Galindo"
echo "======================================"
echo ""

# Navegar al directorio
cd "c:\Users\jb\Documents\GitHub\Bruma Visual 4.0\Reporte_aguas2025"

# Verificar remote actual
echo "📍 Remote actual:"
git remote -v
echo ""

# Opción 1: Si el remote NO es correcto, actualizar
echo "🔧 Configurando remote..."
git remote set-url origin https://github.com/BernardoGalindo/Reporte_aguas2025.git

echo "✅ Remote configurado:"
git remote -v
echo ""

# Cambiar rama a main (GitHub estándar)
echo "🔄 Preparando rama..."
git branch -M main

echo ""
echo "📤 PUSH A GITHUB (commits)..."
git push -u origin main

echo ""
echo "📤 PUSH A GITHUB (tags)..."
git push origin v1.0.0

echo ""
echo "======================================"
echo "✅ PUSH COMPLETADO"
echo "======================================"
echo ""
echo "🌐 Tu proyecto está en:"
echo "   https://github.com/BernardoGalindo/Reporte_aguas2025"
echo ""
echo "🏷️  Release v1.0.0:"
echo "   https://github.com/BernardoGalindo/Reporte_aguas2025/releases/tag/v1.0.0"
echo ""
