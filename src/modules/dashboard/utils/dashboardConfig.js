/**
 * Configuración centralizada del Dashboard
 * Define estadísticas, categorías y configuraciones globales
 */

export const PANEL_STATS = [
  {
    id: 'ventas-hoy',
    title: 'Ventas Hoy',
    value: '$2.750',
    previousValue: '$2.310',
    change: 19.0,
    changeType: 'positive',
    icon: 'fa-shopping-cart',
    bg: 'bg-success',
    color: 'text-success',
    description: 'Total de ventas del día actual',
    subtitle: '17 transacciones'
  },
  {
    id: 'productos-activos',
    title: 'Productos Activos',
    value: '143',
    previousValue: '140',
    change: 2.1,
    changeType: 'positive',
    icon: 'fa-tshirt',
    bg: 'bg-primary',
    color: 'text-primary',
    description: 'Productos disponibles para venta',
    subtitle: '7 variantes con stock bajo'
  },
  {
    id: 'clientes-activos',
    title: 'Clientes',
    value: '284',
    previousValue: '271',
    change: 4.8,
    changeType: 'positive',
    icon: 'fa-users',
    bg: 'bg-info',
    color: 'text-info',
    description: 'Clientes registrados en el sistema',
    subtitle: '5 nuevos esta semana'
  },
  {
    id: 'pedidos-pendientes',
    title: 'Pedidos Pendientes',
    value: '7',
    previousValue: '4',
    change: 0,
    changeType: 'neutral',
    icon: 'fa-truck',
    bg: 'bg-warning',
    color: 'text-warning',
    description: 'Pedidos de Tienda Nube sin despachar',
    subtitle: '3 listos para preparar'
  }
];

export const SALES_DATA = [
  { dia: 'Lun', ventas: 1200, pedidos: 8 },
  { dia: 'Mar', ventas: 1900, pedidos: 12 },
  { dia: 'Mié', ventas: 800, pedidos: 6 },
  { dia: 'Jue', ventas: 2400, pedidos: 15 },
  { dia: 'Vie', ventas: 1800, pedidos: 11 },
  { dia: 'Sáb', ventas: 3200, pedidos: 18 },
  { dia: 'Dom', ventas: 1500, pedidos: 9 }
];

// Ventas de hoy por franja horaria (horario del local: 9-18h)
// ventas: 0 = hora futura o sin movimiento
export const TODAY_SALES_DATA = [
  { hora: '9h',  ventas: 0,   transacciones: 0, futura: false },
  { hora: '10h', ventas: 320, transacciones: 2, futura: false },
  { hora: '11h', ventas: 580, transacciones: 4, futura: false },
  { hora: '12h', ventas: 210, transacciones: 1, futura: false },
  { hora: '13h', ventas: 450, transacciones: 3, futura: false },
  { hora: '14h', ventas: 120, transacciones: 1, futura: false },
  { hora: '15h', ventas: 680, transacciones: 4, futura: false },
  { hora: '16h', ventas: 390, transacciones: 2, futura: false },
  { hora: '17h', ventas: 0,   transacciones: 0, futura: true },
  { hora: '18h', ventas: 0,   transacciones: 0, futura: true },
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: 'venta',
    title: 'Nueva venta realizada',
    description: 'Venta #00318 · Remera + Jeans · $4.200',
    time: 'Hace 5 min',
    icon: 'fa-shopping-cart',
    color: 'text-success'
  },
  {
    id: 2,
    type: 'pedido',
    title: 'Pedido online recibido',
    description: 'Pedido #TN-0091 · Tienda Nube · $6.800',
    time: 'Hace 18 min',
    icon: 'fa-truck',
    color: 'text-info'
  },
  {
    id: 3,
    type: 'stock',
    title: 'Stock actualizado',
    description: 'Campera Bomber Negra Talle M → 3 unidades',
    time: 'Hace 42 min',
    icon: 'fa-box',
    color: 'text-warning'
  },
  {
    id: 4,
    type: 'cliente',
    title: 'Cliente registrado',
    description: 'Lucía Fernández agregada como mayorista',
    time: 'Hace 1 hora',
    icon: 'fa-user-plus',
    color: 'text-primary'
  },
  {
    id: 5,
    type: 'devolucion',
    title: 'Devolución procesada',
    description: 'Dev. #00089 · Vestido Floral Talle S · $3.500',
    time: 'Hace 2 horas',
    icon: 'fa-undo',
    color: 'text-danger'
  }
];

