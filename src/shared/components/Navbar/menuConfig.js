/**
 * Configuración centralizada del menú de navegación
 * Permite mantener el menú en un solo lugar y facilita actualizaciones
 */
export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Panel de Control',
    icon: 'fa-tachometer-alt',
    path: '/',
    roles: ['admin']
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    icon: 'fa-cube',
    roles: ['admin'],
    submenu: [
      { label: 'Categorías', path: '/catalogo/categorias', roles: ['admin'] },
      { label: 'Productos', path: '/catalogo/productos', roles: ['admin'] },
      { label: 'Atributos', path: '/catalogo/atributos', roles: ['admin'] },
      { label: 'Ofertas', path: '/catalogo/ofertas', roles: ['admin'] }
    ]
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'fa-shopping-cart',
    roles: ['admin', 'vendedor'],
    submenu: [
      { label: 'Ventas en Tienda', path: '/ventas/tienda', roles: ['admin', 'vendedor'] },
      { label: 'Historial de Ventas', path: '/ventas/historial', roles: ['admin', 'vendedor'] },
      { label: 'Devoluciones y Fallas', path: '/devoluciones', roles: ['admin', 'vendedor'] }
    ]
  },
  {
    id: 'venta-online',
    label: 'Venta Online',
    icon: 'fa-globe',
    roles: ['admin'],
    submenu: [
      { label: 'Nuevo Pedido', path: '/venta-online/nuevo', roles: ['admin'] },
      { label: 'Gestor de Pedidos', path: '/venta-online/gestor', roles: ['admin'] },
      { label: 'Transportes', path: '/venta-online/transportes', roles: ['admin'] },
      { label: 'Historial', path: '/venta-online/historial', roles: ['admin'] }
    ]
  },
  {
    id: 'cajas',
    label: 'Cajas',
    icon: 'fa-cash-register',
    path: '/cajas',
    roles: ['admin']
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'fa-users',
    path: '/clientes',
    roles: ['admin']
  },
  {
    id: 'vendedores',
    label: 'Vendedores',
    icon: 'fa-user-tie',
    path: '/vendedores',
    roles: ['admin']
  },
  {
    id: 'informes',
    label: 'Informes',
    icon: 'fa-chart-bar',
    roles: ['admin'],
    submenu: [
      { label: 'Ventas', path: '/informes/ventas', roles: ['admin'] },
      { label: 'Devoluciones', path: '/informes/devoluciones', roles: ['admin'] },
      { label: 'Productos Vendidos', path: '/informes/productos-vendidos', roles: ['admin'] },
      { label: 'Productos Devueltos', path: '/informes/productos-devueltos', roles: ['admin'] },
      { label: 'Categorías Vendidas', path: '/informes/categorias-vendidas', roles: ['admin'] },
      { label: 'Categorías Devueltas', path: '/informes/categorias-devueltas', roles: ['admin'] },
      { label: 'Vendedores', path: '/informes/vendedores', roles: ['admin'] }
    ]
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'fa-cog',
    roles: ['admin'],
    submenu: [
      { label: 'Parámetros', path: '/configuracion/parametros', roles: ['admin'] },
      { label: 'Google Sheets', path: '/configuracion/google-sheets', roles: ['admin'] },
      { label: 'Integraciones', path: '/configuracion/integraciones', roles: ['admin'] },
      { label: 'Empresa', path: '/configuracion/empresa', roles: ['admin'] },
      { label: 'Impuestos e IVA', path: '/configuracion/impuestos', roles: ['admin'] },
      { label: 'Métodos de Pago', path: '/configuracion/pagos', roles: ['admin'] },
      { label: 'Notificaciones', path: '/configuracion/notificaciones', roles: ['admin'] },
      { label: 'Inventario', path: '/configuracion/inventario', roles: ['admin'] },
      { label: 'Restaurar Backup', path: '/configuracion/importar-bd', roles: ['admin'] },
      { label: 'Crear Backup', path: '/configuracion/exportar-bd', roles: ['admin'] }
    ]
  },
  {
    id: 'mi-perfil',
    label: 'Mi Perfil',
    icon: 'fa-user-circle',
    path: '/mi-perfil',
    roles: ['admin', 'vendedor']
  }
];
