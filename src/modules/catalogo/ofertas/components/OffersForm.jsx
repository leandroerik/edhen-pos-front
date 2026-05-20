import React, { useEffect, useRef } from 'react';
import { variantLabel } from '../variantHelpers';

const OffersForm = ({
  editingId,
  formData,
  onChange,
  errors,
  products = [],
  onSave,
  onCancel,
  loading,
}) => {
  const selectedProduct = products.find((p) => p.id === Number(formData.productoId));
  const hasVariants = selectedProduct?.variants?.length > 0;

  const actionsRef = useRef({});
  actionsRef.current = { onSave, onCancel, formData, loading };

  useEffect(() => {
    const handler = (e) => {
      const { loading, onCancel, onSave, formData } = actionsRef.current;
      if (loading) return;
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key === 'Enter' && !e.defaultPrevented && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        onSave(formData);
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
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">

          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Oferta' : 'Nueva Oferta'}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>

          <div className="modal-body p-4">

            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre *</label>
              <input
                type="text"
                className={`form-control ${allErrors.nombre ? 'is-invalid' : ''}`}
                value={formData.nombre || ''}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Ej: Liquidación fin de temporada"
                disabled={loading}
                autoFocus
              />
              {allErrors.nombre && <div className="invalid-feedback d-block">{allErrors.nombre}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.descripcion || ''}
                onChange={(e) => onChange('descripcion', e.target.value)}
                placeholder="Descripción opcional de la oferta"
                disabled={loading}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className={hasVariants ? 'col-md-6' : 'col-12'}>
                <label className="form-label fw-semibold">Producto *</label>
                <select
                  className={`form-select ${allErrors.productoId ? 'is-invalid' : ''}`}
                  value={formData.productoId || ''}
                  onChange={(e) => onChange('productoId', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Seleccioná un producto…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                {allErrors.productoId && <div className="invalid-feedback d-block">{allErrors.productoId}</div>}
              </div>

              {hasVariants && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Variante *</label>
                  <select
                    className={`form-select ${allErrors.varianteId ? 'is-invalid' : ''}`}
                    value={formData.varianteId || ''}
                    onChange={(e) => onChange('varianteId', e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Seleccioná una variante…</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {variantLabel(v)}
                      </option>
                    ))}
                  </select>
                  {allErrors.varianteId && <div className="invalid-feedback d-block">{allErrors.varianteId}</div>}
                </div>
              )}
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Descuento</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.descuento ?? ''}
                  onChange={(e) => onChange('descuento', e.target.value)}
                  placeholder="0"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tipo</label>
                <select
                  className="form-select"
                  value={formData.tipoDescuento || 'porcentaje'}
                  onChange={(e) => onChange('tipoDescuento', e.target.value)}
                  disabled={loading}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Monto ($)</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Precio Oferta *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className={`form-control ${allErrors.precioOferta ? 'is-invalid' : ''}`}
                    value={formData.precioOferta || ''}
                    onChange={(e) => onChange('precioOferta', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />
                </div>
                {allErrors.precioOferta && <div className="invalid-feedback d-block">{allErrors.precioOferta}</div>}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Stock en oferta</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.stockOferta || ''}
                  onChange={(e) => onChange('stockOferta', e.target.value)}
                  placeholder="Sin límite"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Fecha inicio</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.fechaInicio || ''}
                  onChange={(e) => onChange('fechaInicio', e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Fecha fin</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.fechaFin || ''}
                  onChange={(e) => onChange('fechaFin', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="ofertaActiva"
                checked={formData.activo ?? true}
                onChange={(e) => onChange('activo', e.target.checked)}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="ofertaActiva">
                {formData.activo ? 'Activa' : 'Inactiva'}
              </label>
            </div>

          </div>

          <div className="modal-footer border-top">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              <i className="fa fa-times me-2"></i>Cancelar
            </button>
            <button className="btn btn-primary ms-auto" onClick={() => onSave(formData)} disabled={loading}>
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

export default OffersForm;
