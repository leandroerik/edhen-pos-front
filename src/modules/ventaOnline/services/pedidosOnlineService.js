import api from '../../../services/api';
import { mockPedidosOnlineService } from '../../../services/mocks';

const API_BASE_URL = '/api/pedidos-online';
const useMock = process.env.REACT_APP_USE_MOCK_PEDIDOS_ONLINE !== 'false';

/**
 * Lista todos los pedidos
 */
export const listarPedidos = async (filtros = {}) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.listar(filtros);
    }
    return await api.get(`${API_BASE_URL}`, { params: filtros });
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene un pedido por ID
 */
export const obtenerPedido = async (id) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.obtener(id);
    }
    return await api.get(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    throw error;
  }
};

/**
 * Crea un nuevo pedido
 */
export const crearPedido = async (pedidoData) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.crear(pedidoData);
    }
    return await api.post(API_BASE_URL, pedidoData);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Actualiza un pedido existente
 */
export const actualizarPedido = async (id, pedidoData) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.actualizar(id, pedidoData);
    }
    return await api.put(`${API_BASE_URL}/${id}`, pedidoData);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    throw error;
  }
};

/**
 * Cambia el estado de un pedido
 */
export const cambiarEstadoPedido = async (id, nuevoEstado) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.cambiarEstado(id, nuevoEstado);
    }
    return await api.patch(`${API_BASE_URL}/${id}/estado`, { estado: nuevoEstado });
  } catch (error) {
    console.error('Error al cambiar estado del pedido:', error);
    throw error;
  }
};

/**
 * Elimina un pedido
 */
export const eliminarPedido = async (id) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.eliminar(id);
    }
    return await api.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pedidos
 */
export const obtenerEstadisticas = async (fechaDesde, fechaHasta) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.obtenerEstadisticas(fechaDesde, fechaHasta);
    }
    return await api.get(`${API_BASE_URL}/estadisticas`, { params: { fechaDesde, fechaHasta } });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Exporta pedidos a CSV
 */
export const exportarPedidos = async (filtros = {}) => {
  try {
    if (useMock) {
      return await mockPedidosOnlineService.exportar(filtros);
    }
    return await api.get(`${API_BASE_URL}/exportar`, { params: filtros, responseType: 'blob' });
  } catch (error) {
    console.error('Error al exportar pedidos:', error);
    throw error;
  }
};
