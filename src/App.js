import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutProvider } from './context/LayoutContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Sales from './components/Sales';
import Clients from './components/Clients';
import Products from './components/Products';
import Reports from './components/Reports';
import TPVTienda from './components/TPVTienda';
import MainContent from './components/Layout/MainContent';

function App() {
  return (
    <Router>
      <LayoutProvider>
        <Navbar />
        <MainContent>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <main className="p-4">
            <Routes>
              {/* Panel de control */}
              <Route path="/" element={<Dashboard />} />

              {/* Catálogo */}
              <Route path="/categorias" element={<div className="container"><h1>Categorías</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/productos" element={<Products />} />
              <Route path="/ofertas" element={<div className="container"><h1>Ofertas</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Ventas */}
              <Route path="/ventas/tienda" element={<TPVTienda />} />
              <Route path="/ventas/internet" element={<div className="container"><h1>Ventas en Internet</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/devoluciones" element={<div className="container"><h1>Devoluciones</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Otras secciones principales */}
              <Route path="/cajas" element={<div className="container"><h1>Cajas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/vendedores" element={<div className="container"><h1>Vendedores</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Informes */}
              <Route path="/informes/ventas" element={<div className="container"><h1>Informe de Ventas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/devoluciones" element={<div className="container"><h1>Informe de Devoluciones</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/productos-vendidos" element={<div className="container"><h1>Productos Más Vendidos</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/productos-devueltos" element={<div className="container"><h1>Productos Más Devueltos</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/categorias-vendidas" element={<div className="container"><h1>Categorías Más Vendidas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/categorias-devueltas" element={<div className="container"><h1>Categorías Más Devueltas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/informes/vendedores" element={<div className="container"><h1>Informe de Vendedores</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Configuración */}
              <Route path="/configuracion/opciones" element={<div className="container"><h1>Opciones</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/configuracion/impresion" element={<div className="container"><h1>Impresión</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/configuracion/tienda-online" element={<div className="container"><h1>Tienda Online</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Importar/Exportar */}
              <Route path="/configuracion/importar/productos" element={<div className="container"><h1>Importar Productos</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/configuracion/importar/ventas" element={<div className="container"><h1>Importar Ventas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/configuracion/importar/devoluciones" element={<div className="container"><h1>Importar Devoluciones</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/configuracion/importar/clientes" element={<div className="container"><h1>Importar Clientes</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Cuenta Catinfog */}
              <Route path="/cuenta-catinfog" element={<div className="container"><h1>Cuenta Catinfog</h1><p>Funcionalidad en desarrollo...</p></div>} />

              {/* Rutas legacy para compatibilidad */}
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </MainContent>
      </LayoutProvider>
    </Router>
  );
}

export default App;
