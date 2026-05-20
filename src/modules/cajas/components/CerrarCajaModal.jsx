import React, { useState, useEffect } from 'react';

const CerrarCajaModal = ({ show, onClose, onConfirm, loading = false, montoSistema = 0 }) => {
  const [montoDeclarado, setMontoDeclarado] = useState('');
  const [error, setError] = useState('');

  const diferencia = montoDeclarado && !isNaN(montoDeclarado)
    ? parseFloat(montoDeclarado) - montoSistema
    : null;

  const handleSubmit = () => {
    if (!montoDeclarado || isNaN(montoDeclarado) || parseFloat(montoDeclarado) < 0) {
      setError('Ingresá un monto válido');
      return;
    }
    setError('');
    onConfirm(montoDeclarado);
    setMontoDeclarado('');
  };

  // Reset when closed
  useEffect(() => {
    if (!show) { setMontoDeclarado(''); setError(''); }
  }, [show]);

  if (!show) return null;

  const difPositiva = diferencia > 0;
  const difNula     = diferencia === 0;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={!loading ? onClose : undefined}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <div className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ backgroundColor: '#dc3545', borderRadius: '0.375rem 0.375rem 0 0' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="fa fa-lock" style={{ color: '#fff' }} />
            </div>
            <h5 className="mb-0 fw-bold flex-grow-1" style={{ color: '#fff' }}>Cierre de Caja</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading} />
          </div>

          <div className="modal-body px-4 py-4">

            {/* Monto sistema (readonly) */}
            <div className="mb-4 p-3 rounded-3 border d-flex align-items-center justify-content-between"
              style={{ backgroundColor: '#f8f9fa' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Monto en sistema
                </div>
                <div className="fw-bold fs-4 text-primary">${montoSistema.toFixed(2)}</div>
              </div>
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 44, height: 44, backgroundColor: '#cfe2ff', color: '#0d6efd' }}>
                <i className="fa fa-calculator" />
              </div>
            </div>

            {/* Monto declarado */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">
                Monto declarado en caja ($)
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">$</span>
                <input
                  type="number"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  placeholder="0.00"
                  value={montoDeclarado}
                  onChange={(e) => { setMontoDeclarado(e.target.value); setError(''); }}
                  disabled={loading}
                  step="0.01"
                  min="0"
                  autoFocus
                />
                {error && <div className="invalid-feedback">{error}</div>}
              </div>
            </div>

            {/* Diferencia */}
            {diferencia !== null && (
              <div className="rounded-3 p-3 d-flex align-items-center justify-content-between"
                style={{
                  backgroundColor: difNula ? '#d1e7dd' : difPositiva ? '#cfe2ff' : '#f8d7da',
                  color:           difNula ? '#198754' : difPositiva ? '#0d6efd' : '#dc3545',
                }}>
                <span className="small fw-semibold">
                  <i className={`fa ${difNula ? 'fa-circle-check' : difPositiva ? 'fa-arrow-up' : 'fa-arrow-down'} me-2`} />
                  {difNula ? 'Cuadratura perfecta' : difPositiva ? 'Sobrante' : 'Faltante'}
                </span>
                <span className="fw-bold">
                  {diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer border-top px-4 gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger btn-sm ms-auto"
              onClick={handleSubmit} disabled={loading || !montoDeclarado}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Cerrando...</>
                : <><i className="fa fa-check me-2" />Confirmar cierre</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CerrarCajaModal;
