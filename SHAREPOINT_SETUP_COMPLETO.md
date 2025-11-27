# 📋 Guía Completa: Crear Listas SharePoint para Reporte de Aguas 2025

**Versión:** 1.0  
**Fecha:** Noviembre 23, 2025  
**Propósito:** Setup completo de 5 listas SharePoint integradas con React app + Power Automate

---

## ⚠️ REQUISITOS PREVIOS

1. **Acceso a SharePoint Online** con permisos para crear listas
2. **Sitio SharePoint activo** (ej: https://tusorganizacion.sharepoint.com/sites/TuSitio)
3. **Cuenta de usuario** con rol "Propietario" o "Editor"
4. **Conexión de Internet** estable

---

## 🎯 OBJETIVO FINAL

Crear 5 listas interconectadas:
- **1 Lista Maestra (Padre):** TB_ReportesDiarios
- **4 Listas Detalle (Hijos):** TB_Recepciones, TB_InventarioQuimicos, TB_NivelesPiscinas, TB_Evacuacion

Todas relacionadas por **IdReportePadre** (campo numérico crítico)

---

## 📊 ARQUITECTURA DE DATOS

```
TB_ReportesDiarios (Padre)
├── TB_Recepciones (Viajes de camiones)
├── TB_InventarioQuimicos (Consumo de productos)
├── TB_NivelesPiscinas (Estado de 6 piscinas)
└── TB_Evacuacion (Salida de agua/crudo)
```

---

# PASO 1️⃣: Crear Lista Maestra - TB_ReportesDiarios

## 1.1 Acceder a SharePoint

1. Ve a tu **sitio SharePoint**
2. En la esquina izquierda, haz clic en **+ Nuevo**
3. Selecciona **Lista**
4. Elige **Lista en blanco**

## 1.2 Nombrar la Lista

**Nombre:** `TB_ReportesDiarios`  
**Descripción:** Encabezado principal del reporte diario de aguas

Haz clic en **Crear**

## 1.3 Renombrar la Columna "Title" a "Referencia"

SharePoint crea por defecto una columna "Title". Necesitas renombrarla:

1. En la lista nueva, haz clic en el encabezado de la columna **Title**
2. Selecciona **Editar esta columna**
3. Cambia el nombre a **Referencia**
4. Descripción: `Identificador único del reporte (Ej: REP-2025-11-20)`
5. Haz clic en **Guardar**

## 1.4 Agregar Columnas a TB_ReportesDiarios

Repite este proceso para cada columna (haz clic en **+** en el encabezado):

### Columna 1: FechaReporte
- **Tipo:** Fecha y Hora
- **Mostrar como:** Solo fecha
- **Requerida:** Sí
- **Descripción:** `Fecha del reporte`

**Pasos:**
1. Haz clic en **+** → **Agregar columna**
2. Nombre: `FechaReporte`
3. Tipo: **Fecha y Hora**
4. Haz clic en el tipo para expandir opciones
5. Selecciona "Mostrar como: Fecha solamente"
6. Marca **Requerida**
7. Guardar

### Columna 2: Usuario
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Técnico responsable del reporte`

### Columna 3: TotalRecepcion
- **Tipo:** Número
- **Decimales:** 3
- **Requerida:** No
- **Descripción:** `Total recepcionado en Bbl`

**Configuración especial:**
```
Número de decimales: 3
Mostrar separador de miles: Sí
Rango mínimo: 0
```

### Columna 4: HuboTratamiento
- **Tipo:** Sí/No (Toggle/Boolean)
- **Valor predeterminado:** No
- **Descripción:** `¿Se aplicó tratamiento químico?`

### Columna 5: HuboRecuperacion
- **Tipo:** Sí/No
- **Valor predeterminado:** No
- **Descripción:** `¿Hubo recuperación de crudo?`

### Columna 6: EstadoAprobacion
- **Tipo:** Opción (Choice/Dropdown)
- **Opciones:**
  - Pendiente (valor por defecto)
  - Aprobado
  - Rechazado
- **Descripción:** `Estado de aprobación del reporte`

**Pasos para Opción:**
1. Haz clic en **+** → **Agregar columna**
2. Nombre: `EstadoAprobacion`
3. Tipo: **Opción** (Choice)
4. En "Escriba cada opción en una línea nueva":
   ```
   Pendiente
   Aprobado
   Rechazado
   ```
5. Opción predeterminada: `Pendiente`
6. Formato: Desplegable (o Botones)
7. Guardar

### Columna 7: ComentariosSupervisor
- **Tipo:** Varias líneas de texto
- **Formato de texto:** Texto sin formato (Plain text)
- **Requerida:** No
- **Descripción:** `Comentarios de validación`

**Pasos para Varias líneas:**
1. Haz clic en **+** → **Agregar columna**
2. Nombre: `ComentariosSupervisor`
3. Tipo: **Varias líneas de texto**
4. Número de líneas: `6`
5. Formato de texto: **Texto sin formato**
6. Guardar

### Columna 8: FechaCreacion
- **Tipo:** Fecha y Hora
- **Mostrar como:** Fecha y hora
- **Configuración especial:** Completado automáticamente
- **Descripción:** `Fecha/hora de creación del reporte`

---

## ✅ RESULTADO ESPERADO - TB_ReportesDiarios

| Columna | Tipo | Decimales/Opciones | Requerida |
|---------|------|-------------------|-----------|
| Referencia | Texto | - | Sí |
| FechaReporte | Fecha | Solo fecha | Sí |
| Usuario | Texto | - | Sí |
| TotalRecepcion | Número | 3 | No |
| HuboTratamiento | Sí/No | - | No |
| HuboRecuperacion | Sí/No | - | No |
| EstadoAprobacion | Opción | Pendiente/Aprobado/Rechazado | No |
| ComentariosSupervisor | Varias líneas | Texto sin formato | No |

---

# PASO 2️⃣: Crear Lista Detalle - TB_Recepciones

**Propósito:** Almacenar los viajes de los camiones (múltiples recepciones por reporte)

## 2.1 Crear la Lista

1. Haz clic en **+ Nuevo** → **Lista**
2. Nombre: `TB_Recepciones`
3. Descripción: `Detalle de recepciones (viajes de camiones)`
4. Crear

## 2.2 Renombrar "Title" a "Id"

1. Renombra la columna **Title** a **Id**
2. Descripción: `Identificador único de la recepción`

## 2.3 Agregar Columnas a TB_Recepciones

### Columna 1: IdReportePadre ⭐ CRÍTICA
- **Tipo:** Número (entero, sin decimales)
- **Requerida:** Sí
- **Descripción:** `ID de la lista maestra TB_ReportesDiarios - VÍNCULO CON PADRE`

⚠️ **NOTA:** No usar tipo "Lookup" (búsqueda). Usar Número simple porque Power Automate inserta el ID directo.

### Columna 2: Procedencia
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Origen del agua/crudo (Ej: Laguna Sur, Pozo, Río)`

### Columna 3: Locacion
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Ubicación de donde proviene`

### Columna 4: Transportista
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Nombre de la empresa/persona que transporta`

### Columna 5: Placa
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Placa del vehículo (Ej: ABC-1234)`

### Columna 6: Volumen
- **Tipo:** Número
- **Decimales:** 3
- **Requerida:** Sí
- **Descripción:** `Volumen recibido en Bbl`

---

## ✅ RESULTADO ESPERADO - TB_Recepciones

| Columna | Tipo | Decimales | Requerida |
|---------|------|-----------|-----------|
| Id | Texto | - | Sí |
| **IdReportePadre** | Número | 0 (entero) | **Sí ⭐** |
| Procedencia | Texto | - | Sí |
| Locacion | Texto | - | Sí |
| Transportista | Texto | - | Sí |
| Placa | Texto | - | Sí |
| Volumen | Número | 3 | Sí |

---

# PASO 3️⃣: Crear Lista Detalle - TB_InventarioQuimicos

**Propósito:** Almacenar el consumo de químicos si hubo tratamiento

## 3.1 Crear la Lista

1. **+ Nuevo** → **Lista**
2. Nombre: `TB_InventarioQuimicos`
3. Descripción: `Consumo de químicos por reporte`
4. Crear

## 3.2 Renombrar "Title" a "Id"

1. Renombra **Title** a **Id**
2. Descripción: `Identificador único del producto consumido`

## 3.3 Agregar Columnas a TB_InventarioQuimicos

### Columna 1: IdReportePadre ⭐ CRÍTICA
- **Tipo:** Número (entero)
- **Requerida:** Sí
- **Descripción:** `Enlace con TB_ReportesDiarios`

### Columna 2: Producto
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Nombre del producto (Cal, Sulfato, Lipesa, Biocida)`

### Columna 3: StockInicial
- **Tipo:** Número
- **Decimales:** 2
- **Requerida:** Sí
- **Descripción:** `Stock al inicio del día`

### Columna 4: Consumo
- **Tipo:** Número
- **Decimales:** 2
- **Requerida:** Sí
- **Descripción:** `Cantidad consumida`

### Columna 5: StockFinal
- **Tipo:** Número
- **Decimales:** 2
- **Requerida:** No
- **Descripción:** `Stock al final (Calculado: Inicial - Consumo)`

---

## ✅ RESULTADO ESPERADO - TB_InventarioQuimicos

| Columna | Tipo | Decimales | Requerida |
|---------|------|-----------|-----------|
| Id | Texto | - | Sí |
| **IdReportePadre** | Número | 0 | **Sí ⭐** |
| Producto | Texto | - | Sí |
| StockInicial | Número | 2 | Sí |
| Consumo | Número | 2 | Sí |
| StockFinal | Número | 2 | No |

---

# PASO 4️⃣: Crear Lista Detalle - TB_NivelesPiscinas

**Propósito:** Almacenar el estado de las 6 piscinas (monitoreo)

## 4.1 Crear la Lista

1. **+ Nuevo** → **Lista**
2. Nombre: `TB_NivelesPiscinas`
3. Descripción: `Niveles de las 6 piscinas de operación`
4. Crear

## 4.2 Renombrar "Title" a "Id"

1. Renombra **Title** a **Id**
2. Descripción: `Identificador único`

## 4.3 Agregar Columnas a TB_NivelesPiscinas

### Columna 1: IdReportePadre ⭐ CRÍTICA
- **Tipo:** Número (entero)
- **Requerida:** Sí
- **Descripción:** `Enlace con TB_ReportesDiarios`

### Columna 2: NombrePiscina
- **Tipo:** Texto de una línea
- **Requerida:** Sí
- **Descripción:** `Nombre de la piscina (PIT1, Ranfla, API, etc.)`

**Valores típicos:**
```
PIT1
PIT2
Ranfla
API
Recuperacion
Contingencia
```

### Columna 3: NivelPorcentaje
- **Tipo:** Número
- **Decimales:** 0 (Entero)
- **Requerida:** Sí
- **Descripción:** `Nivel en porcentaje (0-100%)`

**Configuración:**
```
Rango mínimo: 0
Rango máximo: 100
Mostrar separador de miles: No
```

### Columna 4: NivelCritico
- **Tipo:** Sí/No
- **Requerida:** No
- **Descripción:** `¿Nivel crítico? (< 20% o > 90%)`

---

## ✅ RESULTADO ESPERADO - TB_NivelesPiscinas

| Columna | Tipo | Decimales | Rango | Requerida |
|---------|------|-----------|-------|-----------|
| Id | Texto | - | - | Sí |
| **IdReportePadre** | Número | 0 | - | **Sí ⭐** |
| NombrePiscina | Texto | - | - | Sí |
| NivelPorcentaje | Número | 0 | 0-100 | Sí |
| NivelCritico | Sí/No | - | - | No |

---

# PASO 5️⃣: Crear Lista Detalle - TB_Evacuacion

**Propósito:** Almacenar la salida de agua tratada o crudo

## 5.1 Crear la Lista

1. **+ Nuevo** → **Lista**
2. Nombre: `TB_Evacuacion`
3. Descripción: `Registro de evacuación de agua y crudo`
4. Crear

## 5.2 Renombrar "Title" a "Id"

1. Renombra **Title** a **Id**
2. Descripción: `Identificador único de evacuación`

## 5.3 Agregar Columnas a TB_Evacuacion

### Columna 1: IdReportePadre ⭐ CRÍTICA
- **Tipo:** Número (entero)
- **Requerida:** Sí
- **Descripción:** `Enlace con TB_ReportesDiarios`

### Columna 2: TipoEvacuacion
- **Tipo:** Opción (Choice)
- **Requerida:** Sí
- **Opciones:**
  ```
  Crudo
  AguaTratada
  ```
- **Descripción:** `Tipo de agua evacuada`

### Columna 3: Volumen
- **Tipo:** Número
- **Decimales:** 3
- **Requerida:** Sí
- **Descripción:** `Volumen evacuado en Bbl`

### Columna 4: NivelPIT2Control
- **Tipo:** Número
- **Decimales:** 1
- **Requerida:** No
- **Descripción:** `Nivel de control PIT2 (solo si es AguaTratada)`

### Columna 5: UsoBiocida
- **Tipo:** Sí/No
- **Requerida:** No
- **Descripción:** `¿Se usó biocida en la evacuación?`

### Columna 6: CantidadBiocida
- **Tipo:** Número
- **Decimales:** 2
- **Requerida:** No
- **Descripción:** `Cantidad de biocida usada (si aplica)`

---

## ✅ RESULTADO ESPERADO - TB_Evacuacion

| Columna | Tipo | Decimales | Opciones | Requerida |
|---------|------|-----------|----------|-----------|
| Id | Texto | - | - | Sí |
| **IdReportePadre** | Número | 0 | - | **Sí ⭐** |
| TipoEvacuacion | Opción | - | Crudo / AguaTratada | Sí |
| Volumen | Número | 3 | - | Sí |
| NivelPIT2Control | Número | 1 | - | No |
| UsoBiocida | Sí/No | - | - | No |
| CantidadBiocida | Número | 2 | - | No |

---

# 🔗 PASO 6️⃣: Verificar Relaciones

Después de crear todas las listas, verifica:

## 6.1 Relación: TB_Recepciones → TB_ReportesDiarios

**En TB_Recepciones:**
- Campo `IdReportePadre` = ID de la fila en TB_ReportesDiarios
- Ejemplo: Si TB_ReportesDiarios tiene ID 5, todos los viajes de ese reporte tendrán `IdReportePadre = 5`

## 6.2 Relación: TB_InventarioQuimicos → TB_ReportesDiarios

**En TB_InventarioQuimicos:**
- Campo `IdReportePadre` = ID de TB_ReportesDiarios
- Múltiples filas por reporte (Cal, Sulfato, Lipesa, Biocida)

## 6.3 Relación: TB_NivelesPiscinas → TB_ReportesDiarios

**En TB_NivelesPiscinas:**
- Campo `IdReportePadre` = ID de TB_ReportesDiarios
- Máximo 6 filas por reporte (una por piscina)

## 6.4 Relación: TB_Evacuacion → TB_ReportesDiarios

**En TB_Evacuacion:**
- Campo `IdReportePadre` = ID de TB_ReportesDiarios
- Múltiples filas por reporte (Crudo, AguaTratada)

---

# ⚙️ PASO 7️⃣: Obtener IDs de las Listas

Para configurar Power Automate, necesitas los **IDs de las listas**:

## 7.1 Encontrar el ID de una Lista

1. Abre la lista en SharePoint
2. Ve a **Configuración** (esquina superior derecha)
3. Haz clic en **Información de la lista**
4. Busca "ID de lista:" 
5. Cópialo (es un GUID largo, ej: `a1b2c3d4-e5f6-...`)

## 7.2 Anotar los IDs

```
TB_ReportesDiarios:      [PEGA AQUÍ]
TB_Recepciones:          [PEGA AQUÍ]
TB_InventarioQuimicos:   [PEGA AQUÍ]
TB_NivelesPiscinas:      [PEGA AQUÍ]
TB_Evacuacion:           [PEGA AQUÍ]
```

---

# ✅ CHECKLIST FINAL

- [ ] TB_ReportesDiarios creada con 8 columnas
- [ ] TB_Recepciones creada con IdReportePadre
- [ ] TB_InventarioQuimicos creada con IdReportePadre
- [ ] TB_NivelesPiscinas creada con IdReportePadre
- [ ] TB_Evacuacion creada con IdReportePadre
- [ ] Todos los tipos de datos son correctos
- [ ] Todas las columnas críticas están marcadas como "Requerida"
- [ ] IDs de listas anotados
- [ ] Permisos asignados a usuarios que crearán reportes

---

# 🚀 PRÓXIMOS PASOS

Después de crear estas 5 listas:

1. **Configurar Power Automate Flow:**
   - Crear trigger HTTP (webhook)
   - Validar payload del JSON
   - Crear filas en TB_ReportesDiarios
   - Crear filas en listas detalle

2. **Inyectar Webhook URL en React App:**
   - Copiar URL del flow
   - Pegar en `App.jsx` variable `WEBHOOK_URL`
   - Testear envío desde formulario

3. **Crear Power BI Dashboard:**
   - Conectar a SharePoint
   - Visualizar reportes, químicos, piscinas, evacuación

---

# 📞 SOPORTE

Si tienes dudas en algún paso:
1. Verifica el **tipo de dato** es exacto
2. Asegúrate de que **IdReportePadre es Número** (no Lookup)
3. Comprueba que las listas estén en el **mismo sitio SharePoint**
4. Confirma que tienes **permisos de Editor o Propietario**

---

**Creado:** 23-11-2025  
**Versión:** 1.0 - Configuración Manual Completa
