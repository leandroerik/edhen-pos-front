/**
 * Servicio de Devoluciones
 * Gestiona registros de devoluciones y fallas de productos
 * 
 * IMPORTANTE: Este archivo está preparado para migrar fácilmente al backend.
 * Solo necesitarás cambiar las URLs base en los endpoints reales.
 */

import api from '../../../services/api';

const BASE_URL = '/api/devoluciones';

export const devolucionesService = {
  /**
   * Listar todas las devoluciones y fallas
   * @returns {Promise} Lista de devoluciones
   */
  listar: async () => {
    // BACKEND: GET /api/devoluciones
    return api.get(`${BASE_URL}`);
  },

  /**
   * Listar devoluciones por tipo
   * @param {string} tipo - 'devueltas' o 'fallas'
   * @returns {Promise} Lista filtrada
   */
  listarPorTipo: async (tipo) => {
    // BACKEND: GET /api/devoluciones?tipo=devueltas
    return api.get(`${BASE_URL}`, { params: { tipo } });
  },

  /**
   * Listar devoluciones de un cliente específico
   * @param {number} clienteId - ID del cliente
   * @returns {Promise} Lista de devoluciones del cliente
   */
  listarPorCliente: async (clienteId) => {
    // BACKEND: GET /api/devoluciones/cliente/:clienteId
    return api.get(`${BASE_URL}/cliente/${clienteId}`);
  },

  /**
   * Listar devoluciones de una venta específica
   * @param {number} ventaId - ID de la venta
   * @returns {Promise} Lista de devoluciones vinculadas
   */
  listarPorVenta: async (ventaId) => {
    // BACKEND: GET /api/devoluciones/venta/:ventaId
    return api.get(`${BASE_URL}/venta/${ventaId}`);
  },

  /**
   * Registrar una nueva devolución o falla
   * @param {Object} devolucion - Objeto con datos de la devolución
   * @returns {Promise} Devolución creada
   */
  crear: async (devolucion) => {
    // BACKEND: POST /api/devoluciones
    // Body esperado:
    // {
    //   tipo: 'devueltas' | 'fallas',
    //   ventaId: number | null,
    //   ventaNumero: number | null,
    //   clienteId: number,
    //   cliente: string,
    //   productoId: number,
    //   producto: string,
    //   varianteId: string,
    //   variante: string,
    //   cantidad: number,
    //   motivo: string,
    //   descripcion: string,
    //   reembolso: 'Dinero devuelto' | 'Crédito tienda' | 'Cambio de producto',
    //   stockAnterior: number,
    //   stockPosterior: number,
    //   registradoPor: string (ID del usuario),
    //   fecha: ISO string
    // }
    return api.post(`${BASE_URL}`, devolucion);
  },

  /**
   * Obtener detale de una devolución específica
   * @param {number} id - ID de la devolución
   * @returns {Promise} Dados de la devolución
   */
  obtener: async (id) => {
    // BACKEND: GET /api/devoluciones/:id
    return api.get(`${BASE_URL}/${id}`);
  },

  /**
   * Actualizar una devolución/falla registrada
   * @param {number} id - ID de la devolución
   * @param {Object} datos - Datos actualizados
   * @returns {Promise} Devolución actualizada
   */
  actualizar: async (id, datos) => {
    // BACKEND: PUT /api/devoluciones/:id
    return api.put(`${BASE_URL}/${id}`, datos);
  },

  /**
   * Eliminar un registro de devolución/falla
   * @param {number} id - ID de la devolución
   * @returns {Promise} Confirmación de eliminación
   */
  eliminar: async (id) => {
    // BACKEND: DELETE /api/devoluciones/:id
    return api.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Obtener estadísticas de devoluciones
   * @returns {Promise} Objeto con estadísticas
   */
  obtenerEstadisticas: async () => {
    // BACKEND: GET /api/devoluciones/estadisticas
    // Response esperado:
    // {
    //   totalDevueltas: number,
    //   totalFallas: number,
    //   stockRecuperado: number,
    //   stockPerdido: number,
    //   motivosComunes: { motivo: count, ... },
    //   ultimasDevolucionesHoy: number
    // }
    return api.get(`${BASE_URL}/estadisticas`);
  },

  /**
   * Procesar reembolso de una devolución
   * @param {number} devolucionId - ID de la devolución
   * @param {Object} datosReembolso - Datos del reembolso
   * @returns {Promise} Confirmación de reembolso
   */
  procesarReembolso: async (devolucionId, datosReembolso) => {
    // BACKEND: POST /api/devoluciones/:devolucionId/reembolso
    // Body esperado:
    // {
    //   tipo: 'Dinero devuelto' | 'Crédito tienda' | 'Cambio de producto',
    //   monto: number (opcional, si es dinero),
    //   metodoPago: string (cómo se devolvió),
    //   referenciaPago: string (para auditoría)
    // }
    return api.post(`${BASE_URL}/${devolucionId}/reembolso`, datosReembolso);
  },

  /**
   * Exportar historial de devoluciones a CSV
   * @param {Object} filtros - Filtros a aplicar
   * @returns {Promise} URL para descargar CSV
   */
  exportarCSV: async (filtros = {}) => {
    // BACKEND: GET /api/devoluciones/exportar/csv?tipo=...&desde=...&hasta=...
    return api.get(`${BASE_URL}/exportar/csv`, { params: filtros });
  }
};

export default devolucionesService;
