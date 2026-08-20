import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { ClienteFormPage } from './features/clientes/ClienteFormPage'
import { ClientesPage } from './features/clientes/ClientesPage'
import { EnvioDetallePage } from './features/envios/EnvioDetallePage'
import { EnvioFormPage } from './features/envios/EnvioFormPage'
import { EnviosPage } from './features/envios/EnviosPage'
import { InicioPage } from './features/inicio/InicioPage'
import { ColaEtiquetasProvider } from './features/productos/context/ColaEtiquetasContext'
import { ReportesPage } from './features/reportes/ReportesPage'
import { EtiquetaProductoPage } from './features/productos/EtiquetaProductoPage'
import { EtiquetaVariantePage } from './features/productos/EtiquetaVariantePage'
import { EtiquetasColaPage } from './features/productos/EtiquetasColaPage'
import { ProductoDetallePage } from './features/productos/ProductoDetallePage'
import { ProductoFormPage } from './features/productos/ProductoFormPage'
import { ProductosPage } from './features/productos/ProductosPage'
import { StockPage } from './features/stock/StockPage'
import { VentasHistorialPage } from './features/ventas/VentasHistorialPage'
import { VentasPage } from './features/ventas/VentasPage'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { MainLayout } from './shared/layout/MainLayout'

function App() {
  return (
    <ErrorBoundary>
      <ColaEtiquetasProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<InicioPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="productos/nuevo" element={<ProductoFormPage />} />
              <Route path="productos/:id" element={<ProductoDetallePage />} />
              <Route path="productos/:id/editar" element={<ProductoFormPage />} />
              <Route path="productos/:id/etiqueta" element={<EtiquetaProductoPage />} />
              <Route
                path="productos/:id/variantes/:varianteId/etiqueta"
                element={<EtiquetaVariantePage />}
              />
              <Route path="etiquetas" element={<EtiquetasColaPage />} />
              <Route path="ventas" element={<VentasPage />} />
              <Route path="ventas/historial" element={<VentasHistorialPage />} />
              <Route path="stock" element={<StockPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="clientes/nuevo" element={<ClienteFormPage />} />
              <Route path="clientes/:id/editar" element={<ClienteFormPage />} />
              <Route path="envios" element={<EnviosPage />} />
              <Route path="envios/nuevo" element={<EnvioFormPage />} />
              <Route path="envios/:id" element={<EnvioDetallePage />} />
              <Route path="reportes" element={<ReportesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ColaEtiquetasProvider>
    </ErrorBoundary>
  )
}

export default App
