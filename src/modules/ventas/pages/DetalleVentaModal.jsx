import React, { useEffect, useRef } from 'react';

const estadoBadge = (estado) => {
  if (estado === 'Completada') return 'text-bg-success';
  if (estado === 'Devuelta')   return 'text-bg-danger';
  return 'text-bg-warning';
};

const DetalleVentaModal = ({ venta, onClose, onPrint, onDownloadPDF }) => {
  const actionsRef = useRef({});
  actionsRef.current = { onClose, onPrint, venta };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') actionsRef.current.onClose();
      if (e.key === 'Enter')  { actionsRef.current.onPrint(actionsRef.current.venta); actionsRef.current.onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">

          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className="fa fa-receipt me-2 text-primary"></i>
              Detalle de venta #{venta.id}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-0">
            {/* Info chips */}
            <div className="d-flex flex-wrap gap-2 align-items-center p-3 border-bottom bg-light">
              <div className="d-flex align-items-center gap-2 me-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 36, height: 36, backgroundColor: '#e9ecef', color: '#495057', fontSize: '0.85rem' }}>
                  {venta.cliente?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="fw-semibold small">{venta.cliente}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                    <i className="fa fa-calendar me-1" />{venta.fecha} {venta.hora || ''}
                  </div>
                </div>
              </div>
              <span className={`badge rounded-pill px-3 py-2 ${estadoBadge(venta.estado)}`}>{venta.estado}</span>
              <span className="badge rounded-pill px-3 py-2 text-bg-info">{venta.formaPago}</span>
              <span className="badge rounded-pill px-3 py-2 bg-light text-secondary border">
                <i className="fa fa-box me-1" />{venta.items?.length || 0} productos
              </span>
            </div>

            {/* Tabla de productos */}
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Producto</th>
                    <th className="text-center" style={{ width: 70 }}>Cant.</th>
                    <th className="text-end" style={{ width: 110 }}>P. Unit.</th>
                    <th className="text-end pe-3" style={{ width: 110 }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="ps-3">
                        <div className="fw-semibold small">{item.nombre}</div>
                        {item.variantLabel && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{item.variantLabel}</div>}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-secondary border">{item.cantidad}</span>
                      </td>
                      <td className="text-end text-muted small">${item.precioVenta?.toFixed(2) ?? '0.00'}</td>
                      <td className="text-end pe-3 fw-semibold">${((item.precioVenta || 0) * item.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="p-3 border-top bg-light">
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Subtotal</span><span>${venta.subtotal?.toFixed(2) ?? '0.00'}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-danger"><i className="fa fa-tag me-1" />Descuento</span>
                  <span className="text-danger fw-semibold">-${venta.descuento?.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold pt-2 border-top mt-1">
                <span className="fs-6">Total</span>
                <span className="text-success fs-5">${venta.total?.toFixed(2) ?? '0.00'}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top">
            <button className="btn btn-secondary" onClick={onClose}>
              <i className="fa fa-times me-2"></i>Cerrar
            </button>
            <div className="d-flex gap-2 ms-auto">
              {onDownloadPDF && (
                <button className="btn btn-outline-danger" onClick={() => onDownloadPDF(venta)}>
                  <i className="fa fa-file-pdf me-2"></i>PDF
                </button>
              )}
              <button className="btn btn-primary" onClick={() => { onPrint(venta); onClose(); }}>
                <i className="fa fa-print me-2"></i>Imprimir Recibo
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DetalleVentaModal;
