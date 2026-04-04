# 📱 INSTRUCCIONES PARA EL FRONTEND - VISTAS DE PRODUCTOS CONSOLIDADOS

## 🎯 RESUMEN EJECUTIVO

El backend ya tiene implementados **3 endpoints** que devuelven toda la información consolidada de un producto. 

**Tu trabajo en el frontend:**
1. Crear vistas para mostrar esa información en tablas
2. Implementar búsqueda por ID, código de barras y nombre
3. Mostrar los códigos de barras de manera legible
4. Permitir seleccionar variantes para agregar al carrito

---

## 🔌 ENDPOINTS DISPONIBLES

### 1️⃣ Obtener Producto por ID
```
GET /productos/consolidado/{id}
```
**Ejemplo:**
```
GET /productos/consolidado/1
```

**Cuándo usarlo:**
- Cuando el usuario navega directamente a un producto
- Desde un listado haciendo clic en un producto

---

### 2️⃣ Buscar por Código de Barras
```
GET /productos/consolidado/buscar-codigo?codigo=PROD000001
```

**Ejemplo:**
```
GET /productos/consolidado/buscar-codigo?codigo=PROD000001
```

**Cuándo usarlo:**
- **LECTOR DE CÓDIGO DE BARRAS** 🔍
- El usuario escanea un código de barras
- El sistema busca automáticamente y muestra el producto

---

### 3️⃣ Buscar por Nombre
```
GET /productos/consolidado/buscar-nombre?nombre=Camiseta
```

**Ejemplo:**
```
GET /productos/consolidado/buscar-nombre?nombre=Cami
```

**Cuándo usarlo:**
- Búsqueda general/catálogo
- El usuario escribe el nombre del producto
- Muestra coincidencias

---

## 📦 ESTRUCTURA DE DATOS QUE RECIBIRÁS

El servidor devolverá algo así:

```json
{
  "id": 1,
  "nombre": "Camiseta Deportiva",
  "descripcion": "Camiseta de algodón premium",
  "precio": 50.00,
  "codigoBarra": "PROD000001",
  "activo": true,
  
  "variantes": [
    {
      "id": 1,
      "atributos": {
        "Talle": "M",
        "Color": "Rojo"
      },
      "codigoVariante": "PROD000001-TAL-M-COL-R",
      "sku": {
        "id": 1,
        "precio": 55.00,
        "costo": 30.00,
        "stock": 10,
        "codigoBarra": "PROD000001-TAL-M-COL-R"
      }
    },
    {
      "id": 2,
      "atributos": {
        "Talle": "L",
        "Color": "Rojo"
      },
      "codigoVariante": "PROD000001-TAL-L-COL-R",
      "sku": {
        "id": 2,
        "precio": 55.00,
        "costo": 30.00,
        "stock": 15,
        "codigoBarra": "PROD000001-TAL-L-COL-R"
      }
    }
  ],
  
  "skusLegacy": [],
  "totalVariantes": 2,
  "totalStock": 25,
  "precioMinimo": 55.00,
  "precioMaximo": 55.00
}
```

---

## 📋 VISTAS QUE NECESITAS CREAR

### Vista 1: Búsqueda de Producto

**Ubicación:** `/productos/buscar` o en un modal/panel

**Funcionalidad:**
- Campo de entrada para código de barras
- Campo de entrada para nombre
- Botón de buscar
- O integrar un lector de código de barras que autocomlete

**Diseño sugerido:**

```
┌─────────────────────────────────────────┐
│ 🔍 BUSCAR PRODUCTO                      │
├─────────────────────────────────────────┤
│ Código de Barras: [____________] [Scan] │
│ O Nombre:         [____________] [Buscar]│
└─────────────────────────────────────────┘
```

---

### Vista 2: Detalle del Producto (Tabla Consolidada)

**Ubicación:** `/productos/{id}` o después de buscar

**Información que debe mostrar:**

