# ✅ Traducciones de Emails en Español

## Resumen

Los emails de notificación de vacantes se envían completamente en español usando el sistema de traducciones del backend.

## Archivo de Traducciones

**Ubicación:** `utils/translations/jobTranslations.js`

### Traducciones Implementadas

#### Tipos de Vehículo
```javascript
fifthWheeler → "Quinta Rueda"
BoxTruck → "Camión de Caja"
car → "Automóvil"
motorcycle → "Motocicleta"
```

#### Niveles de Experiencia
```javascript
student → "Estudiante"
beginner → "Principiante"
intermediate → "Intermedio"
advance → "Avanzado"
```

#### Tipos de Equipo
```javascript
dryBox → "Caja Seca"
specialized → "Especializado (Hazmat, Tanque, entre otros)"
refrigerated → "Refrigerado"
platform → "Plataforma"
others → "Otros"
```

#### Tipos de Licencia
```javascript
A → "Tipo A"
B → "Tipo B"
C → "Tipo C"
D → "Tipo D"
E → "Tipo E"
```

## Ejemplo de Email

### Datos en el Backend (inglés)
```javascript
{
  vehicleType: "fifthWheeler",
  experience: ["intermediate", "advance"],
  handledEquipment: ["dryBox", "refrigerated"],
  federalLicenseTypes: ["A", "B"]
}
```

### Datos en el Email (español)
```
🚛 Tipo de unidad: Quinta Rueda
🧰 Experiencia requerida: Intermedio, Avanzado
🔧 Equipo manejado: Caja Seca, Refrigerado
📋 Licencias federales: Tipo A, Tipo B
```

## Variables del Template SendGrid

El template recibe estas variables ya traducidas:

```javascript
{
  driverName: "Juan Pérez",
  jobTitle: "Conductor de Quinta Rueda",
  companyName: "Transportes ABC",
  city: "Monterrey",
  vehicleType: "Quinta Rueda",              // ✅ Traducido
  experience: "Intermedio, Avanzado",       // ✅ Traducido
  handledEquipment: "Caja Seca, Refrigerado", // ✅ Traducido
  federalLicenseTypes: "Tipo A, Tipo B",   // ✅ Traducido
  stateLicenseTypes: "Tipo C",             // ✅ Traducido
  jobUrl: "https://app.com/jobs/123"
}
```

## Uso en el Código

### Importar Traducciones
```javascript
const {translateJobForEmail} = require('../../translations/jobTranslations');
```

### Traducir Datos del Trabajo
```javascript
// Datos originales del trabajo
const job = {
  vehicleType: 'fifthWheeler',
  experience: ['intermediate', 'advance'],
  handledEquipment: ['dryBox', 'refrigerated'],
  // ...
};

// Traducir al español
const translatedJob = translateJobForEmail(job);

// Resultado
{
  vehicleType: 'Quinta Rueda',
  experience: 'Intermedio, Avanzado',
  handledEquipment: 'Caja Seca, Refrigerado',
  // ...
}
```

## Funciones Disponibles

### `translateJobForEmail(job)`
Traduce todos los campos de un trabajo al español.

**Parámetros:**
- `job` (Object) - Objeto del trabajo con datos en inglés

**Retorna:**
- Object con todos los campos traducidos al español

### `translateVehicleType(vehicleType)`
Traduce un tipo de vehículo individual.

### `translateExperience(experiences)`
Traduce un array de experiencias y las une con comas.

### `translateEquipment(equipment)`
Traduce un array de equipos y los une con comas.

### `translateLicenses(licenses)`
Traduce un array de licencias y las une con comas.

## Manejo de Valores Faltantes

Si un valor no tiene traducción o es `null`/`undefined`:

```javascript
translateVehicleType('unknown') → 'unknown' (devuelve el original)
translateExperience(null) → 'No especificada'
translateEquipment([]) → 'No especificado'
translateLicenses(undefined) → 'No especificadas'
```

## Agregar Nuevas Traducciones

Para agregar nuevas traducciones, edita `utils/translations/jobTranslations.js`:

```javascript
const vehicleTypeTranslations = {
  fifthWheeler: 'Quinta Rueda',
  // Agregar nueva traducción aquí
  newVehicleType: 'Nuevo Tipo de Vehículo',
};
```

## Testing

### Test Manual
```javascript
const {translateJobForEmail} = require('./utils/translations/jobTranslations');

const job = {
  vehicleType: 'fifthWheeler',
  experience: ['intermediate'],
  handledEquipment: ['dryBox'],
  federalLicenseTypes: ['A'],
};

const translated = translateJobForEmail(job);
console.log(translated);
// {
//   vehicleType: 'Quinta Rueda',
//   experience: 'Intermedio',
//   handledEquipment: 'Caja Seca',
//   federalLicenseTypes: 'Tipo A',
//   ...
// }
```

## Integración con SendGrid

El template de SendGrid debe usar estas variables:

```handlebars
Hola {{driverName}},

Hay una nueva vacante que coincide con tu perfil:

🚛 Tipo de unidad: {{vehicleType}}
🧰 Experiencia requerida: {{experience}}
🔧 Equipo manejado: {{handledEquipment}}
📋 Licencias federales: {{federalLicenseTypes}}
📋 Licencias estatales: {{stateLicenseTypes}}
📍 Ubicación: {{city}}
🏢 Empresa: {{companyName}}

[Ver Vacante]({{jobUrl}})
```

## Sincronización con Frontend

**Nota:** Las traducciones del backend son independientes del frontend. Si se actualizan las traducciones en el frontend, deben actualizarse manualmente en el backend en el archivo `utils/translations/jobTranslations.js`.

### Proceso de Sincronización
1. Identificar cambios en traducciones del frontend
2. Actualizar `utils/translations/jobTranslations.js`
3. Probar emails con nuevas traducciones
4. Desplegar cambios

## Archivos Relacionados

- `utils/translations/jobTranslations.js` - Definiciones de traducciones
- `utils/email/processes/newJobPosted.js` - Uso de traducciones en emails
- `services/jobNotificationServices.js` - Servicio que envía notificaciones

## Estado Actual

✅ **COMPLETAMENTE FUNCIONAL**

- Traducciones en español implementadas
- Integrado con sistema de emails
- Template de SendGrid configurado
- Listo para producción

---

**Última actualización:** 2026-03-04  
**Idioma:** Español (es)  
**Estado:** ✅ Activo
