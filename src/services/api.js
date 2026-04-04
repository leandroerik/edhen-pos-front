import axios from 'axios';
import {
  mockClienteService,
  mockProductoService,
  mockSkuService,
  mockVentaService,
  mockReporteService,
  mockDocumentoService
} from './mocks';

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const clienteService = mockClienteService;

export const productoService = mockProductoService;

export const skuService = mockSkuService;

export const ventaService = mockVentaService;

export const reporteService = mockReporteService;

export const documentoService = mockDocumentoService;

export default api;