#### Sección 1: Información General
```
╔════════════════════════════════════════╗
║ CAMISETA DEPORTIVA                     ║
║ Código: PROD000001                     ║
║ Descripción: Camiseta de algodón...    ║
║ Precio Base: $50.00                    ║
║ Estado: ✅ Activo                      ║
╚════════════════════════════════════════╝
```

#### Sección 2: Código de Barras del Producto
```
┌────────────────────┐
│ CÓDIGO PRODUCTO    │
│ PROD000001         │
│ [QR CODE IMAGE]    │
│ o código de barras │
└────────────────────┘
```

#### Sección 3: Tabla de Variantes

| Variante | Atributos | Código | Precio | Costo | Stock | Margen | Acción |
|----------|-----------|--------|--------|-------|-------|--------|--------|
| 1 | M - Rojo | PROD000001-TAL-M-COL-R | $55 | $30 | 10 | 45% | Agregar |
| 2 | L - Rojo | PROD000001-TAL-L-COL-R | $55 | $30 | 15 | 45% | Agregar |
| 3 | M - Azul | PROD000001-TAL-M-COL-A | $55 | $30 | 8 | 45% | Agregar |

#### Sección 4: Resumen
```
Total de Variantes: 3
Stock Total: 33
Precio Mínimo: $55.00
Precio Máximo: $55.00
Margen Promedio: 45%
```

---

## 💻 CÓDIGO REACT PARA IMPLEMENTAR

### 1. Hook personalizado para obtener el producto

```javascript
// hooks/useProductoConsolidado.js
import { useState, useEffect } from 'react';

export const useProductoConsolidado = (id, codigoBarra, nombre) => {
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerProducto = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = 'http://localhost:8080/productos/consolidado';
        
        if (id) {
          url = `${url}/${id}`;
        } else if (codigoBarra) {
          url = `${url}/buscar-codigo?codigo=${codigoBarra}`;
        } else if (nombre) {
          url = `${url}/buscar-nombre?nombre=${nombre}`;
        } else {
          return;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Producto no encontrado');
        
        const data = await response.json();
        setProducto(data);
      } catch (err) {
        setError(err.message);
        setProducto(null);
      } finally {
        setLoading(false);
      }
    };

    obtenerProducto();
  }, [id, codigoBarra, nombre]);

  return { producto, loading, error };
};
```

---

### 2. Componente de Búsqueda

```javascript
// components/BuscadorProducto.jsx
import { useState } from 'react';
import { useProductoConsolidado } from '../hooks/useProductoConsolidado';

export const BuscadorProducto = ({ onProductoSeleccionado }) => {
  const [codigoBarra, setCodigoBarra] = useState('');
  const [nombre, setNombre] = useState('');
  const [criterio, setCriterio] = useState('codigo'); // 'codigo' o 'nombre'
  
  const { producto, loading, error } = useProductoConsolidado(
    null,
    criterio === 'codigo' && codigoBarra ? codigoBarra : null,
    criterio === 'nombre' && nombre ? nombre : null
  );

  const handleBuscar = () => {
    if (criterio === 'codigo' && !codigoBarra) {
      alert('Ingresa un código de barras');
      return;
    }
    if (criterio === 'nombre' && !nombre) {
      alert('Ingresa un nombre');
      return;
    }
  };

  return (
    <div className="buscador-container">
      <h2>🔍 BUSCAR PRODUCTO</h2>
      
      <div className="opciones-busqueda">
        <label>
          <input 
            type="radio" 
            value="codigo" 
            checked={criterio === 'codigo'}
            onChange={(e) => setCriterio(e.target.value)}
          />
          Por Código de Barras
        </label>
        
        <label>
          <input 
            type="radio" 
            value="nombre" 
            checked={criterio === 'nombre'}
            onChange={(e) => setCriterio(e.target.value)}
          />
          Por Nombre
        </label>
      </div>

      {criterio === 'codigo' && (
        <div className="input-group">
          <input
            type="text"
            placeholder="Escanea o escribe código de barras..."
            value={codigoBarra}
            onChange={(e) => setCodigoBarra(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
            autoFocus
          />
          <button onClick={handleBuscar}>Buscar</button>
        </div>
      )}

      {criterio === 'nombre' && (
        <div className="input-group">
          <input
            type="text"
            placeholder="Escribe el nombre del producto..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <button onClick={handleBuscar}>Buscar</button>
        </div>
      )}

      {loading && <p>⏳ Cargando...</p>}
      {error && <p style={{color: 'red'}}>❌ {error}</p>}

      {producto && onProductoSeleccionado && (
        onProductoSeleccionado(producto)
      )}
    </div>
  );
};
```

