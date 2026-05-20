# Módulo Transportes - Venta Online

Este módulo maneja la gestión de transportistas y servicios de envío para la plataforma de venta online.

## Estructura

```
transportes/
├── components/          # Componentes reutilizables
│   └── TransporteForm.jsx    # Formulario para crear/editar transportistas
├── hooks/               # Hooks personalizados
│   └── useTransportes.js     # Lógica de estado y operaciones CRUD
├── pages/               # Páginas principales
│   └── TransportesPage.jsx   # Página principal del catálogo
├── services/            # Servicios de datos
│   └── transportesService.js # API mock para transportistas
└── index.js             # Exportaciones del módulo
```

## Funcionalidades

### Catálogo de Transportistas
- **Listado**: Visualización de todos los transportistas registrados
- **Búsqueda**: Filtrado por nombre, descripción o servicio
- **Estados**: Activo/Inactivo para control de disponibilidad

### Gestión de Atributos
- **Atributos dinámicos**: Cada transportista puede tener atributos personalizados
- **Formulario intuitivo**: Campos individuales para cada atributo
- **Agregar/Eliminar**: Gestión flexible de atributos por transportista

### Operaciones CRUD
- **Crear**: Nuevo transportista con formulario modal
- **Editar**: Modificación de datos existentes
- **Eliminar**: Confirmación antes de eliminación
- **Validación**: Campos requeridos y formato de datos

## API del Servicio

### `getTransportes()`
Obtiene todos los transportistas.

### `createTransporte(data)`
Crea un nuevo transportista.

### `updateTransporte(id, data)`
Actualiza un transportista existente.

### `deleteTransporte(id)`
Elimina un transportista.

### `searchTransportes(term)`
Busca transportistas por término.

## Hook `useTransportes`

Hook personalizado que encapsula toda la lógica de estado:

```javascript
const {
  transportes,        // Array de transportistas
  loading,           // Estado de carga
  searchTerm,        // Término de búsqueda actual
  handleCreate,      // Función para crear
  handleUpdate,      // Función para actualizar
  handleDelete,      // Función para eliminar
  handleSearch,      // Función para buscar
  clearSearch,       // Función para limpiar búsqueda
  isEmpty,          // Si no hay transportistas
  totalCount        // Conteo total
} = useTransportes();
```

## Integración

El módulo está integrado en el menú lateral de "Venta Online" como una subsección independiente, permitiendo gestión centralizada de transportistas sin interferir con el flujo de TPV.