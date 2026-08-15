# edhen-pos-front

Frontend del sistema de Punto de Venta (POS) y control de stock para tienda de ropa **edhen**.

## 🛠️ Stack Tecnológico
- **React 19** + **TypeScript** + **Vite 8**
- **TailwindCSS v4** para estilos
- **React Router v7** para navegación
- **Axios** para llamadas a la API REST
- **JsBarcode** para generación e impresión de etiquetas con código de barras

---

## 🚀 Cómo Ejecutar el Frontend

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo
**En Windows (script rápido):**
```cmd
run.bat
```

**O mediante comando:**
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## ⚙️ Configuración de Conexión al Backend

El archivo `.env.development` apunta a la API backend:
```env
VITE_API_URL=http://localhost:8080
```

---

## 📂 Estructura de Módulos (Features)

```
src/
├── api/                   # Clientes HTTP por dominio (productos, ventas, stock, clientes, etc.)
├── features/
│   ├── inicio/            # Dashboard principal con métricas del día y gráficos
│   ├── ventas/            # POS rápido de mostrador, cobros combinados e historial
│   ├── productos/         # Catálogo, generador de variantes e impresión de etiquetas
│   ├── stock/             # Control de inventario, auditoría y ajustes manuales
│   ├── clientes/          # Gestión de clientes mayoristas/minoristas y direcciones
│   └── envios/            # Seguimiento logístico de despachos
├── shared/                # Layout, Navbar, Sidebar y componentes compartidos
└── types/                 # Modelos de datos TypeScript sincronizados con el backend
```