---

### 3. Componente de Detalle Consolidado

```javascript
// components/DetalleProductoConsolidado.jsx
import './DetalleProductoConsolidado.css';

export const DetalleProductoConsolidado = ({ producto, onAgregarAlCarrito }) => {
  if (!producto) return <p>Selecciona un producto para ver los detalles</p>;

  const margenPromedio = producto.precioMinimo && producto.precioMinimo > 0
    ? Math.round(((producto.precioMinimo - (producto.precioMinimo * 0.5)) / producto.precioMinimo) * 100)
    : 0;

  return (
    <div className="detalle-consolidado">
      {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
      <section className="info-general">
        <div className="info-texto">
          <h1>{producto.nombre}</h1>
          <p className="codigo">Código: <strong>{producto.codigoBarra}</strong></p>
          <p className="descripcion">{producto.descripcion}</p>
          <div className="precios">
            <span>Precio Base: <strong>${producto.precio}</strong></span>
            <span className={`estado ${producto.activo ? 'activo' : 'inactivo'}`}>
              {producto.activo ? '✅ Activo' : '❌ Inactivo'}
            </span>
          </div>
        </div>

        {/* CÓDIGO DE BARRAS */}
        <div className="codigo-barra-producto">
          <h3>CÓDIGO PRODUCTO</h3>
          <p className="barcode-value">{producto.codigoBarra}</p>
          <canvas id="barcodeCanvas"></canvas>
          {/* O mostrar QR */}
          <svg className="qr-placeholder">
            <text x="50" y="50">[QR CODE]</text>
          </svg>
        </div>
      </section>

      {/* SECCIÓN 2: TABLA DE VARIANTES */}
      <section className="tabla-variantes">
        <h2>📦 VARIANTES Y STOCK</h2>
        
        {producto.variantes && producto.variantes.length > 0 ? (
          <table className="tabla">
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
              {producto.variantes.map((variante, index) => {
                const atributosStr = Object.entries(variante.atributos)
                  .map(([key, value]) => `${value}`)
                  .join(' - ');
                
                const margen = variante.sku && variante.sku.precio && variante.sku.costo
                  ? Math.round(((variante.sku.precio - variante.sku.costo) / variante.sku.precio) * 100)
                  : 0;

                return (
                  <tr key={variante.id}>
                    <td>{index + 1}</td>
                    <td>{atributosStr}</td>
                    <td className="codigo-monoespaciado">{variante.sku?.codigoBarra || 'N/A'}</td>
                    <td className="precio">${variante.sku?.precio || 'N/A'}</td>
                    <td>${variante.sku?.costo || 'N/A'}</td>
                    <td className={`stock ${variante.sku?.stock === 0 ? 'sin-stock' : ''}`}>
                      {variante.sku?.stock || 0}
                    </td>
                    <td>{margen}%</td>
                    <td>
                      {variante.sku?.stock > 0 ? (
                        <button 
                          className="btn-agregar"
                          onClick={() => onAgregarAlCarrito && onAgregarAlCarrito(variante)}
                        >
                          🛒 Agregar
                        </button>
                      ) : (
                        <span className="sin-stock">Sin stock</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No hay variantes registradas</p>
        )}
      </section>

      {/* SECCIÓN 3: RESUMEN */}
      <section className="resumen">
        <h2>📊 RESUMEN</h2>
        <div className="grid-resumen">
          <div className="card-resumen">
            <span className="label">Total Variantes</span>
            <span className="valor">{producto.totalVariantes}</span>
          </div>
          <div className="card-resumen">
            <span className="label">Stock Total</span>
            <span className="valor">{producto.totalStock}</span>
          </div>
          <div className="card-resumen">
            <span className="label">Precio Mínimo</span>
            <span className="valor">${producto.precioMinimo}</span>
          </div>
          <div className="card-resumen">
            <span className="label">Precio Máximo</span>
            <span className="valor">${producto.precioMaximo}</span>
          </div>
          <div className="card-resumen">
            <span className="label">Margen Promedio</span>
            <span className="valor">{margenPromedio}%</span>
          </div>
        </div>
      </section>
    </div>
  );
};
```

