import axios from 'axios';
import {
  mockClienteService,
  mockProductoService,
  mockSkuService,
  mockVentaService,
  mockReporteService,
  mockDocumentoService,
  mockCategoriaService,
  mockAtributoService,
  mockUsuarioService,
  mockDevolucionService,
  mockTransportesService,
  mockPedidosOnlineService
} from './mocks';
import { adminService } from './adminService';

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

export const categoriaService = mockCategoriaService;

export const atributoService = mockAtributoService;

export const usuarioService = mockUsuarioService;

export const devolucionService = mockDevolucionService;

export const transportesService = mockTransportesService;

export const pedidosOnlineService = mockPedidosOnlineService;

export { adminService };

export default api;
