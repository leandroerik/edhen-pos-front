import { useState, useCallback } from 'react';

/**
 * Hook para gestionar datos de ventas
 */
export const useVentasData = (initialData = []) => {
  const [ventas, setVentas] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({});

  const addVenta = useCallback((venta) => {
    setVentas(prev => [...prev, { ...venta, id: Date.now() }]);
  }, []);

  const updateVenta = useCallback((id, updates) => {
    setVentas(prev => 
      prev.map(v => v.id === id ? { ...v, ...updates } : v)
    );
  }, []);

  const deleteVenta = useCallback((id) => {
    setVentas(prev => prev.filter(v => v.id !== id));
  }, []);

  const filterByEstado = useCallback((estado) => {
    setFiltros(prev => ({ ...prev, estado }));
  }, []);

  return {
    ventas,
    loading,
    setLoading,
    filtros,
    addVenta,
    updateVenta,
    deleteVenta,
    filterByEstado
  };
};