---

### 4. Estilos CSS

```css
/* DetalleProductoConsolidado.css */

.detalle-consolidado {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* SECCIÓN 1: INFO GENERAL */
.info-general {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-texto h1 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 28px;
}

.codigo {
  font-family: 'Courier New', monospace;
  color: #666;
  margin: 5px 0;
}

.descripcion {
  color: #555;
  line-height: 1.6;
  margin: 15px 0;
}

.precios {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.precios span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.precios strong {
  color: #2ecc71;
  font-size: 18px;
}

.estado {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.estado.activo {
  background: #d4edda;
  color: #155724;
}

.estado.inactivo {
  background: #f8d7da;
  color: #721c24;
}

.codigo-barra-producto {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: white;
  border: 2px dashed #999;
  border-radius: 8px;
  text-align: center;
}

.codigo-barra-producto h3 {
  margin: 0;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.barcode-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin: 5px 0;
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* TABLA DE VARIANTES */
.tabla-variantes {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.tabla-variantes h2 {
  margin-top: 0;
  color: #333;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla thead {
  background: #2c3e50;
  color: white;
}

.tabla th {
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #34495e;
}

.tabla td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
}

.tabla tbody tr:hover {
  background: #f8f9fa;
}

.codigo-monoespaciado {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 3px;
  color: #333;
}

.precio {
  color: #27ae60;
  font-weight: bold;
  font-size: 16px;
}

.stock {
  text-align: center;
  font-weight: bold;
  color: #333;
}

.stock.sin-stock {
  color: #e74c3c;
  background: #fadbd8;
  padding: 4px 8px;
  border-radius: 3px;
}

.btn-agregar {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-agregar:hover {
  background: #2980b9;
}

.sin-stock {
  color: #e74c3c;
  font-size: 12px;
  text-decoration: line-through;
}

/* RESUMEN */
.resumen {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.resumen h2 {
  margin-top: 0;
  color: #333;
}

.grid-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.card-resumen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: #ecf0f1;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.card-resumen .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.card-resumen .valor {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .info-general {
    grid-template-columns: 1fr;
  }

  .tabla {
    font-size: 12px;
  }

  .tabla th, .tabla td {
    padding: 8px;
  }

  .grid-resumen {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 📱 Página Principal (Vista Combinada)

```javascript
// pages/ProductosPage.jsx
import { useState } from 'react';
import { BuscadorProducto } from '../components/BuscadorProducto';
import { DetalleProductoConsolidado } from '../components/DetalleProductoConsolidado';

