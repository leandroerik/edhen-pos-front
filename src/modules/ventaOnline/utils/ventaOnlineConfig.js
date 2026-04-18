/**
 * Configuración centralizada de Venta Online
 */

export const VENTA_ONLINE_SECTIONS = {
  tpv: 'tpv',
  pendientes: 'pendientes',
  proceso: 'proceso',
  entregadas: 'entregadas'
};

export const ESTADO_PEDIDO_ONLINE = {
  NUEVO: 'nuevo',
  CONFIRMADO: 'confirmado',
  PREPARANDO: 'preparando',
  LISTO: 'listo',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
};

export const VENTA_ONLINE_CONFIG = {
  defaultPageSize: 10,
  columnas: [
    { key: 'numeroPedido', label: 'Número Pedido', width: '15%' },
    { key: 'fecha', label: 'Fecha', width: '15%' },
    { key: 'cliente', label: 'Cliente', width: '25%' },
    { key: 'total', label: 'Total', width: '15%' },
    { key: 'estado', label: 'Estado', width: '15%' },
    { key: 'envio', label: 'Envío', width: '15%' }
  ]
};