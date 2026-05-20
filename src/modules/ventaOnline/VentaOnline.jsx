import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import TPVOnline from './components/TPVOnline';
import HistorialPedidos from './historial/pages/HistorialPedidos';
import PedidosList from './pages/PedidosList';
import { TransportesPage } from './transportes';
import styles from './VentaOnline.module.css';

/**
 * Componente principal de Venta Online
 * Maneja el routing interno de las diferentes secciones
 * @component
 */
const VentaOnline = () => {
  const location = useLocation();

  // Determinar qué componente mostrar basado en la ruta
  const getCurrentComponent = () => {
    const path = location.pathname;

    if (path.includes('/historial')) {
      return <HistorialPedidos />;
    } else if (path.includes('/nuevo')) {
      return <TPVOnline />;
    } else if (path.includes('/gestor')) {
      return <PedidosList />;
    } else {
      // Ruta base /venta-online/* - mostrar gestor general
      return <PedidosList />;
    }
  };

  return (
    <div className={styles.ventaOnlineContainer}>
      <Routes>
        <Route path="/" element={<PedidosList />} />
        <Route path="/nuevo" element={<TPVOnline />} />
        <Route path="/gestor" element={<PedidosList />} />
        <Route path="/transportes" element={<TransportesPage />} />
        <Route path="/historial" element={<HistorialPedidos />} />
      </Routes>
    </div>
  );
};

export default VentaOnline;