export const ProductosPage = () => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const handleAgregarAlCarrito = (variante) => {
    console.log('Agregar al carrito:', variante);
    // Aquí implementar lógica del carrito
    alert(`✅ ${variante.atributos.Talle} - ${variante.atributos.Color} agregado al carrito`);
  };

  return (
    <div className="productos-page">
      <h1>🛍️ GESTOR DE PRODUCTOS</h1>
      
      <div className="contenedor-principal">
        {/* Columna izquierda: Búsqueda */}
        <div className="columna-busqueda">
          <BuscadorProducto onProductoSeleccionado={setProductoSeleccionado} />
        </div>

        {/* Columna derecha: Detalle */}
        <div className="columna-detalle">
          <DetalleProductoConsolidado 
            producto={productoSeleccionado}
            onAgregarAlCarrito={handleAgregarAlCarrito}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 🎯 CASOS DE USO

### 📌 Caso 1: Vendedor busca por nombre
1. Abre la página de productos
2. Selecciona "Por Nombre"
3. Escribe "Camiseta"
4. Presiona Enter o click en Buscar
5. Sistema trae el producto y muestra toda la información
6. Vendedor ve todas las variantes disponibles
7. Selecciona la variante que el cliente necesita
8. Agrega al carrito

### 📌 Caso 2: Lector de código de barras
1. Vendedor escanea código de barras del producto
2. Input se autocomplementa: "PROD000001"
3. Sistema busca automáticamente
4. Muestra el producto con todas sus variantes
5. Vendedor selecciona la variante específica
6. Agrega al carrito y procede al pago

### 📌 Caso 3: Gerente revisa inventario
1. Abre página de productos
2. Busca un producto específico
3. Ve tabla con todas las variantes
4. Analiza stock, precios, márgenes
5. Identifica qué variantes necesitan reorden

---

## 🔧 CONFIGURACIÓN BASE

### Variables de entorno (archivo `.env`)
```
REACT_APP_API_URL=http://localhost:8080
```

### Uso en los componentes
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// En el hook:
const url = `${API_URL}/productos/consolidado/${id}`;
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear archivo `hooks/useProductoConsolidado.js`
- [ ] Crear componente `BuscadorProducto.jsx`
- [ ] Crear componente `DetalleProductoConsolidado.jsx`
- [ ] Crear estilos `DetalleProductoConsolidado.css`
- [ ] Crear página `ProductosPage.jsx`
- [ ] Integrar en rutas principales
- [ ] Probar búsqueda por ID
- [ ] Probar búsqueda por código de barras
- [ ] Probar búsqueda por nombre
- [ ] Probar scroll de tabla en responsivo
- [ ] Integrar con lector de código de barras (si aplica)
- [ ] Conectar botón "Agregar al carrito" con lógica del carrito

---

## 🚨 NOTAS IMPORTANTES

### 1. CORS
Si recibes error de CORS, el backend ya está configurado para permitir requests. Si no, pide al backend que agregue:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                    .allowedMethods("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 2. CÓDIGOS DE BARRAS
Los códigos de barras están incluidos en la respuesta:
- `producto.codigoBarra` - Código del producto base
- `variante.sku.codigoBarra` - Código de cada variante

Para mostrarlos como QR o barcode, usa librerías como:
- `jsbarcode` - Para códigos de barras
- `qrcode.react` - Para QR codes

```bash
npm install jsbarcode qrcode.react
```

### 3. RENDIMIENTO
Si tienes muchas variantes (100+), considera:
- Paginación en la tabla
- Virtualización (react-window)
- Lazy loading de imágenes

---

## 📞 SOPORTE

**Si el frontend necesita:**
1. Más datos → Actualiza `ProductoConsolidadoResponse`
2. Nuevos endpoints → Agrega métodos en `ProductoAvanzadoController`
3. Validaciones → Implementa en el backend antes

**Siempre **communicate con el backend** sobre cambios en el contrato de datos.**

---

## 🎉 ¡LISTO PARA COMENZAR!

Tienes toda la información que necesitas para implementar las vistas.

**Próximos pasos:**
1. Copia los componentes React
2. Ajusta los estilos a tu diseño
3. Integra con tu router
4. ¡Prueba los endpoints!

**¿Dudas?** Pregunta al backend team sobre:
- Estructura de datos
- Nuevos campos necesarios
- Cambios en los endpoints

---


