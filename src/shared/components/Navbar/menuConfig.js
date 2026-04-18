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
      { label: 'Categorías', path: '/catalogo/categorias' },
      { label: 'Productos', path: '/catalogo/productos' },
      { label: 'Atributos', path: '/catalogo/atributos' },
      { label: 'Ofertas', path: '/catalogo/ofertas' }
    ]
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: 'fa-shopping-cart',
    submenu: [
      { label: 'Ventas en Tienda', path: '/ventas/tienda' },
      { label: 'Historial de Ventas', path: '/ventas/historial' },
      { label: 'Devoluciones y Fallas', path: '/devoluciones' }
    ]
  },
  {
    id: 'venta-online',
    label: 'Venta Online',
    icon: 'fa-globe',
    submenu: [
      { label: 'Nuevo Pedido', path: '/venta-online/nuevo' },
      { label: 'Gestor de Pedidos', path: '/venta-online/gestor' },
      { label: 'Pendientes', path: '/venta-online/pendientes' },
      { label: 'En Proceso', path: '/venta-online/proceso' },
      { label: 'Historial', path: '/venta-online/historial' }
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
    path: '/cuenta-catinfog