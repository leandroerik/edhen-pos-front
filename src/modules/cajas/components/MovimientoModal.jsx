import React, { useState, useEffect } from 'react';

const TIPO_CFG = {
  entrada: { label: 'Entrada', color: '#198754', bg: '#d1e7dd', icon: 'fa-circle-plus',  headerBg: '#198754' },
  salida:  { label: 'Salida',  color: '#dc3545', bg: '#f8d7da', icon: 'fa-circle-minus', headerBg: '#dc3545' },
};

const MovimientoModal = ({ show, tipoInicial = 'entrada', onClose, onConfirm, loading = false }) => {
  const [tipo,        setTipo]        = useState(tipoInicial);
  const [monto,       setMonto]       = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errors,      setErrors]      = useState({});

  useEffect(() => {
    if (show) { setTipo(tipoInicial); setMonto(''); setDescripcion(''); setErrors({}); }
  }, [show, tipoInicial]);

  const handleSubmit = () => {
    const newErrors = {};
    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) newErrors.monto = 'Ingresá un monto válido mayor a 0';
    if (!descripcion.trim()) newErrors.descripcion = 'Ingresá una descripción';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    onConfirm(tipo, monto, descripcion);
    setTipo('entrada');
    setMonto('');
    setDescripcion('');
    setErrors({});
  };

  if (!show) return null;

  const cfg = TIPO_CFG[tipo];

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={!loading ? onClose : undefined}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          {/* Header — color cambia con el tipo */}
          <div className="d-flex align-items-center gap-3 px-4 py-3"
            style={{ backgroundColor: cfg.headerBg, borderRadius: '0.375rem 0.375rem 0 0' }}>
            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <i className={`fa ${cfg.icon}`} style={{ color: '#fff' }} />
            </div>
            <h5 className="mb-0 fw-bold flex-grow-1" style={{ color: '#fff' }}>
              {cfg.label} de Dinero
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={loading} />
          </div>

          <div className="modal-body px-4 py-4">

            {/* Selector de tipo */}
            <div className="mb-4">
              <div className="d-flex gap-2">
                {Object.entries(TIPO_CFG).map(([val, c]) => (
                  <button
                    key={val}
                    type="button"
                    className="btn btn-sm flex-fill fw-semibold rounded-pill"
                    style={tipo === val
                      ? { backgroundColor: c.bg, color: c.color, border: `2px solid ${c.color}` }
                      : { backgroundColor: '#f8f9fa', color: '#6c757d', border: '2px solid #dee2e6' }}
                    onClick={() => { setTipo(val); setErrors({}); }}
                    disabled={loading}>
                    <i className={`fa ${c.icon} me-2`} />{c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monto */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Monto ($)</label>
              <div className="input-group">
                <span className="input-group-text bg-white">$</span>
                <input
                  type="number"
                  className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => { setMonto(e.target.value); setErrors((p) => ({ ...p, monto: '' })); }}
                  disabled={loading}
                  step="0.01"
                  min="0"
                  autoFocus
                />
                {errors.monto && <div className="invalid-feedback">{errors.monto}</div>}
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-1">
              <label className="form-label small fw-semibold text-muted">Descripción</label>
              <textarea
                className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                placeholder="Ej: Venta en efectivo, cambio, gasto..."
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setErrors((p) => ({ ...p, descripcion: '' })); }}
                disabled={loading}
                rows={2}
              />
              {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
            </div>
          </div>

          <div className="modal-footer border-top px-4 gap-2">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="button" className="btn btn-sm fw-semibold ms-auto"
              style={{ backgroundColor: cfg.bg, color: cfg.color, border: 'none' }}
              onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2" />Registrando...</>
                : <><i className={`fa ${cfg.icon} me-2`} />Registrar {cfg.label}</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovimientoModal;
