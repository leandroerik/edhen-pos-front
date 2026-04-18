import jsPDF from 'jspdf';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0.00';
  }
  return `$${parseFloat(amount).toFixed(2)}`;
};

export const loadVentas = () => {
  try {
    return JSON.parse(localStorage.getItem('ventasGuardadas') || '[]');
  } catch (error) {
    return [];
  }
};

export const saveVentas = (ventas) => {
  localStorage.setItem('ventasGuardadas', JSON.stringify(ventas));
};

export const buildVenta = ({
  numeroVenta,
  clienteNombre,
  carrito,
  subtotal,
  descuentoCalculado,
  total,
  formaPago,
  cambio
}) => ({
  id: Date.now(),
  numeroVenta,
  fecha: new Date().toLocaleDateString('es-AR'),
  hora: new Date().toLocaleTimeString('es-AR'),
  cliente: clienteNombre || 'Cliente Anónimo',
  items: carrito,
  subtotal,
  descuento: descuentoCalculado,
  total,
  formaPago,
  cambio,
  estado: 'Completada',
  source: 'local'
});

export const generarReciboPDF = async ({
  numeroVenta,
  cliente,
  carrito,
  subtotal,
  descuentoCalculado,
  total,
  formaPago,
  cambio
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const fecha = new Date().toLocaleDateString('es-AR');
  const hora = new Date().toLocaleTimeString('es-AR');

  let y = 10;

  doc.setFontSize(14);
  doc.text('EDHEN POS', 105, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.text(`Recibo #${numeroVenta}`, 105, y, { align: 'center' });
  y += 5;
  doc.text(`Fecha: ${fecha} ${hora}`, 105, y, { align: 'center' });
  y += 10;

  if (cliente) {
    doc.setFontSize(9);
    doc.text('Cliente:', 10, y);
    doc.text(cliente.nombre, 30, y);
    y += 5;
    if (cliente.email) {
      doc.text(cliente.email, 30, y);
      y += 5;
    }
  }

  y += 5;

  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Producto', 10, y);
  doc.text('Cant', 80, y, { align: 'right' });
  doc.text('Precio', 100, y, { align: 'right' });
  doc.text('Total', 130, y, { align: 'right' });
  y += 5;

  doc.setFont(undefined, 'normal');
  carrito.forEach((item) => {
    const itemTotal = item.precioVenta * item.cantidad;
    doc.text(item.nombre.substring(0, 35), 10, y);
    doc.text(item.cantidad.toString(), 80, y, { align: 'right' });
    doc.text(`$${item.precioVenta.toFixed(2)}`, 100, y, { align: 'right' });
    doc.text(`$${itemTotal.toFixed(2)}`, 130, y, { align: 'right' });
    y += 5;
  });

  y += 5;
  doc.setDrawColor(0);
  doc.line(10, y, 195, y);
  y += 5;

  doc.setFont(undefined, 'bold');
  doc.text('Subtotal:', 100, y, { align: 'right' });
  doc.text(`$${subtotal.toFixed(2)}`, 130, y, { align: 'right' });
  y += 5;

  if (descuentoCalculado > 0) {
    doc.text('Descuento:', 100, y, { align: 'right' });
    doc.text(`-$${descuentoCalculado.toFixed(2)}`, 130, y, { align: 'right' });
    y += 5;
  }

  doc.setFontSize(10);
  doc.text('Total:', 100, y, { align: 'right' });
  doc.text(`$${total.toFixed(2)}`, 130, y, { align: 'right' });
  y += 8;

  doc.setFontSize(8);
  doc.text(`Forma de pago: ${formaPago.toUpperCase()}`, 10, y);
  y += 5;

  if (formaPago === 'efectivo' && cambio > 0) {
    doc.text(`Cambio: $${cambio.toFixed(2)}`, 10, y);
  }

  y += 10;
  doc.setFontSize(7);
  doc.text('¡Gracias por su compra!', 105, y, { align: 'center' });
  doc.text('Conserve este comprobante', 105, y + 3, { align: 'center' });

  doc.save(`recibo_${numeroVenta}_${new Date().getTime()}.pdf`);
};

export const generarComprobanteEnvioPDF = (pedido) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let y = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Encabezado
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('COMPROBANTE DE ENVÍO', pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Número de pedido y fecha
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Pedido #${pedido.numeroVenta}`, 20, y);
  doc.setFont(undefined, 'normal');
  doc.text(`Estado: ${pedido.estado}`, 120, y);
  y += 7;

  doc.setFontSize(10);
  doc.text(`Fecha: ${pedido.fecha}`, 20, y);
  y += 10;

  // Línea separadora
  doc.setDrawColor(0);
  doc.line(15, y, pageWidth - 15, y);
  y += 7;

  // Datos del cliente
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('DATOS DEL CLIENTE', 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Nombre: ${pedido.envio?.nombre || ''} ${pedido.envio?.apellido || ''}`, 20, y);
  y += 5;
  doc.text(`DNI: ${pedido.envio?.dni || 'N/A'}`, 20, y);
  y += 5;
  doc.text(`Teléfono: ${pedido.envio?.telefono || 'N/A'}`, 20, y);
  y += 5;
  doc.text(`Email: ${pedido.envio?.mail || 'N/A'}`, 20, y);
  y += 10;

  // Datos de envío
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('DIRECCIÓN DE ENVÍO', 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`${pedido.envio?.direccion || 'N/A'}`, 20, y);
  y += 5;
  doc.text(`${pedido.envio?.localidad || ''} ${pedido.envio?.provincia || ''} ${pedido.envio?.codigoPostal || ''}`, 20, y);
  y += 10;

  // Transportista
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('TRANSPORTISTA', 20, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`${pedido.envio?.transportista || 'No especificado'}`, 20, y);
  if (pedido.envio?.montoMinimo) {
    y += 5;
    doc.text(`Monto Mínimo: $${parseFloat(pedido.envio.montoMinimo).toFixed(2)}`, 20, y);
  }
  y += 10;

  // Detalles del pedido
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('DETALLES DEL PEDIDO', 20, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Descripción', 20, y);
  doc.text('Cantidad', 120, y, { align: 'right' });
  doc.text('Total', 160, y, { align: 'right' });
  y += 5;

  doc.setFont(undefined, 'normal');
  pedido.items?.forEach((item) => {
    const itemTotal = (item.precioVenta || 0) * item.cantidad;
    const text = item.nombre.substring(0, 60);
    doc.text(text, 20, y);
    doc.text(item.cantidad.toString(), 120, y, { align: 'right' });
    doc.text(`$${itemTotal.toFixed(2)}`, 160, y, { align: 'right' });
    y += 5;

    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }
  });

  y += 5;
  doc.line(15, y, pageWidth - 15, y);
  y += 7;

  // Total
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', 120, y, { align: 'right' });
  doc.text(`$${parseFloat(pedido.total).toFixed(2)}`, 160, y, { align: 'right' });
  y += 12;

  // Código QR o código de barras (opcional)
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.text('Código de Seguimiento:', 20, y);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(12);
  doc.text(`${pedido.numeroVenta}`, 20, y + 5, { align: 'left' });

  // Firma
  y = pageHeight - 25;
  doc.setFontSize(8);
  doc.line(20, y, 80, y);
  doc.text('Firma del Transportista', 20, y + 5);

  doc.line(120, y, 180, y);
  doc.text('Firma del Cliente', 120, y + 5);

  // Pie de página
  doc.setFontSize(7);
  doc.text('Este comprobante debe acompañar al envío. Guárdelo para referencia.', pageWidth / 2, pageHeight - 5, { align: 'center' });

  doc.save(`envio_${pedido.numeroVenta}_${new Date().getTime()}.pdf`);
};
