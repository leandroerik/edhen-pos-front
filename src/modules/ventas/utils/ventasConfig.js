/**
 * Configuración centralizada de Ventas
 */

export const VENTAS_SECTIONS = {
  tpv: 'tpv',
  historial: 'historial',
  devoluciones: 'devoluciones'
};

export const ESTADO_VENTA = {
  COMPLETADA: 'completada',
  PENDIENTE: 'pendiente',
  DEVUELTA: 'devuelta',
  CANCELADA: 'cancelada'
};

export const METODO_PAGO = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  CHEQUE: 'cheque'
};

export const VENTAS_CONFIG = {
  defaultPageSize: 10,
  columnas: [
    { key: 'numero', label: 'Número', width: '15%' },
    { key: 'fecha', label: 'Fecha', width: '20%' },
    { key: 'cliente', label: 'Cliente', width: '25%' },
    { key: 'total', label: 'Total', width: '15%' },
    { key: 'estado', label: 'Estado', width: '15%' }
  ]
};