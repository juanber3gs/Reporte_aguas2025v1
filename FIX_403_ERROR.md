# ⚠️ SOLUCIÓN: Error 403 - Permiso Denegado

## El Problema:
```
fatal: unable to access 'https://github.com/juanber3gs/Reporte_aguas2025v1.git/': 
The requested URL returned error: 403
```

El repositorio es de `juanber3gs`, pero VS Code está intentando usar credenciales de otra cuenta.

---

## 🔧 SOLUCIÓN: Usar Token de Acceso Personal

### Paso 1: Crear Token en GitHub

1. Ve a: https://github.com/settings/tokens
2. Clic en **"Generate new token"**
3. Nombre: `Reporte_aguas2025_push`
4. Selecciona scopes (permisos):
   - ✅ `repo` (acceso completo a repos)
   - ✅ `workflow` (si necesitas CI/CD)
5. Clic: **Generate token**
6. **COPIA EL TOKEN** (no podrás verlo después)

### Paso 2: Usar Token en Git

En la terminal, cuando te pida contraseña, usa:
- **Usuario:** `juanber3gs`
- **Contraseña:** `[PEGA EL TOKEN]`

### Paso 3: Push con Token

```bash
cd "c:\Users\jb\Documents\GitHub\Bruma Visual 4.0\Reporte_aguas2025"

# Hacer push
git push -u origin master

# Cuando pida credenciales:
# Username: juanber3gs
# Password: [Tu token de 40 caracteres]
```

---

## 🔐 ALTERNATIVA: Configurar Git Credentials

Para que Git recuerde las credenciales:

```bash
git config --global credential.helper wincred
```

Luego, la primera vez que hagas push:
- Te pedirá usuario y token
- Git lo guardará en Windows Credential Manager

Las siguientes veces, no lo pedirá.

---

## 📱 ALTERNATIVA 2: SSH (Más seguro a largo plazo)

Si prefieres SSH (sin passwords):

1. Genera SSH key:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_key
   ```

2. Agrega public key a GitHub:
   - https://github.com/settings/ssh
   - New SSH key → Pega contenido de `github_key.pub`

3. Cambiar remoto a SSH:
   ```bash
   git remote set-url origin git@github.com:juanber3gs/Reporte_aguas2025v1.git
   ```

4. Push:
   ```bash
   git push -u origin master
   ```

---

## ✅ RECOMENDADO PARA TI:

**Usa el TOKEN (más simple):**

1. Crea token en GitHub (Paso 1)
2. En terminal, haz push
3. Pega el token como contraseña
4. ¡Listo!

---

## 🎯 Comandos Finales para Push:

```bash
cd "c:\Users\jb\Documents\GitHub\Bruma Visual 4.0\Reporte_aguas2025"

# Push master branch
git push -u origin master

# Push v1.0.0 tag
git push origin v1.0.0

# Verificar
git branch -a
git tag
```

---

**Estado:** Esperando token o autenticación  
**Próximo paso:** Crea token y vuelve a hacer push
