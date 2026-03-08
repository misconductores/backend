# Integración Frontend - Sistema de Notificaciones de Vacantes

## Descripción

Guía para integrar el sistema de notificaciones de vacantes en el frontend de la aplicación.

## Endpoints Disponibles

### 1. Crear Vacante con Notificaciones Automáticas

**Endpoint:** `POST /api/jobs/create`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:**
```javascript
{
  title: "Conductor de Quinta Rueda",
  experience: ["intermediate", "advance"],
  vehicleType: "fifthWheeler",
  handledEquipment: ["dryBox", "refrigerated"],
  stateLicenseTypes: ["A"],
  federalLicenseTypes: ["A", "B"],
  city: "Monterrey",
  postalCode: "64000",
  description: "Descripción detallada del trabajo...",
  responsibility: "Responsabilidades del puesto..."
}
```

**Response (201):**
```javascript
{
  message: "Job created successfully",
  statusCode: 201,
  body: {
    job: {
      _id: "507f1f77bcf86cd799439011",
      title: "Conductor de Quinta Rueda",
      vehicleType: "fifthWheeler",
      city: "Monterrey",
      // ... otros campos
    }
  }
}
```

**Nota:** Las notificaciones se envían automáticamente en segundo plano.

### 2. Preview de Conductores Elegibles

**Endpoint:** `POST /api/jobs/eligible-drivers-count`

**Headers:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

**Request Body:** (mismo formato que crear vacante)
```javascript
{
  title: "Conductor de Quinta Rueda",
  experience: ["intermediate"],
  vehicleType: "fifthWheeler",
  federalLicenseTypes: ["A"],
  city: "Monterrey",
  postalCode: "64000",
  description: "...",
  responsibility: "..."
}
```

**Response (200):**
```javascript
{
  message: "Eligible drivers count retrieved successfully",
  statusCode: 200,
  body: {
    eligibleCount: 15
  }
}
```

## Ejemplos de Integración

### React/Next.js

#### Componente: Crear Vacante con Preview

```jsx
import { useState } from 'react';
import axios from 'axios';

function CreateJobForm() {
  const [jobData, setJobData] = useState({
    title: '',
    experience: [],
    vehicleType: '',
    handledEquipment: [],
    federalLicenseTypes: [],
    stateLicenseTypes: [],
    city: '',
    postalCode: '',
    description: '',
    responsibility: ''
  });
  
  const [eligibleCount, setEligibleCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Preview de conductores elegibles
  const handlePreview = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/jobs/eligible-drivers-count',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setEligibleCount(response.data.body.eligibleCount);
      setShowPreview(true);
    } catch (error) {
      console.error('Error getting preview:', error);
      alert('Error al obtener preview de conductores');
    } finally {
      setLoading(false);
    }
  };

  // Crear vacante
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(
        '/api/jobs/create',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      alert(`Vacante creada exitosamente! Se notificará a ${eligibleCount || 'varios'} conductores.`);
      // Redirigir o limpiar formulario
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error al crear la vacante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <input
        type="text"
        placeholder="Título del trabajo"
        value={jobData.title}
        onChange={(e) => setJobData({...jobData, title: e.target.value})}
      />
      
      {/* ... más campos ... */}
      
      {/* Botón de Preview */}
      <button
        type="button"
        onClick={handlePreview}
        disabled={loading}
        className="btn-preview"
      >
        {loading ? 'Calculando...' : 'Ver Conductores Elegibles'}
      </button>
      
      {/* Mostrar preview */}
      {showPreview && (
        <div className="preview-box">
          <p>
            📊 <strong>{eligibleCount}</strong> conductores recibirán esta notificación
          </p>
          {eligibleCount === 0 && (
            <p className="warning">
              ⚠️ No hay conductores que cumplan estos requisitos. 
              Considera ajustar los filtros.
            </p>
          )}
        </div>
      )}
      
      {/* Botón de Crear */}
      <button
        type="submit"
        disabled={loading || eligibleCount === 0}
        className="btn-submit"
      >
        {loading ? 'Creando...' : 'Publicar Vacante'}
      </button>
    </form>
  );
}

export default CreateJobForm;
```

