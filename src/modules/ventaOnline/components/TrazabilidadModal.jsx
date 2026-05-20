import React from 'react';

const ESTADO_CFG = {
  recibido:   { label: 'Recibido',   color: '#0c63e4', bg: '#cfe2ff', icon: 'fa-inbox' },
  confirmado: { label: 'Confirmado', color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-circle-check' },
  preparando: { label: 'Preparando', color: '#c25700', bg: '#ffe5d0', icon: 'fa-gear' },
  preparado:  { label: 'Preparado',  color: '#c25700', bg: '#ffe5d0', icon: 'fa-box-open' },
  enviado:    { label: 'Enviado',    color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-truck' },
  finalizado: { label: 'Finalizado', color: '#198754', bg: '#d1e7dd', icon: 'fa-check-double' },
  entregado:  { label: 'Entregado', color: '#198754', bg: '#d1e7dd', icon: 'fa-check-double' },
  cancelado:  { label: 'Cancelado', color: '#dc3545', bg: '#f8d7da', icon: 'fa-circle-xmark' },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_CFG[estado] || { label: estado, color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle' };
  return (
    <span className="badge rounded-pill d-inline-flex align-items-center gap-1"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 600 }}>
      <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.65rem' }} />
      {cfg.label}
    </span>
  );
};

const TrazabilidadModal = ({ show, onClose, pedido }) => {
  if (!show || !pedido) return null;

  const ordenada = [...(pedido.trazabilidad || [])]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const fmtFecha = (str) => {
    const d = new Date(str);
    return {
      fecha: d.toLocaleDateString('es-AR'),
      hora:  d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

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
              <i className="fa fa-route" style={{ color: '#fff' }} />
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-bold" style={{ color: '#fff' }}>Trazabilidad del Pedido</h5>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>{pedido.numeroPedido}</div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          {/* Resumen rápido */}
          <div className="px-4 py-3 border-bottom d-flex flex-wrap gap-4"
            style={{ backgroundColor: '#f8f9fa' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cliente</div>
              <div className="fw-semibold small">{pedido.cliente}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fecha</div>
              <div className="fw-semibold small">{new Date(pedido.fecha).toLocaleDateString('es-AR')}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</div>
              <div className="fw-semibold small text-success">${pedido.total?.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado actual</div>
              <EstadoBadge estado={pedido.estado} />
            </div>
          </div>

          {/* Timeline */}
          <div className="modal-body py-4 px-4">
            {ordenada.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fa fa-route fa-2x d-block mb-2 opacity-25" />
                No hay historial de trazabilidad disponible
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 36 }}>
                {/* Línea vertical */}
                <div style={{
                  position: 'absolute',
                  left: 15,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#dee2e6',
                }} />

                {ordenada.map((evento, idx) => {
                  const cfg = ESTADO_CFG[evento.estado] || { label: evento.estado, color: '#6c757d', bg: '#e9ecef', icon: 'fa-circle' };
                  const { fecha, hora } = fmtFecha(evento.fecha);
                  const isFirst = idx === 0;

                  return (
                    <div key={evento.id} style={{ position: 'relative', marginBottom: idx < ordenada.length - 1 ? 20 : 0 }}>
                      {/* Marker */}
                      <div style={{
                        position: 'absolute',
                        left: -21,
                        top: 4,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isFirst ? cfg.bg : '#fff',
                        border: `2px solid ${isFirst ? cfg.color : '#dee2e6'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isFirst ? cfg.color : '#adb5bd',
                        fontSize: '0.72rem',
                      }}>
                        <i className={`fa ${cfg.icon}`} />
                      </div>

                      {/* Content card */}
                      <div className="rounded-3 px-3 py-2"
                        style={{
                          backgroundColor: isFirst ? cfg.bg : '#f8f9fa',
                          borderLeft: `3px solid ${isFirst ? cfg.color : '#dee2e6'}`,
                        }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <EstadoBadge estado={evento.estado} />
                            {evento.usuario && (
                              <span className="ms-2 small text-muted">{evento.usuario}</span>
                            )}
                          </div>
                          <span className="text-muted" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                            {fecha} · {hora}
                          </span>
                        </div>
                        {evento.notas && (
                          <div className="mt-1 small text-muted">
                            <i className="fa fa-comment me-1" />{evento.notas}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer border-top">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>Cerrar</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TrazabilidadModal;
