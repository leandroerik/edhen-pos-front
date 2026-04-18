/**
 * Configuración centralizada del Catálogo
 */

export const CATALOGO_SECTIONS = [
  {
    id: 'categorias',
    label: 'Categorías',
    icon: 'fa-list',
    path: '/catalogo/categorias'
  },
  {
    id: 'atributos',
    label: 'Atributos',
    icon: 'fa-tag',
    path: '/catalogo/atributos'
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: 'fa-box',
    path: '/catalogo/productos'
  },
  {
    id: 'ofertas',
    label: 'Ofertas',
    icon: 'fa-percent',
    path: '/catalogo/ofertas'
  }
];

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const CATALOGO_CONFIG = {
  defaultPageSize: 10,
  enableSearch: true,
  enableFilter: true,
  enablePagination: true
};