/**
 * Módulo de Catálogo
 * Exporta todos los componentes, páginas, hooks y utilidades
 */

export { default as Catalogo } from './Catalogo';
export { default } from './Catalogo';

// Exporta componentes reutilizables
export { default as CatalogoTable } from './components/CatalogoTable';
export { default as SearchFilterBar } from './components/SearchFilterBar';
export { default as PaginationControls } from './components/PaginationControls';

// Exporta páginas desde las subsecciones
export { default as CategoriesPage } from './categorias';
export { default as ProductsPage } from './productos';
export { default as AttributesPage } from './atributos';
export { default as OffersPage } from './ofertas';

// Exporta hooks y utilidades
export { usePagination, useSearchFilter } from './hooks/useCatalogoHooks';
export { validaciones, validateObject } from './utils/validators';
export { CATALOGO_SECTIONS, ITEMS_PER_PAGE_OPTIONS, CATALOGO_CONFIG } from './utils/catalogoConfig';