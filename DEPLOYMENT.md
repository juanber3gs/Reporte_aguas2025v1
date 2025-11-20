# 🚀 DEPLOYMENT & INTEGRATION GUIDE

**Objetivo:** Integrar el frontend React con SharePoint + Power Automate  
**Audiencia:** DevOps, Admin, Backend Developer  
**Estado:** Listo para implementación

---

## 📊 Flujo General de Integración

```
Frontend (React)
    ↓ [HTTP POST - JSON]
Power Automate Webhook
    ↓ [Parse JSON]
SharePoint Lists
    ├─ Create: Reportes Diarios (Padre)
    ├─ Create: Recepciones (Hijo)
    ├─ Create: Químicos Consumidos (Hijo)
    ├─ Create: Niveles Piscinas (Hijo)
    └─ Create: Evacuación Agua (Hijo)
    ↓ [Email Notifications]
Power BI (post-setup)
    ↓ [Live Dashboards]
Stakeholder Review
```

---

## 🔧 FASE 1: Crear Power Automate Flow

### 1.1 - Crear HTTP Trigger

**En Power Automate:**

1. Ve a **Power Automate** → **+ Create** → **Cloud flow** → **Automated cloud flow**
2. Nombre: `Procesar Reporte Diario`
3. Trigger: **When a HTTP request is received**
4. Clic en **+ Edit in advanced mode**

**Request Body JSON Schema:**

```json
{
  "type": "object",
  "properties": {
    "meta": {
      "type": "object",
      "properties": {
        "fecha": { "type": "string" },
        "tecnicoResponsable": { "type": "string" },
        "totalRecepcion": { "type": "number" }
      }
    },
    "recepcion": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "procedencia": { "type": "string" },
          "locacion": { "type": "string" },
          "transportista": { "type": "string" },
          "placa": { "type": "string" },
          "volumen": { "type": "number" }
        }
      }
    },
    "quimicos": {
      "type": "object",
      "properties": {
        "cal": {
          "type": "object",
          "properties": {
            "inicial": { "type": "number" },
            "consumo": { "type": "number" },
            "saldo": { "type": "number" }
          }
        },
        "sulfato": { "type": "object" },
        "lipesa": { "type": "object" },
        "biocida": {
          "type": "object",
          "properties": {
            "usado": { "type": "boolean" },
            "cantidad": { "type": "number" }
          }
        }
      }
    },
    "piscinas": {
      "type": "object",
      "properties": {
        "pit1": { "type": "number" },
        "pit2": { "type": "number" },
        "ranfla": { "type": "number" },
        "api": { "type": "number" },
        "filtro1": { "type": "number" },
        "filtro2": { "type": "number" }
      }
    },
    "recuperacionCrudo": {
      "type": "object",
      "properties": {
        "crudoEvacuado": { "type": "number" }
      }
    },
    "evacuacion": {
      "type": "object",
      "properties": {
        "usoBiocida": { "type": "boolean" },
        "biocidaCantidad": { "type": "number" },
        "aguaEvacuada": { "type": "number" },
        "totalViajes": { "type": "number" }
      }
    },
    "config": {
      "type": "object",
      "properties": {
        "huboTratamiento": { "type": "boolean" },
        "huboRecuperacion": { "type": "boolean" },
        "huboRecepcion": { "type": "boolean" },
        "huboEvacuacion": { "type": "boolean" }
      }
    }
  }
}
```

**Copiar HTTP POST URL** que se genera (la necesitarás para el frontend)

---

### 1.2 - Crear Reporte Padre

**Acción: Create item** (SharePoint)

1. Conector: **SharePoint**
2. Acción: **Create item**
3. Site Address: Tu sitio CAMI/Gpower
4. List Name: `Reportes Diarios`

**Mapear campos:**

| Campo SharePoint | Valor dinámico (del JSON) |
|---|---|
| Title | `concat('Reporte-', body('Parse_JSON')?['meta']?['fecha'])` |
| FechaReporte | `body('Parse_JSON')?['meta']?['fecha']` |
| TecnicoResponsable | `body('Parse_JSON')?['meta']?['tecnicoResponsable']` |
| TotalRecepcion | `body('Parse_JSON')?['meta']?['totalRecepcion']` |
| HuboTratamiento | `body('Parse_JSON')?['config']?['huboTratamiento']` |
| HuboRecuperacion | `body('Parse_JSON')?['config']?['huboRecuperacion']` |
| HuboRecepcion | `body('Parse_JSON')?['config']?['huboRecepcion']` |
| HuboEvacuacion | `body('Parse_JSON')?['config']?['huboEvacuacion']` |
| TotalAgua | `body('Parse_JSON')?['evacuacion']?['aguaEvacuada']` |
| EstadoAprobacion | `'Pendiente'` |

