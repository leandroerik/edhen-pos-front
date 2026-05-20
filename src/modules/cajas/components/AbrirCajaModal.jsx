import React, { useEffect, useState } from 'react';

const AbrirCajaModal = ({ show, onClose, onConfirm, loading = false }) => {
  const [montoInicial, setMontoInicial] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (montoInicial === '' || isNaN(montoInicial) || parseFloat(montoInicial) < 0) {
      setError('Ingresá un monto inicial válido (0 o mayor)');
      return;
    }
    setError('');
    onConfirm(montoInicial);
    setMontoInicial('');
  };

  useEffect(() => {
    if (!show) return;
    const handler = (e) => {
      if (loading) return;
      if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, loading, montoInicial]);

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={!loading ? onClose : undefined}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <div className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ backgroundColor: '#0d6efd', borderRadius: '0.375rem 0.375rem 0 0' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className="fa fa-lock-open" style={{ color: '#fff' }} />
            </div>
            <h5 className="mb-0 fw-bold flex-grow-1" style={{ color: '#fff' }}>Abrir Caja</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading} />
          </div>

          <div className="modal-body px-4 py-4">
            <label className="form-label small fw-semibold text-muted">
              Monto inicial en caja ($)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white">$</span>
              <input
                type="number"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                placeholder="0.00"
                value={montoInicial}
                onChange={(e) => { setMontoInicial(e.target.value); setError(''); }}
                disabled={loading}
                step="0.01"
                min="0"
                autoFocus
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>
              <i className="fa fa-circle-info me-1" />Presioná Enter para confirmar o Esc para cerrar.
            </div>
          </div>

          <div className="modal-footer border-top px-4 gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary btn-sm ms-auto" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Abriendo...</>
                : <><i className="fa fa-check me-2" />Abrir Caja</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AbrirCajaModal;
