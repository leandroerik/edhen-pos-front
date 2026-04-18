import { useState, useCallback } from 'react';

/**
 * Hook para gestionar datos de clientes
 */
export const useClientesData = (initialData = []) => {
  const [clientes, setClientes] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const addCliente = useCallback((cliente) => {
    setClientes(prev => [...prev, { ...cliente, id: Date.now() }]);
  }, []);

  const updateCliente = useCallback((id, updates) => {
    setClientes(prev => 
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  }, []);

  const deleteCliente = useCallback((id) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    clientes,
    loading,
    setLoading,
    addCliente,
    updateCliente,
    deleteCliente
  };
};
