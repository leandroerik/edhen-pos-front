import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutProvider } from './context/LayoutContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Shared
import Navbar from './shared/components/Navbar';
import MainContent from './shared/components/Layout/MainContent';
import EnDesarrollo from './shared/components/EnDesarrollo';

// Dashboard
import Dashboard from './modules/dashboard';

// Catálogo
import Catalogo from './modules/catalogo';
import CategoriesPage from './modules/catalogo/categorias';
import ProductsPage from './modules/catalogo/productos';
import AttributesPage from './modules/catalogo/atributos';
import OffersPage from './modules/catalogo/ofertas';

// Clientes
import Clientes from './modules/clientes';

// Ventas
import { TPVTienda, VentasHistorial, Devoluciones, VentasInternet } from './modules/ventas';

// Venta Online
import VentaOnline from './modules/ventaOnline';

// Cajas
import CajasPage from './modules/cajas';

// Vendedores / Perfil
import Vendedores from './modules/vendedores';
import MiPerfil from './modules/miperfil';

// Configuración
import ExportarBD from './modules/configuracion/pages/ExportarBD';
import ImportarBD from './modules/configuracion/pages/ImportarBD';
import EmpresaConfig from './modules/configuracion/pages/Empresa';
import ImpuestosConfig from './modules/configuracion/pages/Impuestos';
import PagosConfig from './modules/configuracion/pages/Pagos';
import NotificacionesConfig from './modules/configuracion/pages/Notificaciones';
import InventarioConfig from './modules/configuracion/pages/Inventario';
import IntegracionesConfig from './modules/configuracion/pages/Integraciones';

// Informes
import {
  InformeVentas,
  InformeDevoluciones,
  ProductosVendidos,
  ProductosDevueltos,
  CategoriasVendidas,
  CategoriasDevueltas,
  InformeVendedores,
} from './modules/informes';

// ── Guard ──────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/ventas/tienda" replace />;
  return children;
};

const Admin = ({ children }) => <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
const AdminVendedor = ({ children }) => <ProtectedRoute allowedRoles={['admin', 'vendedor']}>{children}</ProtectedRoute>;

// ── App ────────────────────────────────────────────────────────────────────────
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
                style: { background: '#363636', color: '#fff' },
                success: { duration: 3000 },
                error: { duration: 5000 },
              }}
            />
            <main className="p-4">
              <Routes>

                {/* Dashboard */}
                <Route path="/" element={<Admin><Dashboard /></Admin>} />

                {/* Catálogo */}
                <Route path="/catalogo" element={<Admin><Catalogo /></Admin>} />
                <Route path="/catalogo/categorias" element={<Admin><CategoriesPage /></Admin>} />
                <Route path="/catalogo/productos" element={<Admin><ProductsPage /></Admin>} />
                <Route path="/catalogo/atributos" element={<Admin><AttributesPage /></Admin>} />
                <Route path="/catalogo/ofertas" element={<Admin><OffersPage /></Admin>} />

                {/* Ventas */}
                <Route path="/ventas/tienda" element={<AdminVendedor><TPVTienda /></AdminVendedor>} />
                <Route path="/ventas/historial" element={<AdminVendedor><VentasHistorial /></AdminVendedor>} />
                <Route path="/ventas/internet" element={<Admin><VentasInternet /></Admin>} />
                <Route path="/devoluciones" element={<AdminVendedor><Devoluciones /></AdminVendedor>} />

                {/* Venta Online */}
                <Route path="/venta-online/*" element={<Admin><VentaOnline /></Admin>} />

                {/* Cajas */}
                <Route path="/cajas" element={<Admin><CajasPage /></Admin>} />

                {/* Clientes */}
                <Route path="/clientes/*" element={<Admin><Clientes /></Admin>} />

                {/* Vendedores */}
                <Route path="/vendedores" element={<Admin><Vendedores /></Admin>} />
                <Route path="/mi-perfil" element={<AdminVendedor><MiPerfil /></AdminVendedor>} />

                {/* Informes */}
                <Route path="/informes/ventas" element={<Admin><InformeVentas /></Admin>} />
                <Route path="/informes/devoluciones" element={<Admin><InformeDevoluciones /></Admin>} />
                <Route path="/informes/productos-vendidos" element={<Admin><ProductosVendidos /></Admin>} />
                <Route path="/informes/productos-devueltos" element={<Admin><ProductosDevueltos /></Admin>} />
                <Route path="/informes/categorias-vendidas" element={<Admin><CategoriasVendidas /></Admin>} />
                <Route path="/informes/categorias-devueltas" element={<Admin><CategoriasDevueltas /></Admin>} />
                <Route path="/informes/vendedores" element={<Admin><InformeVendedores /></Admin>} />

                {/* Configuración */}
                <Route path="/configuracion/empresa" element={<Admin><EmpresaConfig /></Admin>} />
                <Route path="/configuracion/impuestos" element={<Admin><ImpuestosConfig /></Admin>} />
                <Route path="/configuracion/pagos" element={<Admin><PagosConfig /></Admin>} />
                <Route path="/configuracion/notificaciones" element={<Admin><NotificacionesConfig /></Admin>} />
                <Route path="/configuracion/inventario" element={<Admin><InventarioConfig /></Admin>} />
                <Route path="/configuracion/integraciones" element={<Admin><IntegracionesConfig /></Admin>} />
                <Route path="/configuracion/importar-bd" element={<Admin><ImportarBD /></Admin>} />
                <Route path="/configuracion/exportar-bd" element={<Admin><ExportarBD /></Admin>} />
                <Route path="/configuracion/importar/devoluciones" element={<Admin><EnDesarrollo titulo="Importar Devoluciones" /></Admin>} />
                <Route path="/configuracion/importar/clientes" element={<Admin><EnDesarrollo titulo="Importar Clientes" /></Admin>} />

                {/* Otros */}
                <Route path="/cuenta-catinfog" element={<Admin><EnDesarrollo titulo="Cuenta Catinfog" /></Admin>} />

              </Routes>
            </main>
          </MainContent>
        </LayoutProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
