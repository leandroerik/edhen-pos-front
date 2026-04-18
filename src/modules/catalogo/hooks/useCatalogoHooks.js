import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestionar paginación
 * @param {Array} items - Array de items a paginar
 * @param {number} initialPageSize - Tamaño inicial de página
 * @returns {Object} Estado de paginación
 */
export const usePagination = (items = [], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(items.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  const handlePageChange = useCallback((page) => {
    const validPage = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(validPage);
  }, [totalPages]);

  const handlePageSizeChange = useCallback((size) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange
  };
};

/**
 * Hook personalizado para gestionar búsqueda y filtrado
 * @param {Array} items - Array de items a buscar/filtrar
 * @returns {Object} Estado de búsqueda y filtrado
 */
export const useSearchFilter = (items = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key]) === String(value);
    });

    return matchesSearch && matchesFilters;
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilters({});
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredItems
  };
};
