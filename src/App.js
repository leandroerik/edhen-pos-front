import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutProvider } from './context/LayoutContext';
import { AuthProvider } from './context/AuthContext';

// Shared components
import Navbar from './shared/components/Navbar';
import MainContent from './shared/components/Layout/MainContent';

// Módulos - Dashboard
import Dashboard from './modules/dashboard';

// Módulos - Catálogo
import Catalogo from './modules/catalogo';
import CategoriesPage from './modules/catalogo/categorias';
import ProductsPage from './modules/catalogo/productos';
import AttributesPage from './modules/catalogo/atributos';
import OffersPage from './modules/catalogo/ofertas';

// Módulos - Clientes
import Clientes from './modules/clientes';

// Módulos - Ventas
import VentasTienda from './modules/ventas/tienda';
import VentasHistorial from './modules/ventas/historial';
import VentasInternet from './modules/ventas/internet';
import Devoluciones from './modules/ventas/devoluciones';

// Módulos - Venta Online
import VentaOnline from './modules/ventaOnline';

function App() {
  return (
    <Router>
      <AuthProvider>
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
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Catálogo */}
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/catalogo/categorias" element={<CategoriesPage />} />
              <Route path="/catalogo/productos" element={<ProductsPage />} />
              <Route path="/catalogo/atributos" element={<AttributesPage />} />
              <Route path="/catalogo/ofertas" element={<OffersPage />} />

              {/* Ventas */}
              <Route path="/ventas/tienda" element={<VentasTienda />} />
              <Route path="/ventas/historial" element={<VentasHistorial />} />
              <Route path="/ventas/internet" element={<VentasInternet />} />
              <Route path="/devoluciones" element={<Devoluciones />} />

              {/* Venta Online */}
              <Route path="/venta-online/*" element={<VentaOnline />} />

              {/* Otras secciones principales */}
              <Route path="/cajas" element={<div className="container"><h1>Cajas</h1><p>Funcionalidad en desarrollo...</p></div>} />
              <Route path="/clientes/*" element={<Clientes />} />
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
            </Routes>
          </main>
        </MainContent>
      </LayoutProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
