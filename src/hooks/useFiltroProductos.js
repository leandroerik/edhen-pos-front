import { useState, useMemo, useEffect, useRef } from 'react';

/**
 * Hook para filtrar y buscar productos
 * 
 * RESPONSABILIDAD:
 * - Filtrar por categoría
 * - Buscar con debounce
 * - Paginar resultados
 * - Ordenar resultados
 * 
 * @param {Array} productos - Lista de productos a filtrar
 * @param {number} itemsPerPage - Items por página
 * @returns {Object} { 
 *   productosFiltrados, 
 *   productosPaginados, 
 *   totalPages, 
 *   currentPage, 
 *   setCurrentPage,
 *   ...filtros
 * }
 */
export const useFiltroProductos = (productos, itemsPerPage = 12) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const debounceTimeoutRef = useRef(null);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setBusquedaDebounced(busqueda);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [busqueda]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    // Filtro por categoría
    if (categoriaSeleccionada !== 'Todas') {
      filtered = filtered.filter(p => p.categoria === categoriaSeleccionada);
    }

    // Filtro por búsqueda
    if (busquedaDebounced) {
      const searchLower = busquedaDebounced.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.codigo?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [productos, categoriaSeleccionada, busquedaDebounced]);

  // Paginar
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const productosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return productosFiltrados.slice(startIndex, startIndex + itemsPerPage);
  }, [productosFiltrados, currentPage]);

  // Extraer categorías disponibles
  const categoriasDisponibles = useMemo(() => {
    const categorias = ['Todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))];
    return categorias;
  }, [productos]);

  return {
    // Estado
    busqueda,
    setBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    currentPage,
    setCurrentPage,
    
    // Resultados
    productosFiltrados,
    productosPaginados,
    totalPages,
    categoriasDisponibles
  };
};
