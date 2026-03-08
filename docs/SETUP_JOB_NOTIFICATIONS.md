# Configuración del Sistema de Notificaciones de Vacantes

## Archivos Modificados/Creados

### Archivos Nuevos
1. `services/jobNotificationServices.js` - Servicio principal de notificaciones
2. `utils/email/processes/newJobPosted.js` - Template de email (opcional)
3. `docs/JOB_NOTIFICATIONS.md` - Documentación completa
4. `docs/SETUP_JOB_NOTIFICATIONS.md` - Este archivo
5. `__tests__/services/jobNotificationServices.test.js` - Tests unitarios

### Archivos Modificados
1. `constants/usersConstants.js` - Agregado tipo de notificación `new_job_posted`
2. `services/index.js` - Exportado `JobNotificationServices`
3. `controllers/jobsController.js` - Integrado sistema de notificaciones en `createJob`
4. `routes/jobsRoute.js` - Agregado endpoint `/eligible-drivers-count`
5. `factories/responses/jobs.js` - Agregada respuesta para el nuevo endpoint
6. `utils/email/processes/index.js` - Exportada función de email

## Instalación

No se requiere instalación adicional. El sistema usa las dependencias existentes.

## Configuración

### 1. Base de Datos

El sistema usa el modelo de notificaciones existente. Asegúrate de que el tipo `new_job_posted` esté incluido en los enums:

```javascript
// Ya está configurado en constants/usersConstants.js
notificationTypes: {
  // ...
  new_job_posted: {
    value: 'new_job_posted',
  },
}
```

### 2. Email (Opcional)

Si deseas enviar notificaciones por email:

#### Paso 1: Crear Template en SendGrid

1. Accede a tu cuenta de SendGrid
2. Ve a Email API > Dynamic Templates
3. Crea un nuevo template con el nombre "Nueva Vacante Publicada"
4. Diseña el template usando estas variables dinámicas:

```handlebars
{{driverName}} - Nombre completo del conductor
{{jobTitle}} - Título del trabajo
{{companyName}} - Nombre de la empresa
{{city}} - Ciudad del trabajo
{{vehicleType}} - Tipo de vehículo
{{experience}} - Experiencia requerida
{{jobUrl}} - URL para ver el trabajo
```

Ejemplo de contenido:

```html
<h2>¡Nueva Vacante Disponible!</h2>
<p>Hola {{driverName}},</p>
<p>Hay una nueva vacante que coincide con tu perfil:</p>
<ul>
  <li><strong>Puesto:</strong> {{jobTitle}}</li>
  <li><strong>Empresa:</strong> {{companyName}}</li>
  <li><strong>Ubicación:</strong> {{city}}</li>
  <li><strong>Vehículo:</strong> {{vehicleType}}</li>
  <li><strong>Experiencia:</strong> {{experience}}</li>
</ul>
<a href="{{jobUrl}}">Ver Vacante</a>
```

#### Paso 2: Configurar Template ID

1. Copia el Template ID de SendGrid (formato: `d-XXXXXXXXXXXXXXXXXXXXXXXX`)
2. Actualiza el archivo `utils/email/processes/newJobPosted.js`:

```javascript
const templateId = 'd-TU_TEMPLATE_ID_AQUI';
```

#### Paso 3: Habilitar Envío de Emails

Modifica `services/jobNotificationServices.js` en el método `notifyDriversAboutNewJob`:

```javascript
// Después de crear las notificaciones (línea ~95)
const {newJobPosted} = require('../utils/email/processes');
const UsersModel = require('../models/UsersModel');

// Obtener información de la empresa
const company = await UsersModel.findById(job.companyId).select('companyName email');

// Enviar emails a conductores elegibles
const emailPromises = eligibleDrivers.map(async (driver) => {
  const fullDriver = await UsersModel.findById(driver._id).select('firstName lastName email');
  return newJobPosted({
    driver: fullDriver,
    job,
    company,
  });
});

await Promise.allSettled(emailPromises);
```

## Uso

### Crear Vacante con Notificaciones Automáticas

```bash
POST /api/jobs/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Conductor de Quinta Rueda",
  "experience": ["intermediate", "advance"],
  "vehicleType": "fifthWheeler",
  "handledEquipment": ["dryBox", "refrigerated"],
  "stateLicenseTypes": ["A"],
  "federalLicenseTypes": ["A", "B"],
  "city": "Monterrey",
  "postalCode": "64000",
  "description": "Buscamos conductor experimentado...",
  "responsibility": "Transporte de carga seca y refrigerada..."
}
```

**Respuesta:**
```json
{
  "message": "Job created successfully",
  "statusCode": 201,
  "body": {
    "job": { ... }
  }
}
```

**Logs en consola:**
```
Job 507f1f77bcf86cd799439011 created. Notified 12 of 15 eligible drivers.
```

### Preview de Conductores Elegibles

Antes de publicar, puedes ver cuántos conductores recibirían la notificación:

```bash
POST /api/jobs/eligible-drivers-count
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Conductor de Quinta Rueda",
  "experience": ["intermediate", "advance"],
  "vehicleType": "fifthWheeler",
  "handledEquipment": ["dryBox"],
  "federalLicenseTypes": ["A"],
  "city": "Monterrey",
  "postalCode": "64000",
  "description": "...",
  "responsibility": "..."
}
```

