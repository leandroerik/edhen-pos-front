/**
 * Configuración centralizada del menú de navegación
 * Permite mantener el menú en un solo lugar y facilita actualizaciones
 */
export const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Panel de Control',
    icon: 'fa-tachometer-alt',
    path: '/'
  },
  {
    id: 'catalogo',
    label: 'Catálogo',
    icon: 'fa-cube',
    submenu: [
      { label: 'Categorías', path: '/categorias' },
      { label: 'Productos', path: '/productos' },
      { label: 'Ofertas', path: '/ofertas' }
    ]
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'fa-shopping-cart',
    submenu: [
      { label: 'Ventas en Tienda', path: '/ventas/tienda' },
      { label: 'Ventas en Internet', path: '/ventas/internet' },
      { label: 'Devoluciones', path: '/devoluciones' }
    ]
  },
  {
    id: 'cajas',
    label: 'Cajas',
    icon: 'fa-cash-register',
    path: '/cajas'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: 'fa-users',
    path: '/clientes'
  },
  {
    id: 'vendedores',
    label: 'Vendedores',
    icon: 'fa-user-tie',
    path: '/vendedores'
  },
  {
    id: 'informes',
    label: 'Informes',
    icon: 'fa-chart-bar',
    submenu: [
      { label: 'Ventas', path: '/informes/ventas' },
      { label: 'Devoluciones', path: '/informes/devoluciones' },
      { label: 'Productos Vendidos', path: '/informes/productos-vendidos' },
      { label: 'Productos Devueltos', path: '/informes/productos-devueltos' },
      { label: 'Categorías Vendidas', path: '/informes/categorias-vendidas' },
      { label: 'Categorías Devueltas', path: '/informes/categorias-devueltas' },
      { label: 'Vendedores', path: '/informes/vendedores' }
    ]
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: 'fa-cog',
    submenu: [
      { label: 'Opciones', path: '/configuracion/opciones' },
      { label: 'Impresión', path: '/configuracion/impresion' },
      { label: 'Tienda Online', path: '/configuracion/tienda-online' },
      { label: 'Importar Productos', path: '/configuracion/importar/productos' },
      { label: 'Importar Ventas', path: '/configuracion/importar/ventas' }
    ]
  },
  {
    id: 'cuenta',
    label: 'Cuenta Catinfog',
    icon: 'fa-user-circle',
    path: '/cuenta-catinfog'
  }
];
