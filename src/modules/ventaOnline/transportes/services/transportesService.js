import api from '../../../../services/api';
import { mockTransportesService } from '../../../../services/mocks';

const useMock = process.env.REACT_APP_USE_MOCK_TRANSPORTES !== 'false';

/**
 * Servicio de transportes preparado para backend.
 * Usa mocks cuando REACT_APP_USE_MOCK_TRANSPORTES=true o no está definido.
 */

export const getTransportes = async () => {
  if (useMock) {
    const response = await mockTransportesService.listar();
    return response.data;
  }

  const response = await api.get('/transportes');
  return response.data;
};

export const getTransporteById = async (id) => {
  if (useMock) {
    const response = await mockTransportesService.obtener(id);
    return response.data;
  }

  const response = await api.get(`/transportes/${id}`);
  return response.data;
};

export const createTransporte = async (transporte) => {
  if (useMock) {
    const response = await mockTransportesService.crear(transporte);
    return response.data;
  }

  const response = await api.post('/transportes', transporte);
  return response.data;
};

export const updateTransporte = async (id, updates) => {
  if (useMock) {
    const response = await mockTransportesService.actualizar(id, updates);
    return response.data;
  }

  const response = await api.put(`/transportes/${id}`, updates);
  return response.data;
};

export const deleteTransporte = async (id) => {
  if (useMock) {
    const response = await mockTransportesService.eliminar(id);
    return response.data;
  }

  const response = await api.delete(`/transportes/${id}`);
  return response.data;
};

export const searchTransportes = async (term) => {
  if (useMock) {
    const response = await mockTransportesService.buscar(term);
    return response.data;
  }

  const response = await api.get('/transportes', {
    params: { q: term }
  });
  return response.data;
};
