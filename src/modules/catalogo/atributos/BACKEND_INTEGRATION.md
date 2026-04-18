# Guía de Integración Backend - Módulo Atributos

## Descripción General

El módulo Atributos está completamente preparado para integración con un backend REST API. Actualmente utiliza datos mock, pero la arquitectura permite cambiar a HTTP calls con mínimos cambios.

---

## Estructura de Datos

### Objeto Atributo (Modelo)

```javascript
{
  id: number,                    // PK en base de datos
  nombre: string,                // Ej: "Talla", "Color"
  tipo: 'select' | 'text' | 'number',  // Tipo de dato
  valores: string,               // Valores separados por comas, sin espacios
                                // Ej: "XS,S,M,L,XL,XXL"
  activo: boolean,               // Estado del atributo (visible/usado en sistema)
  createdAt: ISO8601_timestamp,  // Fecha de creación (YYYY-MM-DDTHH:mm:ssZ)
  updatedAt: ISO8601_timestamp   // Fecha de última actualización
}
```

### Ejemplo de Atributo Completo

```json
{
  "id": 1,
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": true,
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T15:30:00Z"
}
```

---

## Endpoints REST

### 1. Obtener Todos los Atributos

```
GET /api/atributos
```

**Descripción**: Obtiene la lista completa de atributos.

**Parámetros Query** (Opcionales):
- `activos_solo=true` - Retorna solo atributos activos
- `search=keyword` - Busca por nombre
- `limit=10` - Limita cantidad de resultados
- `offset=0` - Paginación

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "nombre": "Talla",
    "tipo": "select",
    "valores": "XS,S,M,L,XL,XXL",
    "activo": true,
    "createdAt": "2026-04-11T10:00:00Z",
    "updatedAt": "2026-04-11T10:00:00Z"
  },
  {
    "id": 2,
    "nombre": "Color",
    "tipo": "select",
    "valores": "Negro,Blanco,Gris,Azul,Rojo,Verde",
    "activo": true,
    "createdAt": "2026-04-11T10:00:00Z",
    "updatedAt": "2026-04-11T10:00:00Z"
  }
]
```

**Error (500)**:
```json
{
  "message": "Error al obtener atributos",
  "code": "FETCH_ERROR"
}
```

---

### 2. Crear Nuevo Atributo

```
POST /api/atributos
Content-Type: application/json
```

**Descripción**: Crea un nuevo atributo en la base de datos.

**Request Body**:
```json
{
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": true
}
```

**Response (201 Created)**:
```json
{
  "id": 1,
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": true,
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T10:00:00Z"
}
```

**Error (400 Bad Request)**:
```json
{
  "message": "Nombre de atributo es requerido",
  "code": "VALIDATION_ERROR",
  "validationErrors": {
    "nombre": "requerido"
  }
}
```

**Error (409 Conflict)**:
```json
{
  "message": "Ya existe un atributo con ese nombre",
  "code": "DUPLICATE_NAME"
}
```

---

### 3. Actualizar Atributo (Completo)

```
PUT /api/atributos/:id
Content-Type: application/json
```

**Descripción**: Actualiza todos los campos de un atributo existente.

**URL Parameters**:
- `id` (required) - ID del atributo a actualizar

**Request Body**:
```json
{
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": true
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": true,
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T15:30:00Z"
}
```

**Error (404 Not Found)**:
```json
{
  "message": "Atributo no encontrado",
  "code": "NOT_FOUND"
}
```

---

### 4. Actualización Parcial - Valores

```
PATCH /api/atributos/:id/valores
Content-Type: application/json
```

**Descripción**: Actualiza SOLO el campo `valores` (optimizado para inline edit en tabla).

**URL Parameters**:
- `id` (required) - ID del atributo

**Request Body**:
```json
{
  "valores": "XS,S,M,L,XL,XXL,XXXL"
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL,XXXL",
  "activo": true,
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T15:35:00Z"
}
```

---

### 5. Actualización Parcial - Estado

```
PATCH /api/atributos/:id/estado
Content-Type: application/json
```

**Descripción**: Actualiza SOLO el campo `activo` (optimizado para toggle en tabla).

**URL Parameters**:
- `id` (required) - ID del atributo

**Request Body**:
```json
{
  "activo": false
}
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "nombre": "Talla",
  "tipo": "select",
  "valores": "XS,S,M,L,XL,XXL",
  "activo": false,
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T15:40:00Z"
}
```

---

### 6. Eliminar Atributo

```
DELETE /api/atributos/:id
```

**Descripción**: Elimina un atributo permanentemente.

**URL Parameters**:
- `id` (required) - ID del atributo a eliminar

**Query Parameters** (Opcional):
- `force=true` - Fuerza eliminación incluso si está en uso

**Response (204 No Content)**: (Vacío)

**Response (200 OK)** (Alternativa):
```json
{
  "message": "Atributo eliminado",
  "id": 1
}
```

**Error (404 Not Found)**:
```json
{
  "message": "Atributo no encontrado",
  "code": "NOT_FOUND"
}
```

**Error (409 Conflict)** (Si está en uso sin `force=true`):
```json
{
  "message": "No se puede eliminar. Este atributo está en uso en 5 productos",
  "code": "IN_USE",
  "usageCount": 5
}
```

---

## Flujo de Integración

### Paso 1: Instalar Axios (si no está instalado)

```bash
npm install axios
```

### Paso 2: Actualizar Archivo de Servicio

**Archivo**: `src/modules/catalogo/atributos/services/attributesService.js`

En este archivo, descomentar las líneas marcadas con `// VERSIÓN BACKEND` y comentar las líneas de mock.