**Respuesta:**
```json
{
  "message": "Eligible drivers count retrieved successfully",
  "statusCode": 200,
  "body": {
    "eligibleCount": 15
  }
}
```

## Testing

### Ejecutar Tests Unitarios

```bash
npm test -- __tests__/services/jobNotificationServices.test.js
```

### Test Manual

1. **Crear conductores de prueba:**

```javascript
// Conductor elegible
{
  role: 'driver',
  isVerified: true,
  driverStatus: 'available',
  vehicleType: 'fifthWheeler',
  handleEquipment: ['dryBox'],
  experience: 'intermediate',
  city: 'Monterrey',
  federalLicenses: [{
    federalLicenseType: 'A',
    federalLicenseNo: '123456',
    expiryDate: '2025-12-31'
  }]
}

// Conductor NO elegible (no verificado)
{
  role: 'driver',
  isVerified: false,
  driverStatus: 'available',
  vehicleType: 'fifthWheeler',
  // ...
}
```

2. **Crear vacante:**

```bash
POST /api/jobs/create
# Con los datos de la vacante
```

3. **Verificar notificaciones:**

```javascript
// En MongoDB
db.notifications.find({
  type: 'new_job_posted',
  userId: ObjectId('ID_DEL_CONDUCTOR')
})
```

4. **Verificar logs:**

Busca en la consola del servidor:
```
Job 507f... created. Notified X of Y eligible drivers.
```

## Troubleshooting

### No se crean notificaciones

**Problema:** El trabajo se crea pero no se notifica a nadie.

**Solución:**
1. Verifica que existan conductores con `isVerified: true` y `driverStatus: 'available'`
2. Usa el endpoint `/eligible-drivers-count` para debug
3. Revisa los logs de consola para ver errores

```bash
# Verificar conductores disponibles
db.users.find({
  role: 'driver',
  isVerified: true,
  driverStatus: { $in: ['available', 'availableSoon'] }
}).count()
```

### Conductores incorrectos reciben notificaciones

**Problema:** Se notifica a conductores que no cumplen los requisitos.

**Solución:**
1. Revisa la lógica de matching en `services/jobNotificationServices.js`
2. Verifica los datos de los conductores en la base de datos
3. Ejecuta los tests unitarios

### Errores en los logs

**Problema:** Aparecen errores en la consola al crear trabajos.

**Solución:**
1. Verifica la conexión a MongoDB
2. Asegúrate de que el modelo de notificaciones esté correctamente configurado
3. Revisa que el tipo `new_job_posted` esté en los enums del modelo

```javascript
// Verificar en models/NotificationsModel.js
const notificationTypeEnums = Object.values(notificationTypes).map(
  (type) => type.value
);
// Debe incluir 'new_job_posted'
```

## Monitoreo

### Logs Importantes

El sistema registra información útil en consola:

```javascript
// Éxito
Job 507f1f77bcf86cd799439011 created. Notified 12 of 15 eligible drivers.

// Error en notificaciones
Error notifying drivers about new job: [Error details]

// Error en proceso de notificación
Error in notification process: [Error details]
```

### Métricas Recomendadas

Considera monitorear:
- Cantidad de notificaciones enviadas por trabajo
- Tasa de éxito de notificaciones
- Tiempo de procesamiento
- Conductores elegibles vs notificados

## Personalización

### Ajustar Criterios de Matching

Edita `services/jobNotificationServices.js` para modificar los criterios:

```javascript
// Ejemplo: Hacer la ubicación obligatoria
if (job.city) {
  query.city = job.city; // Ya existe
} else {
  // No notificar si no hay ciudad
  return {success: true, notifiedCount: 0, totalEligible: 0};
}

// Ejemplo: Agregar filtro de edad
if (job.minAge) {
  // Calcular edad y filtrar
}
```

### Agregar Notificaciones Push

Si tienes un sistema de notificaciones push (Firebase, OneSignal, etc.):

```javascript
// En services/jobNotificationServices.js
const pushNotificationPromises = eligibleDrivers.map((driver) =>
  sendPushNotification({
    userId: driver._id,
    title: 'Nueva Vacante Disponible',
    body: `${job.title} en ${job.city}`,
    data: {jobId: job._id}
  })
);

await Promise.allSettled(pushNotificationPromises);
```

## Rollback

Si necesitas desactivar el sistema temporalmente:

1. Comenta la llamada en `controllers/jobsController.js`:

```javascript
// JobNotificationServices.notifyDriversAboutNewJob({job})
//   .then(...)
//   .catch(...);
```

2. O crea una variable de entorno:

```javascript
if (process.env.ENABLE_JOB_NOTIFICATIONS === 'true') {
  JobNotificationServices.notifyDriversAboutNewJob({job})
    .then(...)
    .catch(...);
}
```

## Soporte

Para más información, consulta:
- `docs/JOB_NOTIFICATIONS.md` - Documentación completa
- `services/jobNotificationServices.js` - Código fuente con comentarios
- `__tests__/services/jobNotificationServices.test.js` - Ejemplos de uso
