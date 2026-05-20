import React from 'react';

const ESTADO_CFG = {
  recibido:   { label: 'Recibido',   color: '#0c63e4', bg: '#cfe2ff', icon: 'fa-inbox' },
  confirmado: { label: 'Confirmado', color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-circle-check' },
  preparando: { label: 'Preparando', color: '#c25700', bg: '#ffe5d0', icon: 'fa-gear' },
  preparado:  { label: 'Preparado',  color: '#c25700', bg: '#ffe5d0', icon: 'fa-box-open' },
  enviado:    { label: 'Enviado',    color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-truck' },
  finalizado: { label: 'Finalizado', color: '#198754', bg: '#d1e7dd', icon: 'fa-check-double' },
  cancelado:  { label: 'Cancelado', color: '#dc3545', bg: '#f8d7da', icon: 'fa-circle-xmark' },
};

const SIGUIENTE_ESTADO = {
  recibido:  'preparado',
  preparado: 'enviado',
  enviado:   'finalizado',
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_CFG[estado] || { label: estado, color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle' };
  return (
    <span className="badge rounded-pill d-inline-flex align-items-center gap-1"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.8rem', fontWeight: 600, padding: '0.4em 0.8em' }}>
      <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
      {cfg.label}
    </span>
  );
};

const SectionHeader = ({ icon, label }) => (
  <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
    <i className={`fa ${icon} text-primary`} style={{ fontSize: '0.85rem' }} />
    <span className="fw-semibold small text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
  </div>
);

const InfoRow = ({ label, val }) => (
  val ? (
    <div className="d-flex gap-2 mb-1">
      <span className="text-muted small" style={{ minWidth: 90 }}>{label}</span>
      <span className="small fw-semibold">{val}</span>
    </div>
  ) : null
);

const PedidoDetalleModal = ({ show, onClose, pedido, onImprimir, onCambiarEstado }) => {
  if (!show || !pedido) return null;

  const siguienteEstado = SIGUIENTE_ESTADO[pedido.estado];
  const siguienteCfg    = siguienteEstado ? ESTADO_CFG[siguienteEstado] : null;
  const estadoCfg       = ESTADO_CFG[pedido.estado] || { label: pedido.estado, color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle' };

  const env = pedido.envio || {};
  const items = pedido.items || [];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          {/* Header */}
          <div className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ backgroundColor: '#0d6efd', borderRadius: '0.375rem 0.375rem 0 0' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="fa fa-box" style={{ color: '#fff' }} />
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>Detalle del Pedido</h5>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>{pedido.numeroPedido}</div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          {/* Estado bar */}
          <div className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between gap-3 flex-wrap"
            style={{ backgroundColor: estadoCfg.bg }}>
            <div className="d-flex align-items-center gap-3">
              <EstadoBadge estado={pedido.estado} />
              <span className="text-muted small">
                {new Date(pedido.fecha).toLocaleDateString('es-AR')}
                {pedido.hora && ` · ${pedido.hora}`}
              </span>
            </div>
            {siguienteEstado && siguienteCfg && (
              <button
                className="btn btn-sm fw-semibold rounded-pill"
                style={{ backgroundColor: siguienteCfg.bg, color: siguienteCfg.color, border: 'none' }}
                onClick={() => onCambiarEstado(pedido.id, siguienteEstado)}>
                <i className={`fa ${siguienteCfg.icon} me-1`} />
                Pasar a {siguienteCfg.label}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="modal-body py-4 px-4">

            {/* Cliente y envío en dos columnas */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <SectionHeader icon="fa-user" label="Datos del cliente" />
                <InfoRow label="Nombre"    val={pedido.cliente} />
                <InfoRow label="Email"     val={pedido.email} />
                <InfoRow label="Teléfono"  val={pedido.telefono || env.telefono} />
                <InfoRow label="Forma pago" val={pedido.formaPago} />
                {pedido.source === 'online' && (
                  <div className="mt-2">
                    <span className="badge rounded-pill"
                      style={{ backgroundColor: '#cfe2ff', color: '#0d6efd', fontSize: '0.72rem' }}>
                      <i className="fa fa-globe me-1" />Tienda Online
                    </span>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <SectionHeader icon="fa-truck" label="Datos de envío" />
                <InfoRow label="Destinatario" val={env.nombre || pedido.cliente} />
                <InfoRow label="Dirección"    val={env.direccion} />
                <InfoRow label="Ciudad"       val={env.ciudad} />
                <InfoRow label="Código Postal" val={env.codigoPostal} />
                <InfoRow label="Teléfono"     val={env.telefono} />
                {pedido.detallesEnvio?._transporteNombre && (
                  <InfoRow label="Transportista" val={pedido.detallesEnvio._transporteNombre} />
                )}
              </div>
            </div>

            {/* Productos */}
            <SectionHeader icon="fa-shopping-cart" label={`Productos (${items.length})`} />
            <div className="rounded-3 overflow-hidden border">
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th className="ps-3 small text-muted fw-semibold py-2">Producto</th>
                    <th className="text-center small text-muted fw-semibold py-2" style={{ width: '10%' }}>Cant.</th>
                    <th className="text-end small text-muted fw-semibold py-2" style={{ width: '15%' }}>P. Unit.</th>
                    <th className="text-end pe-3 small text-muted fw-semibold py-2" style={{ width: '15%' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="ps-3 small fw-semibold">{item.nombre}</td>
                      <td className="text-center small">{item.cantidad}</td>
                      <td className="text-end small">${item.precio?.toFixed(2) ?? item.precioVenta?.toFixed(2)}</td>
                      <td className="text-end pe-3 small">
                        ${((item.cantidad || 1) * (item.precio ?? item.precioVenta ?? 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {pedido.subtotal != null && pedido.subtotal !== pedido.total && (
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan="3" className="text-end small text-muted pe-2 py-2">Subtotal</td>
                      <td className="text-end pe-3 small">${pedido.subtotal?.toFixed(2)}</td>
                    </tr>
                  )}
                  {pedido.descuento > 0 && (
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <td colSpan="3" className="text-end small text-danger pe-2 py-1">Descuento</td>
                      <td className="text-end pe-3 small text-danger">−${pedido.descuento?.toFixed(2)}</td>
                    </tr>
                  )}
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <td colSpan="3" className="text-end fw-bold pe-2 py-2">Total</td>
                    <td className="text-end pe-3 fw-bold text-success">${pedido.total?.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer border-top px-4 gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Cerrar
            </button>
            <button type="button" className="btn btn-outline-primary btn-sm ms-auto"
              onClick={() => onImprimir(pedido)}>
              <i className="fa fa-print me-1" />Imprimir detalle
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PedidoDetalleModal;
