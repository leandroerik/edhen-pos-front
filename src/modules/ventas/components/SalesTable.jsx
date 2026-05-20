import React, { useState, useEffect, useRef } from 'react';

const PAGO_CONFIG = {
  Efectivo:      { color: '#198754', bg: '#d1e7dd', icon: 'fa-money-bill-wave' },
  Tarjeta:       { color: '#0d6efd', bg: '#cfe2ff', icon: 'fa-credit-card' },
  Transferencia: { color: '#6f42c1', bg: '#e8d5ff', icon: 'fa-arrow-right-arrow-left' },
  Cheque:        { color: '#fd7e14', bg: '#ffe5d0', icon: 'fa-money-check' },
};

const ESTADO_CONFIG = {
  Completada: { cls: 'text-bg-success', icon: 'fa-circle-check' },
  Devuelta:   { cls: 'text-bg-danger',  icon: 'fa-rotate-left' },
  Pendiente:  { cls: 'text-bg-warning', icon: 'fa-clock' },
};

function PagoBadge({ formaPago }) {
  const cfg = PAGO_CONFIG[formaPago] || { color: '#6c757d', bg: '#e9ecef', icon: 'fa-question' };
  return (
    <span className="badge rounded-pill d-inline-flex align-items-center gap-1"
      style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.75rem' }}>
      <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.7rem' }} />
      {formaPago}
    </span>
  );
}

function EstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { cls: 'text-bg-secondary', icon: 'fa-circle' };
  return (
    <span className={`badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 ${cfg.cls}`}
      style={{ fontSize: '0.75rem' }}>
      <i className={`fa ${cfg.icon}`} style={{ fontSize: '0.65rem' }} />
      {estado}
    </span>
  );
}

function RowMenu({ venta, onView, onPrint, onDuplicate, onReturn, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="d-flex align-items-center gap-1" ref={ref}>
      <button className="btn btn-sm btn-outline-primary" onClick={() => onView(venta)} title="Ver detalle">
        <i className="fa fa-eye" />
      </button>
      <div className="position-relative">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => setOpen((o) => !o)} title="Más acciones">
          <i className="fa fa-ellipsis-v" />
        </button>
        {open && (
          <div className="position-absolute end-0 top-100 mt-1 bg-white border rounded shadow"
            style={{ zIndex: 1050, minWidth: 160 }}>
            <button className="dropdown-item py-2" onClick={() => { onPrint(venta); setOpen(false); }}>
              <i className="fa fa-print me-2 text-primary" />Imprimir
            </button>
            <button className="dropdown-item py-2" onClick={() => { onDuplicate(venta); setOpen(false); }}>
              <i className="fa fa-copy me-2 text-warning" />Duplicar
            </button>
            <button className="dropdown-item py-2" onClick={() => { onReturn(venta); setOpen(false); }}>
              <i className="fa fa-rotate-left me-2 text-secondary" />Devolución
            </button>
            <div className="dropdown-divider my-0" />
            <button className="dropdown-item py-2 text-danger" onClick={() => { onDelete(venta.id); setOpen(false); }}>
              <i className="fa fa-trash me-2" />Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SalesTable = ({ ventas, loading, onDelete, onView, onPrint, onDuplicate, onReturn }) => (
  <div className="card border shadow-sm">
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead>
          <tr className="table-light border-bottom">
            <th className="ps-3 text-muted fw-semibold small" style={{ width: '9%' }}>ID</th>
            <th className="text-muted fw-semibold small" style={{ width: '13%' }}>Fecha</th>
            <th className="text-muted fw-semibold small" style={{ width: '20%' }}>Cliente</th>
            <th className="text-muted fw-semibold small" style={{ width: '14%' }}>Pago</th>
            <th className="text-muted fw-semibold small text-center" style={{ width: '8%' }}>Items</th>
            <th className="text-muted fw-semibold small text-end" style={{ width: '13%' }}>Total</th>
            <th className="text-muted fw-semibold small" style={{ width: '12%' }}>Estado</th>
            <th className="text-muted fw-semibold small pe-3" style={{ width: '11%' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(8)].map((__, j) => (
                  <td key={j}>
                    <div className="placeholder-glow"><span className="placeholder col-8 rounded" /></div>
                  </td>
                ))}
              </tr>
            ))
          ) : ventas.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-5 text-muted">
                <i className="fa fa-receipt fa-2x d-block mb-2 opacity-25" />
                No se encontraron ventas
              </td>
            </tr>
          ) : (
            ventas.map((venta) => (
              <tr key={venta.id} style={{ borderLeft: venta.source === 'local' ? '3px solid #0d6efd' : '3px solid transparent' }}>
                <td className="ps-3">
                  <span className="badge bg-light text-secondary border fw-semibold" style={{ fontSize: '0.78rem' }}>
                    #{venta.id}
                  </span>
                </td>
                <td>
                  <div className="fw-semibold small">{venta.fecha}</div>
                  {venta.hora && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{venta.hora}</div>}
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                      style={{ width: 30, height: 30, fontSize: '0.72rem', backgroundColor: '#e9ecef', color: '#495057' }}>
                      {venta.cliente?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="small">{venta.cliente}</span>
                  </div>
                </td>
                <td><PagoBadge formaPago={venta.formaPago} /></td>
                <td className="text-center">
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.75rem' }}>
                    {venta.items?.length || 0}
                  </span>
                </td>
                <td className="text-end fw-bold text-success">${venta.total?.toFixed(2) ?? '0.00'}</td>
                <td><EstadoBadge estado={venta.estado} /></td>
                <td className="pe-3">
                  <RowMenu
                    venta={venta}
                    onView={onView}
                    onPrint={onPrint}
                    onDuplicate={onDuplicate}
                    onReturn={onReturn}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default SalesTable;
