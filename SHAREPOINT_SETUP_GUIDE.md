# 📋 SHAREPOINT SETUP GUIDE

**Objetivo:** Crear 5 listas SharePoint para almacenar datos de reportes diarios  
**Tiempo Estimado:** 2-3 horas  
**Permisos Requeridos:** Site Owner o Admin en tenant Microsoft 365  
**Última Actualización:** Noviembre 20, 2025

---

## 📌 Resumen Rápido: 5 Listas a Crear

| # | Nombre | Tipo | Padre/Hijo | Columnas |
|---|--------|------|-----------|----------|
| 1 | Reportes Diarios | Estándar | **PADRE** | 12 |
| 2 | Recepciones | Estándar | Hijo | 6 |
| 3 | Químicos Consumidos | Estándar | Hijo | 6 |
| 4 | Niveles Piscinas | Estándar | Hijo | 4 |
| 5 | Evacuación Agua | Estándar | Hijo | 5 |

**Relación:** Muchas recepciones → 1 reporte, Muchos químicos → 1 reporte, etc.  
**Campo de conexión:** `IdReportePadre` (tipo **Número**, NO Lookup) en todas las listas hijas

---

## 🔧 PASO 1: Crear la Lista Padre - "Reportes Diarios"

### Acceder a SharePoint
1. Ve a **Microsoft 365** → **SharePoint**
2. Selecciona tu sitio (CAMI, Gpower, o similar)
3. Haz clic en **+ New** → **List**

### Crear la lista
1. Selecciona **Blank list**
2. Nombre: `Reportes Diarios`
3. Ubicación: Tu sitio CAMI/Gpower
4. Haz clic en **Create**

### Agregar columnas a "Reportes Diarios"

**El sistema automáticamente crea:**
- `ID` (autoincremental) - ESTE ES TU IdReportePadre
- `Title` (texto obligatorio)

**Ahora agreguemos el resto:**

#### Columna 1: Fecha Reporte
- **Nombre:** `FechaReporte`
- **Tipo:** Date
- **Obligatorio:** Sí
- **Descripción:** Fecha del reporte
- Guardar

#### Columna 2: Técnico Responsable
- **Nombre:** `TecnicoResponsable`
- **Tipo:** Single line of text
- **Obligatorio:** Sí
- **Longitud máxima:** 255
- Guardar

#### Columna 3: Total Recepción (L)
- **Nombre:** `TotalRecepcion`
- **Tipo:** Number
- **Obligatorio:** No
- **Decimales:** 2
- **Descripción:** Total de litros recibidos
- Guardar

#### Columna 4: Había Tratamiento
- **Nombre:** `HuboTratamiento`
- **Tipo:** Yes/No
- **Obligatorio:** No
- **Valor predeterminado:** No
- Guardar

#### Columna 5: Había Recuperación
- **Nombre:** `HuboRecuperacion`
- **Tipo:** Yes/No
- **Obligatorio:** No
- Guardar

#### Columna 6: Había Recepción
- **Nombre:** `HuboRecepcion`
- **Tipo:** Yes/No
- **Obligatorio:** No
- Guardar

#### Columna 7: Había Evacuación
- **Nombre:** `HuboEvacuacion`
- **Tipo:** Yes/No
- **Obligatorio:** No
- Guardar

#### Columna 8: Total Agua Evacuada (L)
- **Nombre:** `TotalAgua`
- **Tipo:** Number
- **Decimales:** 2
- **Descripción:** Total de litros evacuados
- Guardar

#### Columna 9: Estado Aprobación
- **Nombre:** `EstadoAprobacion`
- **Tipo:** Choice
- **Opciones:** 
  - Pendiente
  - Aprobado
  - Rechazado
- **Obligatorio:** No
- **Valor predeterminado:** Pendiente
- Guardar

#### Columna 10: Fecha Aprobación
- **Nombre:** `FechaAprobacion`
- **Tipo:** Date
- **Obligatorio:** No
- Guardar

#### Columna 11: Aprobado Por
- **Nombre:** `AprobadoPor`
- **Tipo:** Single line of text
- **Obligatorio:** No
- Guardar

