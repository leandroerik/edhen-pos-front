/**
 * Configuración centralizada del Dashboard
 * Define estadísticas, categorías y configuraciones globales
 */

export const PANEL_STATS = [
  {
    id: 'sales-today',
    title: 'Ventas Hoy',
    value: '$4,250.50',
    icon: 'fa-dollar-sign',
    bg: 'bg-success',
    color: 'text-success'
  },
  {
    id: 'products',
    title: 'Productos',
    value: '156',
    icon: 'fa-box',
    bg: 'bg-info',
    color: 'text-info'
  },
  {
    id: 'clients',
    title: 'Clientes',
    value: '1,243',
    icon: 'fa-users',
    bg: 'bg-warning',
    color: 'text-warning'
  },
  {
    id: 'orders',
    title: 'Órdenes',
    value: '42',
    icon: 'fa-receipt',
    bg: 'bg-danger',
    color: 'text-danger'
  }
];

export const MAIN_CATEGORIES = [
  {
    id: 1,
    name: 'Electrónica',
    count: 25,
    badge: 'bg-primary'
  },
  {
    id: 2,
    name: 'Accesorios',
    count: 18,
    badge: 'bg-info'
  },
  {
    id: 3,
    name: 'Audio',
    count: 12,
    badge: 'bg-warning'
  }
];

export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // Intervalo de actualización en ms
  cardHeight: {
    min: '300px'
  }
};
