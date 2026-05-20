import React, { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { TPVBase } from '../../../../shared/components/TPV';
import { usePedidosOnline } from '../../hooks/usePedidosOnline';

const TPVOnline = () => {
  const [datosEnvio, setDatosEnvio] = useState({});

  const { createPedido, updatePedido } = usePedidosOnline();

  const handleProcessSale = useCallback(async (saleData) => {
    const pedido = {
      numeroVenta:    saleData.numeroVenta,
      numeroPedido:   `PED-${String(saleData.numeroVenta).padStart(6, '0')}`,
      fecha:          new Date().toLocaleDateString('es-AR'),
      hora:           new Date().toLocaleTimeString('es-AR'),
      cliente:        saleData.cliente?.nombre || 'Cliente',
      email:          saleData.cliente?.email || '',
      envio:          saleData.clienteEnvio,
      detallesEnvio:  saleData.datosEnvio,
      items:          saleData.carrito,
      subtotal:       saleData.subtotal,
      descuento:      saleData.descuentoCalculado,
      total:          saleData.total,
      formaPago:      saleData.formaPago,
      cambio:         saleData.cambio,
      estado:         'recibido',
      source:         'online',
    };

    const response     = await createPedido(pedido);
    const pedidoCreado = response?.data ?? pedido;

    toast.success('¡Pedido online registrado correctamente!');

    return pedidoCreado;
  }, [createPedido]);

  const handleUpdateShipping = useCallback(async (pedidoId, nuevosDatosEnvio) => {
    try {
      await updatePedido(pedidoId, { detallesEnvio: nuevosDatosEnvio });
      toast.success('Datos de envío actualizados');
    } catch {
      toast.error('Error al actualizar el envío');
    }
  }, [updatePedido]);

  return (
    <TPVBase
      pageTitle="TPV Online - Venta por Internet"
      pageDescription="Gestión de pedidos online con selección de cliente, datos de envío y generación de comprobantes."
      historyLink="/venta-online/historial"
      isOnline={true}
      onProcessSale={handleProcessSale}
      onUpdateShipping={handleUpdateShipping}
      datosEnvio={datosEnvio}
      setDatosEnvio={setDatosEnvio}
    />
  );
};

export default TPVOnline;
