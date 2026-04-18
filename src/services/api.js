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
  mockDevolucionService
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

export const categoriaService = mockCategoriaService;

export const atributoService = mockAtributoService;

export const usuarioService = mockUsuarioService;

export const devolucionService = mockDevolucionService;

export default api;