export const ALERTS = [
  {
    id: '1',
    type: 'warning',
    title: 'Stock crítico',
    message: 'Campera Bomber M · Jeans Slim 38 · Remera XS — menos de 3 unidades',
    action: 'Revisar stock',
    actionUrl: '/catalogo/productos',
    icon: 'fa-exclamation-triangle'
  },
  {
    id: '2',
    type: 'info',
    title: 'Pedidos sin preparar',
    message: '3 pedidos de Tienda Nube llevan más de 24 hs sin movimiento',
    action: 'Ver pedidos',
    actionUrl: '/ventas/historial-pedidos',
    icon: 'fa-truck'
  }
];

export const QUICK_ACTIONS = [
  {
    id: 'nueva-venta',
    title: 'Nueva Venta',
    icon: 'fa-plus-circle',
    color: 'btn-success',
    url: '/ventas/tienda',
    description: 'Iniciar transacción'
  },
  {
    id: 'nuevo-cliente',
    title: 'Nuevo Cliente',
    icon: 'fa-user-plus',
    color: 'btn-info',
    url: '/clientes',
    description: 'Registrar cliente'
  },
  {
    id: 'nuevo-producto',
    title: 'Nuevo Producto',
    icon: 'fa-tshirt',
    color: 'btn-primary',
    url: '/catalogo/productos',
    description: 'Agregar producto'
  },
  {
    id: 'abrir-caja',
    title: 'Abrir Caja',
    icon: 'fa-cash-register',
    color: 'btn-warning',
    url: '/cajas',
    description: 'Iniciar jornada'
  },
  {
    id: 'nueva-devolucion',
    title: 'Devolución',
    icon: 'fa-undo',
    color: 'btn-danger',
    url: '/ventas/devoluciones',
    description: 'Procesar cambio'
  },
  {
    id: 'reportes',
    title: 'Reportes',
    icon: 'fa-chart-bar',
    color: 'btn-dark',
    url: '/informes/ventas',
    description: 'Análisis de ventas'
  }
];

export const TOP_PRODUCTS = [
  {
    id: 1,
    name: 'Remera Básica Blanca',
    variant: 'Talle M',
    sales: 8,
    revenue: '$12.000',
    trend: 'up'
  },
  {
    id: 2,
    name: 'Jeans Slim Fit Negro',
    variant: 'Talle 38',
    sales: 5,
    revenue: '$22.500',
    trend: 'up'
  },
  {
    id: 3,
    name: 'Campera Bomber',
    variant: 'Talle L · Negro',
    sales: 4,
    revenue: '$32.000',
    trend: 'down'
  },
  {
    id: 4,
    name: 'Vestido Floral',
    variant: 'Talle S',
    sales: 3,
    revenue: '$10.500',
    trend: 'up'
  }
];

export const BUSINESS_INFO = {
  horario: '9:00 - 18:00',
  empleadosActivos: 2,
  vendedorActivo: 'María González',
  cajaEstado: 'Abierta',
  horaApertura: '09:15',
  totalTurno: '$2.750',
  ventasTurno: 17,
  ultimaSincronizacion: 'Hace 8 min',
};

export const MAIN_CATEGORIES = [
  {
    id: 1,
    name: 'Remeras / Musculosas',
    count: 38,
    ventas: '$45.200',
    badge: 'bg-primary',
    trend: 'up'
  },
  {
    id: 2,
    name: 'Pantalones / Jeans',
    count: 29,
    ventas: '$87.600',
    badge: 'bg-info',
    trend: 'up'
  },
  {
    id: 3,
    name: 'Camperas / Buzos',
    count: 21,
    ventas: '$112.000',
    badge: 'bg-warning',
    trend: 'down'
  },
  {
    id: 4,
    name: 'Vestidos / Faldas',
    count: 17,
    ventas: '$38.500',
    badge: 'bg-success',
    trend: 'up'
  }
];

export const DASHBOARD_CONFIG = {
  refreshInterval: 30000, // Intervalo de actualización en ms
  cardHeight: {
    min: '300px'
  },
  chartColors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
  }
};
