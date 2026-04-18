import React, { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { TPVBase } from '../../../../shared/components/TPV';
import { generarComprobanteEnvioPDF } from '../../../../shared/components/TPV/TPVUtils';

const TPVOnline = () => {
  const handleProcessSale = useCallback(async (saleData) => {
    try {
      const pedido = {
        numeroVenta: saleData.numeroVenta,
        fecha: new Date().toLocaleDateString('es-AR'),
        hora: new Date().toLocaleTimeString('es-AR'),
        cliente: saleData.cliente,
        envio: saleData.clienteEnvio,
        items: saleData.carrito,
        subtotal: saleData.subtotal,
        descuento: saleData.descuentoCalculado,
        total: saleData.total,
        formaPago: saleData.formaPago,
        cambio: saleData.cambio,
        estado: 'Pendiente de envío',
        source: 'online'
      };

      // Guardar en localStorage (en producción, esto iría a la API)
      const pedidosGuardados = JSON.parse(localStorage.getItem('pedidosOnline') || '[]');
      pedidosGuardados.push(pedido);
      localStorage.setItem('pedidosOnline', JSON.stringify(pedidosGuardados));

      toast.success('¡Pedido online registrado correctamente!');
      
      // Generar PDF del comprobante de envío
      await generarComprobanteEnvioPDF(pedido);

    } catch (error) {
      console.error('Error al procesar venta online:', error);
      toast.error('Error al procesar el pedido');
    }
  }, []);

  return (
    <TPVBase
      pageTitle="TPV Online - Venta por Internet"
      pageDescription="Gestión de pedidos online con selección de cliente, datos de envío y generación de comprobantes."
      historyLink="/venta-online/historial"
      isOnline={true}
      onProcessSale={handleProcessSale}
    />
  );
};

export default TPVOnline;
