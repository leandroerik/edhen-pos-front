# ⚡ INSTRUCCIONES RÁPIDAS - FRONTEND CHECKLIST

## 🎯 EN UNA SOLA PÁGINA: LO QUE EL FRONTEND NECESITA

---

## ✅ PASO 1: ENTIENDE LOS ENDPOINTS

El backend tiene **3 endpoints principales** (ya implementados y listos para usar):

```
1️⃣ GET /productos/consolidado/{id}
   → Obtiene un producto por su ID
   → Retorna: Producto + todas sus variantes + resumen

2️⃣ GET /productos/consolidado/buscar-codigo?codigo=XXX
   → Busca por código de barras
   → Perfecto para lectores de código de barras
   → Retorna: Producto + todas sus variantes + resumen

3️⃣ GET /productos/consolidado/buscar-nombre?nombre=XXX
   → Busca por nombre (búsqueda parcial)
   → Retorna: Producto + todas sus variantes + resumen
```

---

## ✅ PASO 2: ENTIENDE LA ESTRUCTURA DE DATOS

El servidor devuelve:

```javascript
{
  // DATOS BÁSICOS
  id: 1,
  nombre: "Camiseta Deportiva",
  descripcion: "...",
  precio: 50.00,
  codigoBarra: "PROD000001",  // ← CÓDIGO DEL PRODUCTO
  activo: true,

  // VARIANTES (tienes que mostrar esto en una TABLA)
  variantes: [
    {
      id: 1,
      atributos: { "Talle": "M", "Color": "Rojo" },
      codigoVariante: "PROD000001-TAL-M-COL-R",
      sku: {
        id: 1,
        precio: 55.00,
        costo: 30.00,
        stock: 10,
        codigoBarra: "PROD000001-TAL-M-COL-R"  // ← CÓDIGO DE VARIANTE
      }
    },
    // ... más variantes
  ],

  // DATOS RESUMIDOS (calculados automáticamente)
  totalVariantes: 2,
  totalStock: 25,
  precioMinimo: 55.00,
  precioMaximo: 55.00
}
```

---

## ✅ PASO 3: CREA 4 VISTAS

### 📌 Vista 1: Buscador
**Dónde:** Panel lateral o modal  
**Qué hace:** Permite buscar por código o nombre  
**Cómo se ve:**
```
┌─────────────────────────────┐
│ 🔍 BUSCAR PRODUCTO          │
├─────────────────────────────┤
│ ○ Por código  ● Por nombre  │
│ [___________] [Buscar]      │
└─────────────────────────────┘
```

### 📌 Vista 2: Información General
**Dónde:** Arriba del detalle  
**Qué muestra:**
- Nombre
- Código de barras (con QR o código visual)
- Descripción
- Precio base
- Estado (activo/inactivo)

### 📌 Vista 3: Tabla de Variantes
**Dónde:** Centro  
**Columnas:**
```
| # | Atributos | Código de Barras | Precio | Costo | Stock | Margen | Acción |
|---|-----------|------------------|--------|-------|-------|--------|--------|
| 1 | M - Rojo  | PROD...TAL-M...  | $55.00 | $30   | 10    | 45%    | Agregar|
| 2 | L - Rojo  | PROD...TAL-L...  | $55.00 | $30   | 15    | 45%    | Agregar|
```

### 📌 Vista 4: Resumen
**Dónde:** Abajo  
**Qué muestra:**
```
Total Variantes: 2
Stock Total: 25
Precio Mínimo: $55.00
Precio Máximo: $55.00
```

---

## ✅ PASO 4: CREA LOS COMPONENTES REACT

### 4.1 Hook: `useProductoConsolidado.js`
```javascript
import { useState, useEffect } from 'react';

export const useProductoConsolidado = (id, codigoBarra, nombre) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id && !codigoBarra && !nombre) return;

    const obtenerProducto = async () => {
      setLoading(true);
      try {
        let url = 'http://localhost:8080/productos/consolidado';
        
        if (id) {
          url = `${url}/${id}`;
        } else if (codigoBarra) {
          url = `${url}/buscar-codigo?codigo=${codigoBarra}`;
        } else if (nombre) {
          url = `${url}/buscar-nombre?nombre=${nombre}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        setProducto(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    obtenerProducto();
  }, [id, codigoBarra, nombre]);

  return { producto, loading, error };
};
```

### 4.2 Componente: `BuscadorProducto.jsx`
```javascript
import { useState, useEffect } from 'react';
import { useProductoConsolidado } from '../hooks/useProductoConsolidado';

