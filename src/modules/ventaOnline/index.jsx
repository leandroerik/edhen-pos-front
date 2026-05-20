/**
 * Módulo de Venta Online
 * Exporta componentes, páginas, hooks y utilidades
 */

export { default as VentaOnline } from './VentaOnline';
export { default } from './VentaOnline';

// Componentes
export { default as TPVOnline } from './components/TPVOnline';

// Páginas
export { default as PedidosList } from './pages/PedidosList';
export { default as HistorialPedidos } from './historial/pages/HistorialPedidos';

// Hooks
export { useVentaOnlineData } from './hooks/useVentaOnlineData';
export { usePedidosOnline } from './hooks/usePedidosOnline';

// Servicios
export * from './services/pedidosOnlineService';

// Utilidades
export { VENTA_ONLINE_SECTIONS, ESTADO_PEDIDO_ONLINE, VENTA_ONLINE_CONFIG } from './utils/ventaOnlineConfig';