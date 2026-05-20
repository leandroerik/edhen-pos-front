import { useState, useCallback } from 'react';
import {
  listarPedidos,
  crearPedido,
  obtenerPedido,
  actualizarPedido,
  cambiarEstadoPedido,
  eliminarPedido
} from '../services/pedidosOnlineService';

export const usePedidosOnline = (initialPedidos = []) => {
  const [pedidos, setPedidos] = useState(initialPedidos);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedidos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await listarPedidos(filtros);
      const data = response?.data ?? response;
      setPedidos(Array.isArray(data) ? data : data || []);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPedido = useCallback(async (pedido) => {
    setLoading(true);
    setError(null);
    try {
      const response = await crearPedido(pedido);
      const data = response?.data ?? response;
      setPedidos(prev => [...prev, data]);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPedido = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await obtenerPedido(id);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePedido = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await actualizarPedido(id, updates);
      const data = response?.data ?? response;
      setPedidos(prev => prev.map(p => p.id === id ? data : p));
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePedidoStatus = useCallback(async (id, nuevoEstado) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cambiarEstadoPedido(id, nuevoEstado);
      const data = response?.data ?? response;
      setPedidos(prev => prev.map(p => p.id === id ? data : p));
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePedido = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eliminarPedido(id);
      if (response?.success || response?.data?.success) {
        setPedidos(prev => prev.filter(p => p.id !== id));
      }
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pedidos,
    loading,
    error,
    loadPedidos,
    createPedido,
    getPedido,
    updatePedido,
    changePedidoStatus,
    deletePedido,
    setPedidos
  };
};