Ejemplo:

```javascript
// ANTES (Mock):
export const fetchAttributes = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return ATTRIBUTES_MOCK;
};

// DESPUÉS (Backend):
export const fetchAttributes = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/atributos`);
  return response.data;
};
```

### Paso 3: Configurar URL del API

Crear archivo `.env` en la raíz del proyecto:

```env
REACT_APP_API_URL=http://localhost:3001
```

O actualizar en `attributesService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### Paso 4: Manejo de Errores

El servicio ya incluye manejo de errores. Los errores mostrarán `error.response?.data?.message`.

Asegúrate que el backend retorna errores en este formato:

```json
{
  "message": "Descripción del error",
  "code": "ERROR_CODE"
}
```

---

## Flujo de Datos (Arquitectura)

```
Component (index.jsx)
    ↓
    ├─→ handleUpdateValores() | handleToggleActivo() | handleDelete()
    │
Hook (useAttributes.js)
    ↓
    ├─→ saveAttribute() | deleteAttribute()
    │
Service (attributesService.js)
    ↓
    ├─→ axios.get/post/put/patch/delete("/api/atributos/...")
    │
Backend REST API
    ↓
    ├─→ Database
```

---

## Consideraciones de Desarrollo

### Base de Datos

La tabla `atributos` debe tener al menos estos campos:

```sql
CREATE TABLE atributos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  tipo ENUM('select', 'text', 'number') NOT NULL DEFAULT 'select',
  valores LONGTEXT NOT NULL,  -- JSON o valores separados por comas
  activo BOOLEAN NOT NULL DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_nombre (nombre),
  INDEX idx_activo (activo)
);
```

### Validaciones Backend Recomendadas

1. **Nombre**:
   - No vacío
   - Máximo 100 caracteres
   - Único en la base de datos

2. **Tipo**:
   - Solo valores permitidos: 'select', 'text', 'number'

3. **Valores**:
   - No vacío
   - Mínimo 1 valor
   - Máximo 200 caracteres
   - Sin espacios al inicio/final de cada valor

4. **Activo**:
   - Boolean (true/false)

### Performance

- La tabla debe tener índices en: `nombre`, `activo`
- Considerar caching para listados frecuentes
- Los updates parciales (`PATCH`) son más eficientes que `PUT`

### Seguridad

- Validar que `activo` sea boolean en el backend
- Sanitizar `nombre` y `valores` para prevenir inyecciones
- Verificar que no haya caracteres especiales en `valores`
- Implementar autenticación en todos los endpoints

---

## Testing

### Test con cURL (Backend)

```bash
# Obtener todos
curl -X GET http://localhost:3001/api/atributos

# Crear
curl -X POST http://localhost:3001/api/atributos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Talla","tipo":"select","valores":"S,M,L,XL","activo":true}'

# Actualizar
curl -X PUT http://localhost:3001/api/atributos/1 \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Talla","tipo":"select","valores":"XS,S,M,L,XL,XXL","activo":true}'

# Actualizar valores
curl -X PATCH http://localhost:3001/api/atributos/1/valores \
  -H "Content-Type: application/json" \
  -d '{"valores":"XS,S,M,L,XL"}'

# Eliminar
curl -X DELETE http://localhost:3001/api/atributos/1
```

---

## Checklist para Backend Implementation

- [ ] Crear tabla `atributos` en database
- [ ] Crear modelo/schema en backend
- [ ] Implementar 6 endpoints REST (GET, POST, PUT, PATCH, DELETE)
- [ ] Añadir validaciones en backend
- [ ] Implementar autenticación/autorización
- [ ] Configurar CORS (si está en dominio diferente)
- [ ] Documentar endpoints con Swagger/OpenAPI
- [ ] Testear con cURL o Postman
- [ ] Descomentar código de axios en `attributesService.js`
- [ ] Configurar `.env` con URL del API
- [ ] Testear integración frontend-backend completa

---

## Próximos Módulos con Misma Estructura

Esta estructura es reutilizable para otros módulos:

- **Categorías** (`src/modules/catalogo/categorias/`)
- **Productos** (`src/modules/catalogo/productos/`)
- **Ofertas** (`src/modules/catalogo/ofertas/`)

Todos siguen el mismo patrón:
```
module/
├── services/
├── hooks/
├── mocks/
├── components/
└── pages/
```

---

## Soporte y Debugging

### Error Common: CORS

Si ves error de CORS en consola del navegador:

1. Asegúrate que backend responde con headers:
   ```
   Access-Control-Allow-Origin: http://localhost:3000
   Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
   ```

2. O actualiza `API_BASE_URL` a URL con mismo dominio

### Error Common: 404 en API

Verifica que:
- URL en `.env` es correcta
- Backend está corriendo
- Endpoints naming es exacto (`/api/atributos` no `/api/atributo`)

### Testing Frontend con Mocks

Mientras desarrollas el backend, simplemente no descomentas las líneas de axios.
Todo seguirá funcionando con mocks.

---

## Documentación de Referencia

- [React Hooks](https://react.dev/reference/react/hooks)
- [Axios Documentation](https://axios-http.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc9110.html#status.codes)
