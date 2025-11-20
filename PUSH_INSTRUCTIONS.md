# 📤 PUSH A GITHUB - INSTRUCCIONES VSCODE

## 🚀 OPCIÓN 1: Push Directo desde VS Code (MÁS FÁCIL)

### Paso 1: Abre VS Code
- Abre el proyecto en VS Code
- Atajo: `Ctrl + Shift + G` → Git
- O: Panel izquierdo → ícono Git (rama)

### Paso 2: Publish a GitHub
1. En el panel Git (izquierda), busca: **"Publish to GitHub"**
2. Haz clic en "Publish to GitHub"
3. VS Code te pedirá:
   - ✅ Nombre repo: `Reporte_aguas2025`
   - ✅ Privado o Público: Elige uno
   - ✅ Autorización: GitHub abrirá navegador para autorizar

### Paso 3: ¡Listo!
- VS Code automáticamente:
  - Crea el repo en GitHub
  - Hace push de todos los commits
  - Hace push del tag v1.0.0

---

## 🚀 OPCIÓN 2: Push Manual (Si ya tienes repo)

### En VS Code Terminal:

```bash
# 1. Abre Terminal: Ctrl + ` (backtick)

# 2. Navega al proyecto
cd "c:\Users\jb\Documents\GitHub\Bruma Visual 4.0\Reporte_aguas2025"

# 3. Verifica el remote
git remote -v

# 4. Si NO está configurado:
git remote add origin https://github.com/BernardoGalindo/Reporte_aguas2025.git

# 5. Push commits
git push -u origin main

# 6. Push tags
git push origin v1.0.0
```

---

## 🚀 OPCIÓN 3: Desde UI Git de VS Code

### Paso 1: Sincronizar
1. Panel Git (Ctrl + Shift + G)
2. Busca botón **"Sync"** o **"Publish"**
3. Haz clic

### Paso 2: Credenciales
- VS Code abrirá navegador → GitHub login
- Autoriza la app
- Cierra el navegador (VS Code continúa)

### Paso 3: Verificar
- En VS Code, deberías ver:
  - Green checkmark ✅ junto a "Source Control"
  - Opción "Publish to GitHub" desaparece

---

## 🎯 RECOMENDADO PARA TI:

**OPCIÓN 1: Publish to GitHub** (más simple, no requiere conocer URLs)

**Pasos exactos:**
1. Abre VS Code con el proyecto
2. `Ctrl + Shift + G` → Panel Git
3. Busca: "Publish to GitHub"
4. Haz clic
5. Elige: **Public** (para mostrar a stakeholders)
6. Autoriza en GitHub
7. ¡Hecho!

---

## ✅ Verificar después de Push

Una vez pushes, deberías ver:

```
https://github.com/BernardoGalindo/Reporte_aguas2025
```

Con:
- ✅ 6 commits visibles
- ✅ 7 archivos .md
- ✅ src/ folder
- ✅ Tag v1.0.0 en Releases

---

## 🆘 Si algo falla:

**Error: "Repository not found"**
→ Asegúrate de crear el repo en GitHub PRIMERO:
1. Ve a https://github.com/new
2. Nombre: `Reporte_aguas2025`
3. Clic: Create repository
4. Copia la URL HTTPS
5. En VS Code: `git remote add origin [URL]`

**Error: "Authentication failed"**
→ VS Code pedirá autorizar. Sigue el navegador que abre.

**Error: "Push rejected"**
→ Pull primero: `git pull origin main`

---

## 📞 ¿Necesitas ayuda?

Avisame cuando hagas click en "Publish to GitHub" y te guío por cada paso.

**Estado:** ✅ Repositorio local listo
**Próximo:** Push a GitHub
**Tiempo:** 5 minutos

---

Documento: PUSH_INSTRUCTIONS.md
Fecha: Noviembre 20, 2025
