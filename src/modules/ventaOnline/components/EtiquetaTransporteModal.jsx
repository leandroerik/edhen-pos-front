import React from 'react';

const EtiquetaTransporteModal = ({ show, onClose, pedido, onImprimir, onCopiar }) => {
  if (!show || !pedido) return null;

  const env = pedido.envio || {};

  const etiquetaTexto = [
    `DESTINATARIO: ${env.nombre || pedido.cliente || ''}`,
    `DIRECCIÓN:    ${env.direccion || ''}`,
    `LOCALIDAD:    ${env.ciudad || ''} ${env.codigoPostal || ''}`.trim(),
    `TELÉFONO:     ${env.telefono || pedido.telefono || ''}`,
    `PEDIDO:       ${pedido.numeroPedido}`,
  ].join('\n');

  const rows = [
    { icon: 'fa-user',        label: 'Destinatario', val: env.nombre || pedido.cliente },
    { icon: 'fa-location-dot',label: 'Dirección',    val: env.direccion },
    { icon: 'fa-city',        label: 'Localidad',    val: [env.ciudad, env.codigoPostal].filter(Boolean).join(' · ') },
    { icon: 'fa-phone',       label: 'Teléfono',     val: env.telefono || pedido.telefono },
    { icon: 'fa-receipt',     label: 'N.º Pedido',   val: pedido.numeroPedido },
  ].filter((r) => r.val);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          {/* Header */}
          <div className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ backgroundColor: '#198754', borderRadius: '0.375rem 0.375rem 0 0' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="fa fa-tag" style={{ color: '#fff' }} />
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>Etiqueta de Transporte</h5>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>{pedido.numeroPedido}</div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          {/* Body */}
          <div className="modal-body p-4">

            {/* Datos de la etiqueta */}
            <div className="rounded-3 p-4 mb-3"
              style={{ backgroundColor: '#f8f9fa', border: '2px solid #dee2e6' }}>
              {rows.map(({ icon, label, val }) => (
                <div key={label} className="d-flex align-items-start gap-3 mb-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32, backgroundColor: '#d1e7dd', color: '#198754' }}>
                    <i className={`fa ${icon}`} style={{ fontSize: '0.8rem' }} />
                  </div>
                  <div>
                    <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </div>
                    <div className="fw-semibold small">{val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista previa de texto para imprimir */}
            <div>
              <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vista previa de texto
              </div>
              <pre style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '0.82rem',
                lineHeight: 1.9,
                margin: 0,
                whiteSpace: 'pre-wrap',
                color: '#212529',
                backgroundColor: '#fff',
                border: '1px dashed #ced4da',
                borderRadius: '0.375rem',
                padding: '12px 16px',
              }}>
                {etiquetaTexto}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-top px-4 py-3 gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm"
              onClick={() => { onCopiar(etiquetaTexto); onClose(); }}>
              <i className="fa fa-copy me-2" />Copiar texto
            </button>
            <button type="button" className="btn btn-success btn-sm ms-auto"
              onClick={() => { onImprimir(pedido); onClose(); }}>
              <i className="fa fa-print me-2" />Imprimir etiqueta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EtiquetaTransporteModal;