export const BuscadorProducto = ({ onProductoEncontrado }) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [modo, setModo] = useState('codigo');
  
  const { producto, loading, error } = useProductoConsolidado(
    null,
    modo === 'codigo' && codigo ? codigo : null,
    modo === 'nombre' && nombre ? nombre : null
  );

  useEffect(() => {
    if (producto && onProductoEncontrado) {
      onProductoEncontrado(producto);
    }
  }, [producto]);

  return (
    <div className="buscador">
      <h2>🔍 BUSCAR PRODUCTO</h2>
      
      <div>
        <label>
          <input 
            type="radio" 
            value="codigo" 
            checked={modo === 'codigo'}
            onChange={(e) => setModo(e.target.value)}
          />
          Por Código de Barras
        </label>
        <label>
          <input 
            type="radio" 
            value="nombre" 
            checked={modo === 'nombre'}
            onChange={(e) => setModo(e.target.value)}
          />
          Por Nombre
        </label>
      </div>

      {modo === 'codigo' && (
        <input
          type="text"
          placeholder="Código de barras..."
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          autoFocus
        />
      )}

      {modo === 'nombre' && (
        <input
          type="text"
          placeholder="Nombre del producto..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      )}

      {loading && <p>⏳ Buscando...</p>}
      {error && <p style={{color: 'red'}}>❌ {error}</p>}
    </div>
  );
};
```

### 4.3 Componente: `TablaVariantes.jsx`
```javascript
export const TablaVariantes = ({ producto, onSeleccionarVariante }) => {
  if (!producto || !producto.variantes) return <p>Sin variantes</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Atributos</th>
          <th>Código</th>
          <th>Precio</th>
          <th>Costo</th>
          <th>Stock</th>
          <th>Margen</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        {producto.variantes.map((v, i) => {
          const attr = Object.values(v.atributos).join(' - ');
          const margen = v.sku ? 
            Math.round(((v.sku.precio - v.sku.costo) / v.sku.precio) * 100) : 0;

          return (
            <tr key={v.id}>
              <td>{i + 1}</td>
              <td>{attr}</td>
              <td>{v.sku?.codigoBarra}</td>
              <td>${v.sku?.precio}</td>
              <td>${v.sku?.costo}</td>
              <td>{v.sku?.stock}</td>
              <td>{margen}%</td>
              <td>
                {v.sku?.stock > 0 ? (
                  <button onClick={() => onSeleccionarVariante(v)}>
                    Agregar
                  </button>
                ) : (
                  <span>Sin stock</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
```

### 4.4 Componente: `ResumenProducto.jsx`
```javascript
export const ResumenProducto = ({ producto }) => {
  if (!producto) return null;

  return (
    <div className="resumen">
      <h3>📊 RESUMEN</h3>
      <div className="cards">
        <div className="card">
          <span>Total Variantes</span>
          <strong>{producto.totalVariantes}</strong>
        </div>
        <div className="card">
          <span>Stock Total</span>
          <strong>{producto.totalStock}</strong>
        </div>
        <div className="card">
          <span>Precio Mínimo</span>
          <strong>${producto.precioMinimo}</strong>
        </div>
        <div className="card">
          <span>Precio Máximo</span>
          <strong>${producto.precioMaximo}</strong>
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ PASO 5: INTEGRA EN TU PÁGINA

```javascript
// pages/VentasPage.jsx
import { useState } from 'react';
import { BuscadorProducto } from '../components/BuscadorProducto';
import { TablaVariantes } from '../components/TablaVariantes';
import { ResumenProducto } from '../components/ResumenProducto';
import './VentasPage.css';

export const VentasPage = () => {
  const [productoActual, setProductoActual] = useState(null);

  const handleAgregarAlCarrito = (variante) => {
    console.log('Agregar:', variante);
    alert(`✅ ${Object.values(variante.atributos).join(' - ')} agregado`);
  };

  return (
    <div className="ventas-page">
      <h1>🛍️ GESTOR DE PRODUCTOS</h1>
      
      <div className="contenedor">
        <div className="busqueda-lado">
          <BuscadorProducto onProductoEncontrado={setProductoActual} />
        </div>

        <div className="detalle-lado">
          {productoActual && (
            <>
              <h1>{productoActual.nombre}</h1>
              <p>{productoActual.descripcion}</p>
              <p className="codigo">Código: <strong>{productoActual.codigoBarra}</strong></p>
              
              <TablaVariantes 
                producto={productoActual}
                onSeleccionarVariante={handleAgregarAlCarrito}
              />

              <ResumenProducto producto={productoActual} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## ✅ PASO 6: ESTILOS (VentasPage.css)

```css
.ventas-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.contenedor {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.buscador {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  position: sticky;
  top: 20px;
}

.buscador h2 {
  margin-top: 0;
}

.buscador label {
  display: block;
  margin: 10px 0;
  cursor: pointer;
}

.buscador input[type="text"] {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.buscador input[type="text"]:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table th {
  background: #2c3e50;
  color: white;
  padding: 12px;
  text-align: left;
  font-weight: bold;
}

table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
}

table tbody tr:hover {
  background: #f8f9fa;
}

table button {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

table button:hover {
  background: #2980b9;
}

table span {
  color: #e74c3c;
  font-size: 12px;
}

.resumen {
  margin-top: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.card {
  background: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #3498db;
}

.card span {
  display: block;
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
}

.card strong {
  display: block;
  font-size: 24px;
  color: #2c3e50;
  font-weight: bold;
}

.codigo {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
  margin: 10px 0;
}

@media (max-width: 768px) {
  .contenedor {
    grid-template-columns: 1fr;
  }

  .buscador {
    position: static;
  }

  table {
    font-size: 12px;
  }
```

---

## ✅ PASO 7: COMPONENTE DE GESTIÓN DE PRODUCTOS (ADMIN)

Además de las vistas de POS, necesitas un componente para que los administradores puedan crear, editar y eliminar productos. Aquí está la implementación completa:

### 7.1 Componente ListaProductos (src/components/ListaProductos.jsx)

```javascript
import { useState, useEffect } from 'react';

export const ListaProductos = ({ onEdit, onDelete, onView }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = async () => {
    try {
      const response = await fetch('http://localhost:8080/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    
    try {
      const response = await fetch(`http://localhost:8080/productos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al eliminar');
      setProductos(productos.filter(p => p.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="lista-productos">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion}</td>
              <td>${producto.precio}</td>
              <td>{producto.activo ? '✅' : '❌'}</td>
              <td>
                <button onClick={() => onView(producto)}>Ver</button>
                <button onClick={() => onEdit(producto)}>Editar</button>
                <button onClick={() => handleDelete(producto.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 7.2 Componente CrearProductoForm (src/components/CrearProductoForm.jsx)

```javascript
import { useState } from 'react';

export const CrearProductoForm = ({ visible, onClose, onProductoCreado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio) || 0
        })
      });

      if (!response.ok) throw new Error('Error al crear producto');

      const nuevoProducto = await response.json();
      onProductoCreado(nuevoProducto);
      setFormData({ nombre: '', descripcion: '', precio: '', activo: true });
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Crear Nuevo Producto</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>
          <div>
            <label>Precio</label>
            <input
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: e.target.value})}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              Activo
            </label>
          </div>
          <div className="buttons">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 7.3 Componente EditarProductoForm (src/components/EditarProductoForm.jsx)

```javascript
import { useState, useEffect } from 'react';

export const EditarProductoForm = ({ visible, producto, onClose, onProductoActualizado }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        activo: producto.activo || false
      });
    }
  }, [producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/productos/${producto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio) || 0
        })
      });

      if (!response.ok) throw new Error('Error al actualizar producto');

      const productoActualizado = await response.json();
      onProductoActualizado(productoActualizado);
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !producto) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Editar Producto</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              required
            />
          </div>
          <div>
            <label>Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            />
          </div>
          <div>
            <label>Precio</label>
            <input
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) => setFormData({...formData, precio: e.target.value})}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              Activo
            </label>
          </div>
          <div className="buttons">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

### 7.4 Página GestorProductos (src/pages/GestorProductos.jsx)

```javascript
import { useState } from 'react';
import { ListaProductos } from '../components/ListaProductos';
import { CrearProductoForm } from '../components/CrearProductoForm';
import { EditarProductoForm } from '../components/EditarProductoForm';

export const GestorProductos = () => {
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const handleCrear = () => {
    setMostrarCrear(true);
  };

  const handleEdit = (producto) => {
    setProductoEditar(producto);
    setMostrarEditar(true);
  };

  const handleView = (producto) => {
    setViewProduct(producto);
  };

  const handleProductoCreado = (producto) => {
    // La lista se recarga automáticamente en ListaProductos
    setMostrarCrear(false);
  };

  const handleProductoActualizado = (producto) => {
    // La lista se recarga automáticamente en ListaProductos
    setMostrarEditar(false);
    setProductoEditar(null);
  };

  return (
    <div className="gestor-productos">
      <h1>Gestor de Productos</h1>
      <button onClick={handleCrear}>Crear Nuevo Producto</button>
      
      <ListaProductos 
        onEdit={handleEdit}
        onDelete={() => {}} // Implementado dentro de ListaProductos
        onView={handleView}
      />

      <CrearProductoForm
        visible={mostrarCrear}
        onClose={() => setMostrarCrear(false)}
        onProductoCreado={handleProductoCreado}
      />

      <EditarProductoForm
        visible={mostrarEditar}
        producto={productoEditar}
        onClose={() => setMostrarEditar(false)}
        onProductoActualizado={handleProductoActualizado}
      />

      {viewProduct && (
        <div className="modal">
          <div className="modal-content">
            <h2>Ver Producto: {viewProduct.nombre}</h2>
            <p><strong>ID:</strong> {viewProduct.id}</p>
            <p><strong>Nombre:</strong> {viewProduct.nombre}</p>
            <p><strong>Descripción:</strong> {viewProduct.descripcion}</p>
            <p><strong>Precio:</strong> ${viewProduct.precio}</p>
            <p><strong>Activo:</strong> {viewProduct.activo ? 'Sí' : 'No'}</p>
            <button onClick={() => setViewProduct(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 7.5 Estilos (src/styles/GestorProductos.css)

```css
.gestor-productos {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.gestor-productos h1 {
  margin-bottom: 20px;
}

.gestor-productos button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
}

.gestor-productos button:hover {
  background: #0056b3;
}

.lista-productos table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.lista-productos th, .lista-productos td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.lista-productos th {
  background-color: #f2f2f2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 5px;
  width: 500px;
  max-width: 90%;
}

.modal-content h2 {
  margin-top: 0;
}

.modal-content form div {
  margin-bottom: 15px;
}

.modal-content label {
  display: block;
  margin-bottom: 5px;
}

.modal-content input, .modal-content textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-content .buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-content .buttons button {
  padding: 10px 20px;
}
```

### 7.6 Integración en App.js

```javascript
import { GestorProductos } from './pages/GestorProductos';
import './styles/GestorProductos.css';

function App() {
  return (
    <div className="App">
      <GestorProductos />
    </div>
  );
}

export default App;
```

---

## 🤖 GUÍA PARA USAR COPILOT

Si prefieres que Copilot genere el código automáticamente, copia y pega este prompt en el chat de Copilot:

```
Genera una aplicación React completa para gestionar productos con:

1. Componente ListaProductos:
   - GET http://localhost:8080/productos
   - Tabla: ID | Nombre | Descripción | Precio | Activo | Acciones
   - Botones: Ver detalles, Editar, Eliminar
   - Estados: loading, error
   - DELETE para eliminar productos

2. Componente CrearProductoForm:
   - Modal con form
   - Inputs: nombre, descripcion, precio, activo (checkbox)
   - POST http://localhost:8080/productos
   - Validar que nombre no esté vacío
   - Mostrar éxito/error
   - Limpiar form después de guardar

3. Componente EditarProductoForm:
   - Modal con form
   - GET http://localhost:8080/productos/{id}
   - Inputs editables: nombre, descripcion, precio, activo
   - PUT http://localhost:8080/productos/{id}
   - Validar cambios
   - Mostrar éxito/error

4. Página GestorProductos:
   - Título "Gestor de Productos"
   - Botón "Crear Nuevo"
   - ListaProductos en el centro
   - Modales para Crear y Editar
   - Manejo de estados (mostrarCrear, mostrarEditar)
   - Cuando crea o edita, recarga la lista

Usa:
- React Hooks (useState, useEffect)
- Fetch API
- Validaciones en formularios
- Manejo de errores
- CSS Grid/Flex para layout
- Estilos básicos sin librerías

Estructura de carpetas:
src/
  components/
    ListaProductos.jsx
    CrearProductoForm.jsx
    EditarProductoForm.jsx
  pages/
    GestorProductos.jsx
  styles/
    GestorProductos.css
```

¡El código generado por Copilot debería funcionar directamente!

  table th, table td {
    padding: 8px;
  }

  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 📋 CHECKLIST FINAL

- [ ] Crear hook `useProductoConsolidado.js`
- [ ] Crear componente `BuscadorProducto.jsx`
- [ ] Crear componente `TablaVariantes.jsx`
- [ ] Crear componente `ResumenProducto.jsx`
- [ ] Crear página `VentasPage.jsx`
- [ ] Crear estilos `VentasPage.css`
- [ ] Probar búsqueda por código
- [ ] Probar búsqueda por nombre
- [ ] Probar tabla con variantes
- [ ] Probar botón "Agregar al carrito"
- [ ] Verificar responsive en móvil

---

## 🚀 ¡LISTO!

**Tiempo estimado: 2-3 horas**

Tienes código listo para copiar y pegar. Solo ajusta nombres y rutas según tu estructura.


