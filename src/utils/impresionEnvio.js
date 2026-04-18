/**
 * Genera HTML para imprimir datos de envío para transportistas
 */
export const generarHTMLImpresionEnvio = (envio) => {
  const { cliente, direccion, metodoEnvio, productos, atributosEnvio, total, id } = envio;

  const atributosActivos = atributosEnvio?.filter(attr => attr.activo && attr.valor) || [];

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Datos de Envío - ${cliente.nombre}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          line-height: 1.4;
        }
        .header {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .envio-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }
        .cliente-info, .direccion-info {
          margin-bottom: 15px;
        }
        .productos {
          margin-bottom: 20px;
        }
        .productos table {
          width: 100%;
          border-collapse: collapse;
        }
        .productos th, .productos td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .productos th {
          background: #f8f9fa;
        }
        .atributos {
          margin-bottom: 20px;
        }
        .atributos table {
          width: 100%;
          border-collapse: collapse;
        }
        .atributos th, .atributos td {
          border: 1px solid #ddd;
          padding: 6px;
          text-align: left;
        }
        .total {
          font-size: 18px;
          font-weight: bold;
          text-align: right;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .transportista-seal {
          border: 2px solid #007bff;
          padding: 10px;
          margin: 20px 0;
          background: #e7f3ff;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Sistema EDHEN - Datos de Envío</div>
        <div>ID Pedido: ${id}</div>
        <div>Fecha: ${new Date().toLocaleDateString('es-AR')}</div>
      </div>

      <div class="envio-info">
        <h3>Datos del Transportista</h3>
        <div class="transportista-seal">
          <strong>Método de Envío:</strong> ${metodoEnvio.nombre}<br>
          <strong>Código Cliente:</strong> ${direccion.codigoCliente || 'N/A'}<br>
          <strong>Tipo de Envío:</strong> ${direccion.tipoEnvio || 'Domicilio'}
        </div>
      </div>

      <div class="cliente-info">
        <h4>Datos del Cliente</h4>
        <strong>Nombre:</strong> ${cliente.nombre}<br>
        <strong>Email:</strong> ${cliente.email}<br>
        <strong>Teléfono:</strong> ${cliente.telefono}<br>
        <strong>Localidad:</strong> ${cliente.ciudad}
      </div>

      <div class="direccion-info">
        <h4>Dirección de Entrega</h4>
        ${direccion.calle} ${direccion.numero}
        ${direccion.piso ? `, Piso ${direccion.piso}` : ''}
        ${direccion.depto ? `, Depto ${direccion.depto}` : ''}<br>
        ${direccion.localidad}, ${direccion.provincia}<br>
        <strong>CP:</strong> ${direccion.codigoPostal}<br>
        <strong>Transportista:</strong> ${direccion.transportista}
      </div>

      ${atributosActivos.length > 0 ? `
      <div class="atributos">
        <h4>Información Adicional del Envío</h4>
        <table>
          <thead>
            <tr>
              <th>Atributo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${atributosActivos.map(attr => `
              <tr>
                <td>${attr.nombre}</td>
                <td>${attr.valor}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="productos">
        <h4>Productos</h4>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productos.map(producto => `
              <tr>
                <td>${producto.nombre}</td>
                <td>${producto.cantidad}</td>
                <td>$${producto.precioUnitario?.toFixed(2) || producto.precio?.toFixed(2)}</td>
                <td>$${(producto.precioUnitario * producto.cantidad)?.toFixed(2) || (producto.precio * producto.cantidad)?.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="total">
        Total del Pedido: $${total?.toFixed(2)}
      </div>

      <div class="footer">
        <p><strong>Instrucciones para el transportista:</strong></p>
        <ul>
          <li>Verificar la dirección antes de la entrega</li>
          <li>Contactar al cliente si hay problemas con la dirección</li>
          <li>Solicitar identificación al momento de la entrega</li>
          <li>Notificar cualquier cambio en el estado del envío</li>
        </ul>
        <p>Generado por Sistema EDHEN - ${new Date().toLocaleString('es-AR')}</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Abre una ventana de impresión con los datos del envío
 */
export const imprimirDatosEnvio = (envio) => {
  const htmlContent = generarHTMLImpresionEnvio(envio);

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();

  // Esperar a que se cargue el contenido antes de imprimir
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};