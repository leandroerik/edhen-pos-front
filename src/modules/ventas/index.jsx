/**
 * Módulo de Ventas
 * Exporta componentes, páginas, hooks y utilidades
 */

export { default as Ventas } from './Ventas';
export { default } from './Ventas';

// Componentes
export { default as TPVTienda } from './components/TPVTienda';
export { default as SalesTable } from './components/SalesTable';

// Páginas
export { default as VentasHistorial } from './pages/VentasHistorial';

// Hooks
export { useVentasData } from './hooks/useVentasData';

// Utilidades  
export { VENTAS_SECTIONS, ESTADO_VENTA, METODO_PAGO, VENTAS_CONFIG } from './utils/ventasConfig';