#### Columna 12: Notas
- **Nombre:** `Notas`
- **Tipo:** Multiple lines of text
- **Obligatorio:** No
- **Número de líneas:** 6
- Guardar

---

## 🔧 PASO 2: Crear la Lista Hijo - "Recepciones"

### Crear la lista
1. Haz clic en **+ New** → **List**
2. Selecciona **Blank list**
3. Nombre: `Recepciones`
4. Crear

### Agregar columnas a "Recepciones"

#### Columna 1: IdReportePadre
- **Nombre:** `IdReportePadre`
- **Tipo:** **Number** (IMPORTANTE: NO Lookup)
- **Obligatorio:** Sí
- **Decimales:** 0
- **Descripción:** ID del reporte padre (relacionar con Reportes Diarios)
- Guardar

#### Columna 2: Procedencia
- **Nombre:** `Procedencia`
- **Tipo:** Single line of text
- **Obligatorio:** Sí
- **Descripción:** Ej: Pozo A, Pozo B, Piscina Principal
- Guardar

#### Columna 3: Locación
- **Nombre:** `Locacion`
- **Tipo:** Single line of text
- **Obligatorio:** Sí
- **Descripción:** Bloque 14, Bloque 17, etc.
- Guardar

#### Columna 4: Transportista
- **Nombre:** `Transportista`
- **Tipo:** Single line of text
- **Obligatorio:** No
- **Descripción:** Nombre de la empresa transportista
- Guardar

#### Columna 5: Placa Vehículo
- **Nombre:** `Placa`
- **Tipo:** Single line of text
- **Obligatorio:** No
- **Longitud máxima:** 10
- Guardar

#### Columna 6: Volumen (L)
- **Nombre:** `Volumen`
- **Tipo:** Number
- **Obligatorio:** Sí
- **Decimales:** 2
- **Descripción:** Litros recibidos
- Guardar

---

## 🔧 PASO 3: Crear la Lista Hijo - "Químicos Consumidos"

### Crear la lista
1. **+ New** → **List** → **Blank list**
2. Nombre: `Químicos Consumidos`
3. Crear

### Agregar columnas

#### Columna 1: IdReportePadre
- **Nombre:** `IdReportePadre`
- **Tipo:** Number (NO Lookup)
- **Obligatorio:** Sí
- Guardar

#### Columna 2: Nombre Producto
- **Nombre:** `NombreProducto`
- **Tipo:** Choice
- **Opciones:**
  - Cal
  - Sulfato
  - Lipesa
  - Biocida
- **Obligatorio:** Sí
- Guardar

#### Columna 3: Stock Inicial (L)
- **Nombre:** `StockInicial`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** No
- Guardar

#### Columna 4: Consumo (L)
- **Nombre:** `Consumo`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** No
- Guardar

#### Columna 5: Stock Final (L)
- **Nombre:** `StockFinal`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** No
- Guardar

#### Columna 6: Es Crítico
- **Nombre:** `EsCritico`
- **Tipo:** Yes/No
- **Obligatorio:** No
- **Descripción:** Marcar si el stock está por debajo del mínimo
- Guardar

---

## 🔧 PASO 4: Crear la Lista Hijo - "Niveles Piscinas"

### Crear la lista
1. **+ New** → **List** → **Blank list**
2. Nombre: `Niveles Piscinas`
3. Crear

### Agregar columnas

#### Columna 1: IdReportePadre
- **Nombre:** `IdReportePadre`
- **Tipo:** Number (NO Lookup)
- **Obligatorio:** Sí
- Guardar

#### Columna 2: Nombre Piscina
- **Nombre:** `NombrePiscina`
- **Tipo:** Choice
- **Opciones:**
  - PIT 1
  - PIT 2
  - Ranfla
  - API
  - Filtro 1
  - Filtro 2
- **Obligatorio:** Sí
- Guardar

#### Columna 3: Nivel Actual (%)
- **Nombre:** `NivelActual`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** Sí
- **Descripción:** Porcentaje de llenado (0-100)
- Guardar

#### Columna 4: Nivel Crítico
- **Nombre:** `NivelCritico`
- **Tipo:** Yes/No
- **Obligatorio:** No
- **Descripción:** Marcar si está por encima de 80% o debajo de 20%
- Guardar

