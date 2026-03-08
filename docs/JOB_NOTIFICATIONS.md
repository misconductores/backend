# Sistema de Notificaciones de Vacantes

## Descripción General

Cuando una empresa publica una nueva vacante de empleo, el sistema automáticamente notifica a los conductores que cumplen con los requisitos del trabajo.

## Funcionamiento

### 1. Creación de Vacante

Cuando una empresa crea una vacante mediante `POST /api/jobs/create`, el sistema:

1. Crea el trabajo en la base de datos
2. Automáticamente busca conductores elegibles
3. Crea notificaciones en la base de datos para cada conductor elegible
4. (Opcional) Envía emails a los conductores notificados

### 2. Criterios de Elegibilidad

Los conductores deben cumplir TODOS estos requisitos base:

- ✅ `role: 'driver'` - Ser conductor
- ✅ `isVerified: true` - Estar verificado
- ✅ `driverStatus: 'available' o 'availableSoon'` - Estar disponible

Además, deben cumplir con los requisitos específicos del trabajo:

#### Licencias (CRÍTICO)
El conductor debe tener al menos UNA de las licencias requeridas:
- Si el trabajo requiere licencias federales tipo A o B, el conductor debe tener al menos una
- Si el trabajo requiere licencias estatales tipo C, el conductor debe tenerla
- Puede cumplir con federal O estatal (no necesita ambas)

#### Tipo de Vehículo (IMPORTANTE)
- Debe coincidir exactamente: `job.vehicleType === driver.vehicleType`

#### Equipo Manejado (IMPORTANTE - solo para fifthWheeler)
- Si el trabajo es para `fifthWheeler`, el conductor debe manejar al menos uno de los equipos requeridos
- Ejemplo: Si el trabajo requiere `['dryBox', 'refrigerated']`, el conductor debe manejar al menos uno

#### Experiencia (MODERADO)
- El conductor debe tener el nivel de experiencia requerido
- Ejemplo: Si el trabajo requiere `['intermediate', 'advance']`, el conductor debe tener experiencia intermedia o avanzada

#### Ubicación (OPCIONAL)
- Se prioriza a conductores en la misma ciudad (`job.city === driver.city`)
- Esto mejora la relevancia geográfica

## Endpoints

### POST /api/jobs/create
Crea una nueva vacante y notifica automáticamente a conductores elegibles.

**Request Body:**
```json
{
  "title": "Conductor de Quinta Rueda",
  "experience": ["intermediate", "advance"],
  "vehicleType": "fifthWheeler",
  "handledEquipment": ["dryBox", "refrigerated"],
  "stateLicenseTypes": ["A"],
  "federalLicenseTypes": ["A", "B"],
  "city": "Monterrey",
  "postalCode": "64000",
  "description": "Descripción del trabajo...",
  "responsibility": "Responsabilidades..."
}
```

**Response:**
```json
{
  "message": "Job created successfully",
  "statusCode": 201,
  "body": {
    "job": { ... }
  }
}
```

**Nota:** Las notificaciones se envían de forma asíncrona. El endpoint responde inmediatamente después de crear el trabajo.

### POST /api/jobs/eligible-drivers-count
Obtiene el número de conductores que recibirían la notificación SIN crear el trabajo ni enviar notificaciones.

**Útil para:** Preview antes de publicar la vacante.

**Request Body:** Mismo formato que `/create`

**Response:**
```json
{
  "message": "Eligible drivers count retrieved successfully",
  "statusCode": 200,
  "body": {
    "eligibleCount": 15
  }
}
```

## Tipo de Notificación

Las notificaciones se crean con el tipo `new_job_posted`:

```javascript
{
  userId: driver._id,           // ID del conductor que recibe la notificación
  relatedUserId: job.companyId, // ID de la empresa que publicó
  type: 'new_job_posted',
  isRead: false
}
```

## Logs

El sistema registra en consola el resultado de las notificaciones:

```
Job 507f1f77bcf86cd799439011 created. Notified 12 of 15 eligible drivers.
```

Esto indica:
- ID del trabajo creado
- Cantidad de conductores notificados exitosamente
- Cantidad total de conductores elegibles encontrados

## Configuración de Email (Opcional)

Para habilitar notificaciones por email:

1. Crear un template en SendGrid con las siguientes variables dinámicas:
   - `driverName` - Nombre completo del conductor
   - `jobTitle` - Título del trabajo
   - `companyName` - Nombre de la empresa
   - `city` - Ciudad del trabajo
   - `vehicleType` - Tipo de vehículo
   - `experience` - Experiencia requerida
   - `jobUrl` - URL para ver el trabajo

2. Actualizar el `templateId` en `utils/email/processes/newJobPosted.js`

3. Modificar `services/jobNotificationServices.js` para llamar a la función de email:

```javascript
// Después de crear las notificaciones
const emailPromises = eligibleDrivers.map((driver) =>
  sendNewJobPostedEmail({
    driver,
    job,
    company: await UsersModel.findById(job.companyId)
  })
);
await Promise.allSettled(emailPromises);
```

## Consideraciones de Rendimiento

- Las notificaciones se crean usando `Promise.allSettled()` para procesar múltiples conductores en paralelo
- El proceso de notificación NO bloquea la respuesta del endpoint
- Si hay un error en las notificaciones, el trabajo se crea de todas formas
- Los errores se registran en consola pero no afectan la creación del trabajo

## Estados de Conductor Excluidos

Los siguientes conductores NO reciben notificaciones:

- ❌ `driverStatus: 'connected'` - Ya tienen trabajo activo
- ❌ `driverStatus: 'waitingDecision'` - Están en proceso con otra empresa
- ❌ `driverStatus: 'underInspection'` - Están bloqueados/bajo revisión
- ❌ `isVerified: false` - No han completado su verificación

## Ejemplo de Flujo Completo

1. Empresa crea vacante para conductor de quinta rueda con licencia federal tipo A
2. Sistema busca conductores con:
   - Verificados y disponibles
   - Licencia federal tipo A
   - Vehículo tipo fifthWheeler
   - Experiencia intermedia o avanzada
   - En la ciudad de Monterrey
3. Encuentra 15 conductores elegibles
4. Crea 15 notificaciones en la base de datos
5. (Opcional) Envía 15 emails
6. Registra: "Notified 15 of 15 eligible drivers"
7. Los conductores ven la notificación en su panel

## Testing

Para probar el sistema:

1. Crear conductores de prueba con diferentes perfiles
2. Usar el endpoint `/eligible-drivers-count` para verificar el matching
3. Crear una vacante y verificar las notificaciones en la base de datos
4. Revisar los logs de consola para confirmar el proceso

## Troubleshooting

**Problema:** No se notifica a ningún conductor
- Verificar que existan conductores con `isVerified: true` y `driverStatus: 'available'`
- Revisar que los requisitos del trabajo no sean demasiado restrictivos
- Usar `/eligible-drivers-count` para debug

**Problema:** Se notifican conductores incorrectos
- Revisar la lógica de matching en `services/jobNotificationServices.js`
- Verificar los datos de los conductores en la base de datos

**Problema:** Errores en los logs
- Revisar la conexión a la base de datos
- Verificar que el modelo de notificaciones esté correctamente configurado
