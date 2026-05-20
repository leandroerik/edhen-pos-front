import React, { useState, useEffect, useRef } from 'react';

const AttributesForm = ({ editingId, formData, onChange, errors, onSave, onCancel, loading }) => {
  const [valueInput,      setValueInput]      = useState('');
  const [valueTags,       setValueTags]       = useState([]);
  const [editingTagIndex, setEditingTagIndex] = useState(null);
  const [editingTagValue, setEditingTagValue] = useState('');

  useEffect(() => {
    setValueTags(
      formData.valores
        ? formData.valores.split(',').map((v) => v.trim()).filter(Boolean)
        : []
    );
    setValueInput('');
    setEditingTagIndex(null);
  }, [editingId]);

  const addTag = () => {
    const val = valueInput.trim();
    if (!val || valueTags.includes(val)) return;
    setValueTags([...valueTags, val]);
    setValueInput('');
  };

  const removeTag = (i) => {
    setValueTags(valueTags.filter((_, idx) => idx !== i));
    if (editingTagIndex === i) setEditingTagIndex(null);
  };

  const saveTagEdit = (i) => {
    const val = editingTagValue.trim();
    if (!val) { removeTag(i); return; }
    const next = [...valueTags];
    next[i] = val;
    setValueTags(next);
    setEditingTagIndex(null);
  };

  const handleGuardar = () => onSave({ ...formData, valores: valueTags.join(',') });

  const actionsRef = useRef({});
  actionsRef.current = { onCancel, handleGuardar, loading, valueTags };

  useEffect(() => {
    const handler = (e) => {
      const { loading, onCancel, handleGuardar, valueTags } = actionsRef.current;
      if (loading) return;
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key === 'Enter' && !e.defaultPrevented && e.target.tagName !== 'TEXTAREA') {
        if (valueTags.length > 0) handleGuardar();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const allErrors = errors || {};

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Atributo' : 'Nuevo Atributo'}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>

          <div className="modal-body p-4">

            {/* Nombre */}
            <div className="mb-4">
              <label className="form-label fw-semibold">Nombre del atributo *</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fa fa-tag text-muted"></i>
                </span>
                <input
                  type="text"
                  className={`form-control ${allErrors.nombre ? 'is-invalid' : ''}`}
                  value={formData.nombre || ''}
                  onChange={(e) => onChange('nombre', e.target.value)}
                  placeholder="Ej: Talla, Color, Material"
                  disabled={loading}
                  autoFocus
                />
              </div>
              {allErrors.nombre && (
                <div className="invalid-feedback d-block mt-1">{allErrors.nombre}</div>
              )}
            </div>

            {/* Valores */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="form-label fw-semibold mb-0">Valores</label>
                {valueTags.length > 0 && (
                  <span className="badge rounded-pill text-bg-primary" style={{ fontSize: '0.72rem' }}>
                    {valueTags.length} {valueTags.length === 1 ? 'valor' : 'valores'}
                  </span>
                )}
              </div>

              <div className="input-group mb-2">
                <input
                  type="text"
                  className={`form-control ${allErrors.valores ? 'is-invalid' : ''}`}
                  placeholder="Escribí un valor y presioná Enter"
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={addTag}
                  disabled={loading || !valueInput.trim()}
                >
                  <i className="fa fa-plus me-1"></i>Agregar
                </button>
              </div>

              {allErrors.valores && (
                <div className="invalid-feedback d-block mb-2">{allErrors.valores}</div>
              )}

              <div
                className="border rounded p-3"
                style={{ minHeight: 76, background: '#f8f9fa' }}
              >
                {valueTags.length === 0 ? (
                  <div className="d-flex align-items-center gap-2 text-muted small" style={{ minHeight: 44 }}>
                    <i className="fa fa-circle-info"></i>
                    <span>Agregá al menos un valor para poder guardar</span>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {valueTags.map((tag, i) => (
                      <span key={i}>
                        {editingTagIndex === i ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ width: 120, display: 'inline-block' }}
                            value={editingTagValue}
                            onChange={(e) => setEditingTagValue(e.target.value)}
                            onBlur={() => saveTagEdit(i)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTagEdit(i);
                              if (e.key === 'Escape') setEditingTagIndex(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="badge rounded-pill text-bg-primary"
                            style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                            onClick={() => { setEditingTagIndex(i); setEditingTagValue(tag); }}
                            title="Click para editar"
                          >
                            {tag}
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-2"
                              style={{ fontSize: '0.6rem' }}
                              onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                            />
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {valueTags.length > 0 && (
                <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                  <i className="fa fa-hand-pointer me-1"></i>
                  Click en un valor para editarlo
                </div>
              )}
            </div>

            <hr className="my-3" />

            {/* Estado */}
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="fw-semibold small">Estado</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                  {formData.activo
                    ? 'Disponible para usar en productos'
                    : 'No aparece al crear productos'}
                </div>
              </div>
              <div className="form-check form-switch mb-0 ms-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="atributoActivo"
                  checked={formData.activo ?? true}
                  onChange={(e) => onChange('activo', e.target.checked)}
                  disabled={loading}
                  style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer border-top">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              <i className="fa fa-times me-2"></i>Cancelar
            </button>
            <button
              className="btn btn-primary ms-auto"
              onClick={handleGuardar}
              disabled={loading || valueTags.length === 0}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Guardando…</>
              ) : (
                <><i className="fa fa-save me-2"></i>Guardar</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AttributesForm;
