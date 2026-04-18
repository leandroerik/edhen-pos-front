import { useMemo } from 'react';

/**
 * Hook para calcular descuentos y totales
 * 
 * RESPONSABILIDAD:
 * - Calcular descuento (porcentaje o monto fijo)
 * - Calcular total con descuento
 * - Calcular cambio
 * 
 * @param {number} subtotal - Subtotal del carrito
 * @param {number} descuento - Valor del descuento
 * @param {string} tipoDescuento - 'porcentaje' o 'monto'
 * @param {number} montoPagado - Monto pagado por cliente
 * @returns {Object} { descuentoCalculado, total, cambio }
 */
export const useCalculoTotal = (subtotal, descuento, tipoDescuento = 'porcentaje', montoPagado = 0) => {
  const descuentoCalculado = useMemo(() => {
    if (tipoDescuento === 'porcentaje') {
      return (subtotal * descuento) / 100;
    }
    return Math.min(descuento, subtotal); // No puede descontar más del subtotal
  }, [subtotal, descuento, tipoDescuento]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - descuentoCalculado);
  }, [subtotal, descuentoCalculado]);

  const cambio = useMemo(() => {
    return Math.max(0, montoPagado - total);
  }, [montoPagado, total]);

  return {
    descuentoCalculado,
    total,
    cambio
  };
};
