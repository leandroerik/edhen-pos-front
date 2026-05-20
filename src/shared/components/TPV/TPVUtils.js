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

// Genera el HTML del ticket térmico 80mm — mismo formato que usa PedidosList
export const generarTicketHTML = (pedido) => {
  const clienteStr = typeof pedido.cliente === 'string'
    ? pedido.cliente
    : pedido.cliente?.nombre || 'Cliente';

  const telefono = pedido.telefono || pedido.envio?.telefono || '—';

  const itemsRows = (pedido.items || []).map((item) => {
    const precio = item.precio ?? item.precioVenta ?? 0;
    return `
      <tr>
        <td style="padding:4px 2px;border-bottom:1px dashed #ddd">${item.nombre}</td>
        <td style="padding:4px 2px;border-bottom:1px dashed #ddd;text-align:center">${item.cantidad}</td>
        <td style="padding:4px 2px;border-bottom:1px dashed #ddd;text-align:right">$${(item.cantidad * precio).toFixed(2)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Ticket ${pedido.numeroPedido}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    @page{size:80mm auto;margin:0}
    body{font-family:'Courier New',monospace;font-size:12px;color:#111;background:#fff;display:flex;justify-content:center;padding:20px}
    .ticket{width:302px;padding:20px 16px}
    .store{text-align:center;font-size:20px;font-weight:900;letter-spacing:3px;margin-bottom:2px}
    .sub{text-align:center;font-size:10px;color:#777;letter-spacing:1px;margin-bottom:10px}
    .title{text-align:center;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#555;margin:8px 0 3px}
    .num{text-align:center;font-size:16px;font-weight:800;margin-bottom:10px}
    hr.solid{border:none;border-top:2px solid #111;margin:8px 0}
    hr.dash{border:none;border-top:1px dashed #bbb;margin:8px 0}
    .row{display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px}
    .lbl{color:#777}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th{font-size:9px;text-transform:uppercase;color:#777;letter-spacing:.5px;padding:3px 2px 6px;border-bottom:1px solid #333}
    .total-row td{font-size:14px;font-weight:900;padding-top:6px;border-top:2px solid #111}
    .footer{text-align:center;font-size:10px;color:#999;margin-top:12px;line-height:1.8}
    @media print{html,body{height:auto!important;min-height:0!important;padding:0}
      .ticket{width:90mm;margin:0 auto}}
  </style></head><body><div class="ticket">
  <div class="store">EDHEN</div>
  <div class="sub">INDUMENTARIA</div>
  <hr class="solid">
  <div class="title">Pedido Online</div>
  <div class="num">${pedido.numeroPedido}</div>
  <div class="row"><span class="lbl">Fecha</span><span>${new Date(pedido.fecha).toLocaleDateString('es-AR')}</span></div>
  <div class="row"><span class="lbl">Cliente</span><span>${clienteStr}</span></div>
  <div class="row"><span class="lbl">Tel</span><span>${telefono}</span></div>
  ${pedido.envio?.direccion ? `<div class="row"><span class="lbl">Envío</span><span>${pedido.envio.direccion}${pedido.envio.ciudad ? ', ' + pedido.envio.ciudad : ''}</span></div>` : ''}
  ${pedido.detallesEnvio?._transporteNombre ? `<div class="row"><span class="lbl">Transporte</span><span>${pedido.detallesEnvio._transporteNombre}</span></div>` : ''}
  <div class="row"><span class="lbl">Pago</span><span>${pedido.formaPago || '—'}</span></div>
  <hr class="dash">
  <table><thead><tr>
    <th style="text-align:left">Producto</th>
    <th style="text-align:center">Cant</th>
    <th style="text-align:right">Total</th>
  </tr></thead><tbody>${itemsRows}</tbody></table>
  <hr class="dash">
  <table><tbody>
    <tr class="total-row">
      <td colspan="2" style="text-align:right;padding-right:8px">TOTAL</td>
      <td style="text-align:right">$${(pedido.total || 0).toFixed(2)}</td>
    </tr>
  </tbody></table>
  <hr class="solid">
  <div class="footer"><strong>¡Gracias por tu compra!</strong><br>${pedido.numeroPedido}</div>
  </div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
  </body></html>`;
};

// Abre e imprime un ticket térmico desde cualquier pedido
export const imprimirTicket = (pedido) => {
  const w = window.open('', '_blank', 'width=500,height=700,menubar=no,toolbar=no,location=no');
  if (!w) return;
  w.document.write(generarTicketHTML(pedido));
  w.document.close();
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

export const imprimirDocumentoVenta = (datosVenta) => {
  const { numeroVenta, cliente, clienteEnvio, carrito, subtotal, descuentoCalculado, total, formaPago, cambio, datosEnvio } = datosVenta;

  const printWindow = window.open('', '_blank');
  const fechaActual = new Date().toLocaleDateString('es-ES');
  const horaActual = new Date().toLocaleTimeString('es-ES');

  const CAMPOS_RESERVADOS = ['nombre', 'apellido', 'dni', 'direccion', 'codigoPostal', 'localidad', 'provincia', 'telefono', 'email'];

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Factura y Envío - Venta #${numeroVenta}</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; font-size: 12px; line-height: 1.4; }
          .container { display: flex; gap: 20px; max-width: 100%; }
          .column { flex: 1; padding: 15px; border: 1px solid #000; border-radius: 5px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
          .section-title { font-weight: bold; margin: 10px 0 5px 0; text-decoration: underline; }
          .item-row { display: flex; justify-content: space-between; margin: 3px 0; padding: 2px 0; }
          .item-name { flex: 2; font-weight: bold; }
          .item-qty { flex: 0.5; text-align: center; }
          .item-price { flex: 0.8; text-align: right; }
          .item-total { flex: 0.8; text-align: right; font-weight: bold; }
          .total-row { border-top: 1px solid #000; padding-top: 5px; margin-top: 10px; font-weight: bold; font-size: 13px; }
          .field-row { display: flex; margin: 3px 0; }
          .field-label { font-weight: bold; width: 120px; flex-shrink: 0; }
          .field-value { flex: 1; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; border-top: 1px solid #000; padding-top: 10px; }
          @media print { body { margin: 0; } .container { gap: 15px; } .column { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="column">
            <div class="header">FACTURA<br>Sistema Edhen POS</div>
            <div class="field-row"><span class="field-label">Fecha:</span><span class="field-value">${fechaActual} ${horaActual}</span></div>
            <div class="field-row"><span class="field-label">N° Venta:</span><span class="field-value">#${numeroVenta.toString().padStart(6, '0')}</span></div>
            <div class="field-row"><span class="field-label">Cliente:</span><span class="field-value">${cliente?.nombre || 'Cliente Minorista'}</span></div>
            <div class="section-title">PRODUCTOS</div>
            <div class="item-row" style="border-bottom:1px solid #000;margin-bottom:5px;padding-bottom:5px;">
              <span class="item-name">Producto</span><span class="item-qty">Cant</span><span class="item-price">Precio</span><span class="item-total">Total</span>
            </div>
            ${carrito.map(item => `
              <div class="item-row">
                <span class="item-name">${item.nombre}${item.variantLabel ? ` (${item.variantLabel})` : ''}</span>
                <span class="item-qty">${item.cantidad}</span>
                <span class="item-price">$${item.precioVenta.toFixed(2)}</span>
                <span class="item-total">$${(item.precioVenta * item.cantidad).toFixed(2)}</span>
              </div>
            `).join('')}
            <div class="total-row">
              <div class="item-row"><span class="item-name">SUBTOTAL:</span><span class="item-total">$${subtotal.toFixed(2)}</span></div>
              ${descuentoCalculado > 0 ? `<div class="item-row"><span class="item-name">DESCUENTO:</span><span class="item-total">-$${descuentoCalculado.toFixed(2)}</span></div>` : ''}
              <div class="item-row"><span class="item-name">TOTAL:</span><span class="item-total">$${total.toFixed(2)}</span></div>
            </div>
            <div class="field-row" style="margin-top:15px;"><span class="field-label">Forma de Pago:</span><span class="field-value">${formaPago.charAt(0).toUpperCase() + formaPago.slice(1)}</span></div>
            ${formaPago === 'efectivo' && cambio > 0 ? `<div class="field-row"><span class="field-label">Cambio:</span><span class="field-value">$${cambio.toFixed(2)}</span></div>` : ''}
            <div class="footer">¡Gracias por su compra!<br>Sistema Edhen POS</div>
          </div>
          <div class="column">
            <div class="header">DATOS DE ENVÍO<br>Venta #${numeroVenta.toString().padStart(6, '0')}</div>
            <div class="section-title">DESTINATARIO</div>
            <div class="field-row"><span class="field-label">Nombre:</span><span class="field-value">${datosEnvio?.atributos?.nombre || clienteEnvio?.nombre || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Apellido:</span><span class="field-value">${datosEnvio?.atributos?.apellido || clienteEnvio?.apellido || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">DNI:</span><span class="field-value">${datosEnvio?.atributos?.dni || clienteEnvio?.dni || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Dirección:</span><span class="field-value">${datosEnvio?.atributos?.direccion || clienteEnvio?.direccion || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Cód. Postal:</span><span class="field-value">${datosEnvio?.atributos?.codigoPostal || clienteEnvio?.codigoPostal || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Localidad:</span><span class="field-value">${datosEnvio?.atributos?.localidad || clienteEnvio?.localidad || clienteEnvio?.ciudad || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Provincia:</span><span class="field-value">${datosEnvio?.atributos?.provincia || clienteEnvio?.provincia || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Teléfono:</span><span class="field-value">${datosEnvio?.atributos?.telefono || clienteEnvio?.telefono || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Email:</span><span class="field-value">${datosEnvio?.atributos?.email || clienteEnvio?.email || 'No especificado'}</span></div>
            <div class="section-title" style="margin-top:20px;">TRANSPORTISTA</div>
            <div class="field-row"><span class="field-label">Empresa:</span><span class="field-value">${datosEnvio?.transportista || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Servicio:</span><span class="field-value">${datosEnvio?.servicio || 'No especificado'}</span></div>
            <div class="field-row"><span class="field-label">Monto Mín.:</span><span class="field-value">${datosEnvio?.montoMinimo ? '$' + datosEnvio.montoMinimo : 'No especificado'}</span></div>
            ${datosEnvio?.atributos && Object.keys(datosEnvio.atributos).some(k => !CAMPOS_RESERVADOS.includes(k)) ? `
              <div class="section-title" style="margin-top:15px;">ATRIBUTOS ADICIONALES</div>
              ${Object.entries(datosEnvio.atributos)
                .filter(([k]) => !CAMPOS_RESERVADOS.includes(k))
                .map(([k, v]) => `<div class="field-row"><span class="field-label">${k.charAt(0).toUpperCase() + k.slice(1)}:</span><span class="field-value">${v || 'No especificado'}</span></div>`)
                .join('')}
            ` : ''}
            <div class="footer">Datos de envío para transportista<br>Fecha: ${fechaActual}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.onload = () => { printWindow.print(); };
  // fallback en caso que onload no dispare (algunos navegadores)
  setTimeout(() => { if (!printWindow.closed) printWindow.print(); }, 500);
};