#### Hook Personalizado

```javascript
// hooks/useJobNotifications.js
import { useState } from 'react';
import axios from 'axios';

export function useJobNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEligibleCount = async (jobData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        '/api/jobs/eligible-drivers-count',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return response.data.body.eligibleCount;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createJobWithNotifications = async (jobData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        '/api/jobs/create',
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      return response.data.body.job;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getEligibleCount,
    createJobWithNotifications
  };
}
```

**Uso del Hook:**

```jsx
import { useJobNotifications } from '@/hooks/useJobNotifications';

function CreateJobPage() {
  const { loading, error, getEligibleCount, createJobWithNotifications } = useJobNotifications();
  const [eligibleCount, setEligibleCount] = useState(null);

  const handlePreview = async () => {
    try {
      const count = await getEligibleCount(jobData);
      setEligibleCount(count);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const job = await createJobWithNotifications(jobData);
      alert(`Vacante creada! ${eligibleCount} conductores notificados.`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    // ... JSX
  );
}
```

### Vue.js

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Campos del formulario -->
    <input
      v-model="jobData.title"
      type="text"
      placeholder="Título del trabajo"
    />
    
    <!-- Botón de Preview -->
    <button
      type="button"
      @click="handlePreview"
      :disabled="loading"
    >
      {{ loading ? 'Calculando...' : 'Ver Conductores Elegibles' }}
    </button>
    
    <!-- Preview -->
    <div v-if="showPreview" class="preview-box">
      <p>
        📊 <strong>{{ eligibleCount }}</strong> conductores recibirán esta notificación
      </p>
      <p v-if="eligibleCount === 0" class="warning">
        ⚠️ No hay conductores que cumplan estos requisitos.
      </p>
    </div>
    
    <!-- Botón de Crear -->
    <button
      type="submit"
      :disabled="loading || eligibleCount === 0"
    >
      {{ loading ? 'Creando...' : 'Publicar Vacante' }}
    </button>
  </form>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      jobData: {
        title: '',
        experience: [],
        vehicleType: '',
        // ... otros campos
      },
      eligibleCount: null,
      showPreview: false,
      loading: false
    };
  },
  methods: {
    async handlePreview() {
      this.loading = true;
      try {
        const response = await axios.post(
          '/api/jobs/eligible-drivers-count',
          this.jobData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        this.eligibleCount = response.data.body.eligibleCount;
        this.showPreview = true;
      } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener preview');
      } finally {
        this.loading = false;
      }
    },
    
    async handleSubmit() {
      this.loading = true;
      try {
        const response = await axios.post(
          '/api/jobs/create',
          this.jobData,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        alert(`Vacante creada! ${this.eligibleCount} conductores notificados.`);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al crear vacante');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## UI/UX Recomendaciones

### 1. Flujo de Creación de Vacante

```
1. Usuario llena formulario
   ↓
2. Click en "Ver Conductores Elegibles"
   ↓
3. Sistema muestra: "15 conductores recibirán esta notificación"
   ↓
4. Usuario ajusta requisitos si es necesario
   ↓
5. Click en "Publicar Vacante"
   ↓
6. Confirmación: "Vacante publicada! 15 conductores notificados"
```

### 2. Mensajes de Feedback

**Preview con conductores:**
```
✅ 15 conductores recibirán esta notificación
   Estos conductores cumplen con todos los requisitos.
```

**Preview sin conductores:**
```
⚠️ No hay conductores que cumplan estos requisitos
   Sugerencias:
   • Amplía el rango de experiencia
   • Considera más tipos de licencia
   • Revisa la ubicación
```

**Después de crear:**
```
✅ ¡Vacante publicada exitosamente!
   15 conductores han sido notificados y pueden aplicar ahora.
```

### 3. Componente de Preview

```jsx
function EligibleDriversPreview({ count, loading }) {
  if (loading) {
    return (
      <div className="preview-loading">
        <Spinner />
        <p>Calculando conductores elegibles...</p>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="preview-warning">
        <Icon name="warning" />
        <h4>No hay conductores elegibles</h4>
        <p>Considera ajustar los requisitos para alcanzar más conductores.</p>
        <ul>
          <li>Amplía el rango de experiencia</li>
          <li>Agrega más tipos de licencia</li>
          <li>Revisa la ubicación</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="preview-success">
      <Icon name="check-circle" />
      <h4>{count} conductores recibirán esta notificación</h4>
      <p>Estos conductores cumplen con todos los requisitos y están disponibles.</p>
    </div>
  );
}
```

## Manejo de Errores

```javascript
try {
  const response = await axios.post('/api/jobs/create', jobData);
  // Éxito
} catch (error) {
  if (error.response) {
    // Error del servidor
    switch (error.response.status) {
      case 400:
        alert('Datos inválidos. Revisa el formulario.');
        break;
      case 401:
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        // Redirigir a login
        break;
      case 403:
        alert('No tienes permisos para crear vacantes.');
        break;
      case 500:
        alert('Error del servidor. Intenta nuevamente más tarde.');
        break;
      default:
        alert('Error al crear la vacante.');
    }
  } else if (error.request) {
    // Sin respuesta del servidor
    alert('No se pudo conectar con el servidor. Verifica tu conexión.');
  } else {
    // Error en la configuración
    alert('Error inesperado. Intenta nuevamente.');
  }
}
```

## Notificaciones para Conductores

### Mostrar Notificaciones

```jsx
function NotificationsList() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const response = await axios.get('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotifications(response.data.body.data);
  };

  return (
    <div className="notifications-list">
      {notifications.map(notification => {
        if (notification.type === 'new_job_posted') {
          return (
            <NotificationCard
              key={notification._id}
              notification={notification}
            />
          );
        }
        return null;
      })}
    </div>
  );
}

function NotificationCard({ notification }) {
  const company = notification.relatedUserId;
  
  return (
    <div className="notification-card">
      <div className="notification-icon">
        <Icon name="briefcase" />
      </div>
      <div className="notification-content">
        <h4>Nueva Vacante Disponible</h4>
        <p>
          <strong>{company.companyName}</strong> publicó una vacante que coincide con tu perfil.
        </p>
        <span className="notification-time">
          {formatTime(notification.createdAt)}
        </span>
      </div>
      <button
        onClick={() => viewJob(notification)}
        className="btn-view"
      >
        Ver Vacante
      </button>
    </div>
  );
}
```

## Testing Frontend

```javascript
// tests/CreateJobForm.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateJobForm from '@/components/CreateJobForm';
import axios from 'axios';

jest.mock('axios');

describe('CreateJobForm', () => {
  it('should show eligible drivers count on preview', async () => {
    axios.post.mockResolvedValue({
      data: { body: { eligibleCount: 15 } }
    });

    render(<CreateJobForm />);
    
    const previewButton = screen.getByText('Ver Conductores Elegibles');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText(/15 conductores/)).toBeInTheDocument();
    });
  });

  it('should create job successfully', async () => {
    axios.post.mockResolvedValue({
      data: { body: { job: { _id: '123' } } }
    });

    render(<CreateJobForm />);
    
    const submitButton = screen.getByText('Publicar Vacante');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Vacante creada/)).toBeInTheDocument();
    });
  });
});
```

## Mejores Prácticas

1. **Siempre mostrar preview** antes de publicar
2. **Validar formulario** antes de enviar
3. **Manejar errores** de forma clara
4. **Mostrar feedback** al usuario
5. **Deshabilitar botones** durante carga
6. **Confirmar acción** si no hay conductores elegibles

## Recursos Adicionales

- API Reference: `/docs/API_REFERENCE.md`
- Backend Documentation: `/docs/JOB_NOTIFICATIONS.md`
- Setup Guide: `/docs/SETUP_JOB_NOTIFICATIONS.md`