---

## 🔧 PASO 5: Crear la Lista Hijo - "Evacuación Agua"

### Crear la lista
1. **+ New** → **List** → **Blank list**
2. Nombre: `Evacuación Agua`
3. Crear

### Agregar columnas

#### Columna 1: IdReportePadre
- **Nombre:** `IdReportePadre`
- **Tipo:** Number (NO Lookup)
- **Obligatorio:** Sí
- Guardar

#### Columna 2: Agua Evacuada (L)
- **Nombre:** `AguaEvacuada`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** Sí
- Guardar

#### Columna 3: Total Viajes
- **Nombre:** `TotalViajes`
- **Tipo:** Number
- **Decimales:** 0
- **Obligatorio:** Sí
- Guardar

#### Columna 4: Uso Biocida
- **Nombre:** `UsoBiocida`
- **Tipo:** Yes/No
- **Obligatorio:** No
- Guardar

#### Columna 5: Biocida Cantidad (L)
- **Nombre:** `BiocidaCantidad`
- **Tipo:** Number
- **Decimales:** 2
- **Obligatorio:** No
- Guardar

---

## ✅ PASO 6: Validación

Una vez creadas todas las listas, verifica:

### Checklist
- [ ] **Reportes Diarios** creada con 12 columnas
- [ ] **Recepciones** creada con `IdReportePadre` (Number)
- [ ] **Químicos Consumidos** creada con `IdReportePadre` (Number)
- [ ] **Niveles Piscinas** creada con `IdReportePadre` (Number)
- [ ] **Evacuación Agua** creada con `IdReportePadre` (Number)
- [ ] Todas las listas hijas tienen `IdReportePadre` tipo **Number** (NO Lookup)
- [ ] Todas las columnas Choice tienen las opciones correctas
- [ ] Las columnas obligatorias están marcadas correctamente

### Prueba Manual
1. Ve a **Reportes Diarios**
2. Crea un elemento de prueba:
   - FechaReporte: Hoy
   - TecnicoResponsable: "Test User"
   - Nota el **ID** generado (ej: 1)
3. Ve a **Recepciones**
4. Crea un elemento:
   - IdReportePadre: 1 (el ID del padre)
   - Procedencia: "Pozo A"
   - Locación: "Bloque 14"
   - Volumen: 100
5. ✅ Si se guardó sin errores, la estructura está correcta

---

## 🔗 PASO 7: Integración con Power Automate

Una vez creadas las listas:

1. Anota el nombre exacto de cada lista (tal como aparece en SharePoint)
2. Los IDs de columna se generan automáticamente
3. En Power Automate, usarás acciones como:
   - **Create item** en "Reportes Diarios"
   - **Create item** en cada lista hijo
   - Usar el ID del padre generado para rellenar `IdReportePadre` en los hijos

---

## ⚠️ NOTAS IMPORTANTES

### ¿Por qué "Number" en lugar de "Lookup"?
- **Lookup** crea una relación fuerte que puede romper si se borra el padre
- **Number** es más flexible y compatible con Power Automate
- En Power BI puedes crear relaciones "virtuales" igual

### Validación de Datos
- Para garantizar integridad, en Power Automate:
  - Verificar que `IdReportePadre` existe en la lista padre antes de crear hijos
  - O configurar políticas de borrado (Delete Orphans) manualmente si es necesario

### Permisos
- Asegúrate de que los usuarios tengan al menos **Edit** en todas las listas
- Los admins de Power Automate necesitan **Full Control**

---

## 📞 Soporte

Si encuentras errores:
1. Verifica que el nombre exacto de la columna coincida (mayúsculas/minúsculas)
2. Asegúrate de que `IdReportePadre` es tipo **Number**, no **Lookup**
3. Valida que todas las opciones Choice estén correctas
4. En caso de crear nuevas listas, elimina las antiguas primero (o renombra)

---

**Estado:** ✅ Documentación completa  
**Próximo Paso:** Crear Power Automate flow que use estas listas  
**Fecha Esperada:** 1-2 días después de completar este setup
