# 📤 GITHUB DEPLOYMENT GUIDE

**Objetivo:** Publicar el proyecto en GitHub (público o privado)  
**Tag Release:** v1.0.0  
**Estado:** Listo para push

---

## 🚀 OPCIÓN 1: Push a Repositorio Existente

### Si ya tienes un repositorio remoto en GitHub

```bash
# Agregar remote (si no existe)
git remote add origin https://github.com/TU_USUARIO/Reporte_aguas2025.git

# Push de todos los commits y tags
git push origin master
git push origin v1.0.0

# Verificar en GitHub
# → https://github.com/TU_USUARIO/Reporte_aguas2025
# → Ir a Releases → Debería ver v1.0.0
```

---

## 🌐 OPCIÓN 2: Crear Nuevo Repositorio en GitHub

### Paso 1: Crear en GitHub
1. Ve a **github.com** → Sign in
2. Haz clic en **+** → **New repository**
3. **Repository name:** `Reporte_aguas2025`
4. **Description:** "Sistema de gestión de reportes diarios - CAMI Gpower"
5. **Visibility:** 
   - **Private** (si es confidencial)
   - **Public** (si quieres mostrar a stakeholders)
6. ⚠️ **NO** inicialices con README (ya tienes)
7. Clic en **Create repository**

### Paso 2: Push Local
```bash
# Navegar al proyecto
cd "C:\Users\jb\Documents\GitHub\Bruma Visual 4.0\Reporte_aguas2025"

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/Reporte_aguas2025.git

# Cambiar rama a main (GitHub usa main por defecto)
git branch -M main

# Push commits y tags
git push -u origin main
git push origin v1.0.0

# Verificar
git remote -v
```

### Paso 3: Verifica en GitHub
- ✅ Commits visibles: https://github.com/TU_USUARIO/Reporte_aguas2025/commits/main
- ✅ Tag/Release: https://github.com/TU_USUARIO/Reporte_aguas2025/releases/tag/v1.0.0
- ✅ Archivos: https://github.com/TU_USUARIO/Reporte_aguas2025

---

## 📄 OPCIÓN 3: Habilitar GitHub Pages (Para Demo Pública)

### Si quieres hosting público de la app

1. En GitHub, ve a **Settings** → **Pages**
2. **Source:** Select branch → `main`
3. **Folder:** `/` (root)
4. Clic en **Save**
5. GitHub te dará URL: `https://TU_USUARIO.github.io/Reporte_aguas2025/`

**IMPORTANTE:** Para que funcione:
```bash
# Primero build la app
npm run build

# Agrega dist/ al git (opcional, si quieres hosting directo)
git add dist/
git commit -m "build: Production build for GitHub Pages"
git push origin main
```

**Luego configura package.json:**
```json
{
  "homepage": "https://TU_USUARIO.github.io/Reporte_aguas2025",
  ...
}
```

---

## 🔐 OPCIÓN 4: Privado Corporativo (Azure DevOps/On-Premises)

Si tu empresa usa Azure DevOps:

```bash
# Remote hacia Azure DevOps
git remote add origin https://dev.azure.com/TU_ORGANIZACION/TU_PROYECTO/_git/Reporte_aguas2025

# Push
git push -u origin master
git push origin v1.0.0
```

---

## ✅ Checklist Post-Push

Una vez pushes a GitHub, verifica:

- [ ] Todos los commits visibles en GitHub
- [ ] Tag v1.0.0 aparece en Releases
- [ ] Archivos `.md` se renderizan correctamente
- [ ] `src/App.jsx` visible y completo
- [ ] `package.json` y `vite.config.js` presentes
- [ ] `.gitignore` configurado (node_modules no está)
- [ ] README.md es el landing page

---

## 🎯 Compartir con Stakeholders

Una vez en GitHub, puedes:

### Opción A: Link Directo
```
https://github.com/TU_USUARIO/Reporte_aguas2025
```
→ Muestra código, commits, documentación

### Opción B: Release Page
```
https://github.com/TU_USUARIO/Reporte_aguas2025/releases/tag/v1.0.0
```
→ Muestra resumen v1.0.0

### Opción C: Documentación
```
https://github.com/TU_USUARIO/Reporte_aguas2025/blob/main/README.md
https://github.com/TU_USUARIO/Reporte_aguas2025/blob/main/SUMMARY.md
```
→ Muestra documentación completa

### Opción D: GitHub Pages (si habilitaste)
```
https://TU_USUARIO.github.io/Reporte_aguas2025/
```
→ Demo interactiva de la app

---

## 🔄 Flujo de Trabajo Futuro

Una vez en GitHub, para nuevos cambios:

```bash
# Desarrollo local
npm run dev

# Cambios
# ... edita archivos ...

# Commit
git add .
git commit -m "Feat: descripción de cambios"

# Push
git push origin main

# Si es versión nueva
git tag -a v1.1.0 -m "Release v1.1.0: ..."
git push origin v1.1.0
```

---

## 📞 Apoyo

**¿Olvidaste tu usuario de GitHub?**
- Ve a github.com/settings/profile
- Username aparece en la URL

**¿Token de autenticación?**
- GitHub ahora requiere Personal Access Token (PAT)
- Settings → Developer settings → Personal access tokens
- Scopes: `repo` + `admin:public_key`

**¿HTTPS vs SSH?**
- HTTPS: `git push` pedirá token cada vez
- SSH: Más seguro, requiere setup de keys
- Para este proyecto, HTTPS es suficiente

---

## 🎉 ¡Listo!

Una vez pushes:
1. ✅ Tu proyecto está en GitHub
2. ✅ Visible a stakeholders
3. ✅ v1.0.0 tag creado
4. ✅ Documentación completa
5. ✅ Listo para Phase 2

**Próximo paso:** Compartir link con superiores y comenzar SharePoint setup.

---

**Documento:** GITHUB_DEPLOYMENT.md  
**Estado:** ✅ Listo  
**Fecha:** Noviembre 20, 2025
