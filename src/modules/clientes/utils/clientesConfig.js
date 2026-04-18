/**
 * Configuración centralizada de Clientes
 */

export const CLIENTES_SECTIONS = {
  listado: 'listado',
  direcciones: 'direcciones',
  historial: 'historial'
};

export const ESTADO_CLIENTE = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido'
};

export const CLIENTES_CONFIG = {
  defaultPageSize: 10,
  enableSearch: true,
  enableFilter: true,
  columnas: [
    { key: 'nombre', label: 'Nombre', width: '30%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'telefono', label: 'Teléfono', width: '20%' },
    { key: 'estado', label: 'Estado', width: '15%' }
  ]
};
