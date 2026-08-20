import type { MedioPago } from '../types/venta'

export const MEDIOS_PAGO_HABILITADOS: MedioPago[] = ['EFECTIVO', 'TRANSFERENCIA']

export const NOMBRE_MEDIO_PAGO: Record<MedioPago, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA_DEBITO: 'Tarjeta débito',
  TARJETA_CREDITO: 'Tarjeta crédito',
  MERCADO_PAGO: 'Mercado Pago',
  CUENTA_CORRIENTE: 'Cuenta corriente',
}
