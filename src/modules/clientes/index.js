/**
 * Módulo de Clientes
 * Exporta todos los componentes, páginas, hooks y utilidades
 */

// Componentes
export { default as ClientForm } from './components/ClientForm';
export { default as ClientTable } from './components/ClientTable';
export * from './components/Addresses';

// Páginas
export { default as ClientesList } from './pages/ClientesList';

// Hooks
export { useClientesData } from './hooks/useClientesData';

// Utils
export { CLIENTES_SECTIONS, ESTADO_CLIENTE, CLIENTES_CONFIG } from './utils/clientesConfig';
export { clienteValidadores } from './utils/validators';

// Componente principal
export { default as Clientes } from './Clientes';
export { default } from './Clientes';