**Guardar el ID del elemento creado:**
- En la acción, clic en "Mostrar opciones avanzadas"
- Copiar el campo `ID` (salida de Create item)

---

### 1.3 - Bucle para Recepciones

**Acción: Apply to each** (para cada recepción)

1. Entrada: `body('Parse_JSON')?['recepcion']`
2. Dentro del bucle, agregar: **Create item** en `Recepciones`

**Mapear:**

| Campo | Valor |
|---|---|
| IdReportePadre | `body('Crear_item')['ID']` |
| Procedencia | `items('Apply_to_each')?['procedencia']` |
| Locacion | `items('Apply_to_each')?['locacion']` |
| Transportista | `items('Apply_to_each')?['transportista']` |
| Placa | `items('Apply_to_each')?['placa']` |
| Volumen | `items('Apply_to_each')?['volumen']` |

---

### 1.4 - Crear Químicos (Estructura similar al anterior)

**Acciones secuenciales o bucle** para Cal, Sulfato, Lipesa, Biocida

Ejemplo para Cal:

```
Acción: Create item en "Químicos Consumidos"
- IdReportePadre: ID del padre
- NombreProducto: "Cal"
- StockInicial: body('Parse_JSON')?['quimicos']?['cal']?['inicial']
- Consumo: body('Parse_JSON')?['quimicos']?['cal']?['consumo']
- StockFinal: body('Parse_JSON')?['quimicos']?['cal']?['saldo']
```

Repetir para Sulfato, Lipesa, Biocida

---

### 1.5 - Crear Piscinas (6 acciones secuenciales)

```
Para cada piscina (PIT1, PIT2, Ranfla, API, Filtro1, Filtro2):

Acción: Create item en "Niveles Piscinas"
- IdReportePadre: ID del padre
- NombrePiscina: "PIT 1" (ej)
- NivelActual: body('Parse_JSON')?['piscinas']?['pit1']
- NivelCritico: if(greaterOrEquals(items('NivelActual'), 80), true, if(lessOrEquals(items('NivelActual'), 20), true, false))
```

---

### 1.6 - Crear Evacuación

```
Acción: Create item en "Evacuación Agua"
- IdReportePadre: ID del padre
- AguaEvacuada: body('Parse_JSON')?['evacuacion']?['aguaEvacuada']
- TotalViajes: body('Parse_JSON')?['evacuacion']?['totalViajes']
- UsoBiocida: body('Parse_JSON')?['evacuacion']?['usoBiocida']
- BiocidaCantidad: body('Parse_JSON')?['evacuacion']?['biocidaCantidad']
```

---

### 1.7 - Response (HTTP)

**Acción: Response** (al final del flow)

```
Status Code: 200
Body:
{
  "success": true,
  "reportId": @body('Crear_item')?['ID'],
  "message": "Reporte procesado correctamente"
}
```

---

### 1.8 - Error Handling

Agregar **Configure run after** en cada acción importante:
- ✅ is successful
- ❌ has failed

En caso de fallo, enviar email de error al admin

---

## 📱 FASE 2: Actualizar Frontend (App.jsx)

### Paso 1: Obtener URL Webhook

1. En Power Automate, ve a **Procesar Reporte Diario** flow
2. Abre el trigger **When a HTTP request is received**
3. Copia la **HTTP POST URL**

### Paso 2: Actualizar App.jsx

En `src/App.jsx`, línea ~650, reemplaza:

```javascript
const WEBHOOK_URL = "https://prod-XX.logic.azure.com:443/workflows/..."; 
```

Con tu URL real de Power Automate:

```javascript
const WEBHOOK_URL = "https://prod-XX.logic.azure.com:443/workflows/abc123/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xyz789";
```

### Paso 3: Commit

```bash
cd "Reporte_aguas2025"
git add src/App.jsx
git commit -m "config: Integrate Power Automate webhook URL into frontend"
```

---

## 🧪 FASE 3: Testing End-to-End

### 3.1 - Prueba Local

1. Ejecuta `npm run dev`
2. Abre http://localhost:5173
3. Llena un reporte completo
4. Haz clic en "Enviar Reporte"
5. Verifica que aparezca el banner de éxito

### 3.2 - Verificar Power Automate

