import { useState, useCallback } from 'react';

/**
 * Hook para gestionar datos de venta online
 */
export const useVentaOnlineData = (initialData = []) => {
  const [pedidos, setPedidos] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const addPedido = useCallback((pedido) => {
    setPedidos(prev => [...prev, { ...pedido, id: Date.now() }]);
  }, []);

  const updatePedido = useCallback((id, updates) => {
    setPedidos(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  }, []);

  const deletePedido = useCallback((id) => {
    setPedidos(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    pedidos,
    loading,
    setLoading,
    addPedido,
    updatePedido,
    deletePedido
  };
};