1. En Power Automate, abre el flow
2. Haz clic en **Run** (ícono de play)
3. Copia el JSON de prueba desde App.jsx (function construirPayload)
4. Pega en el body del trigger
5. Haz clic en **Run**
6. Verifica que el flow se ejecute sin errores

### 3.3 - Verificar SharePoint

1. Ve a **Reportes Diarios** en SharePoint
2. Verifica que exista un nuevo elemento
3. Ve a **Recepciones** y verifica que tenga registros con el mismo IdReportePadre
4. Repite para otras listas hijas

### 3.4 - Prueba de Fallos (Error Handling)

1. Desactiva el flow en Power Automate
2. Intenta enviar un reporte
3. Verifica que el frontend muestre mensaje de error
4. Reactiva el flow
5. Reintenta y verifica que funcione

---

## 🌐 FASE 4: Deployment a Producción

### 4.1 - Build

```bash
npm run build
```

Esto genera la carpeta `dist/` lista para deploy

### 4.2 - Opciones de Hosting

**Opción A: Azure Static Web Apps**
```
Conecta tu repo Git con Azure
Azure construye automáticamente
Deploy: npm run build → dist/
```

**Opción B: SharePoint Pages**
```
Carga el index.html y assets en SharePoint
Crea una Web Part personalizada
Embebe la aplicación
```

**Opción C: GitHub Pages**
```
git add dist/
git commit -m "build: Production build v1.0.0"
git push origin main
```

### 4.3 - Configuración CORS

En Power Automate o tu hosting, asegúrate de:

```
CORS Headers:
Access-Control-Allow-Origin: https://tu-dominio.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

---

## 📊 FASE 5: Power BI (Post-Implementación)

### 5.1 - Conectar SharePoint

1. Abre **Power BI Desktop**
2. **Get Data** → **SharePoint**
3. Ingresa URL del sitio
4. Selecciona las 5 listas

### 5.2 - Crear Relaciones

En Power BI Model view:

```
Reportes Diarios (ID) ──── Recepciones (IdReportePadre)
Reportes Diarios (ID) ──── Químicos (IdReportePadre)
Reportes Diarios (ID) ──── Piscinas (IdReportePadre)
Reportes Diarios (ID) ──── Evacuación (IdReportePadre)
```

### 5.3 - Crear Visualizaciones

- **Total Reportes:** Card visual con COUNT de Reportes Diarios
- **Consumo por Producto:** Stacked bar chart (Químicos Consumidos)
- **Niveles Piscinas:** Gauge charts (6 gauges, uno por piscina)
- **Tasas Aprobación:** Pie chart (EstadoAprobacion)

---

## 🔐 Seguridad en Producción

### Checklist Pre-Launch

- [ ] HTTPS enforced en hosting
- [ ] CORS headers configurados correctamente
- [ ] Power Automate flow con seguridad de acceso
- [ ] SharePoint lists con permisos restringidos (solo usuarios CAMI)
- [ ] Validación de datos en backend (Power Automate)
- [ ] Logs/auditoría habilitados en SharePoint
- [ ] Backup de listas configurado
- [ ] Error handling y alerts en Power Automate

---

## 📞 Rollback Plan

Si algo falla en producción:

1. **Frontend:** Revert último commit, redeploy
2. **Power Automate:** Desactiva el flow, mantén datos en SharePoint
3. **SharePoint:** Datos están seguros, verifica integridad
4. **Comunicación:** Notifica a equipo inmediatamente

---

## 📈 Monitoring Post-Launch

### Métricas a Seguir

- Reportes creados por día
- Tasa de errores en Power Automate
- Tiempo de respuesta (frontend → webhook)
- Tasa de aprobación/rechazo
- Consumo de químicos promedio

### Alertas Recomendadas

- Flow execution failures
- SharePoint quota exceeded
- High error rates en logs

---

## ✅ Milestones de Implementación

| Fase | Duración | Responsable | Status |
|------|----------|-------------|--------|
| SharePoint Lists Setup | 2-3h | Admin | ⏳ |
| Power Automate Flow | 3-4h | Dev | ⏳ |
| Frontend Integration | 1h | Dev | ⏳ |
| E2E Testing | 2h | QA | ⏳ |
| Power BI Setup | 2h | Analytics | ⏳ |
| Production Deploy | 1h | DevOps | ⏳ |
| **TOTAL** | **11-13h** | — | — |

---

**Documento Versión:** 1.0  
**Última Actualización:** Noviembre 20, 2025  
**Estado:** Listo para implementación
