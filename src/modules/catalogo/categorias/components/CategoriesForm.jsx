import React, { useState, useEffect, useRef } from 'react';
import { ICONOS_CATEGORIAS, buscarIconos } from '../constants/iconos';

export const FORM_INICIAL = {
  nombre:      '',
  descripcion: '',
  icono:       'fa-cube',
  activo:      true,
};

const CategoriesForm = ({ editingId, formData, onChange, errors, onSave, onCancel, loading }) => {
  const [searchIcono, setSearchIcono] = useState('');
  const iconosFiltered = buscarIconos(searchIcono);

  const actionsRef = useRef({});
  actionsRef.current = { onSave, onCancel, loading };

  useEffect(() => {
    const handler = (e) => {
      const { loading, onCancel, onSave } = actionsRef.current;
      if (loading) return;
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key === 'Enter' && !e.defaultPrevented && e.target.tagName !== 'TEXTAREA') onSave();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>

          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre *</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                value={formData.nombre}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Ej: Remeras, Pantalones, Accesorios"
                disabled={loading}
              />
              {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                rows="2"
                value={formData.descripcion}
                onChange={(e) => onChange('descripcion', e.target.value)}
                placeholder="Describe esta categoría de ropa"
                disabled={loading}
              />
              {errors.descripcion && <div className="invalid-feedback d-block">{errors.descripcion}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                <i className="fa fa-icons me-2"></i>Selecciona un Icono
              </label>

              <div className="input-group mb-2">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Busca por nombre (ej: remera, pantalón)"
                  value={searchIcono}
                  onChange={(e) => setSearchIcono(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="border rounded p-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
                <div className="row g-2">
                  {iconosFiltered.length > 0 ? (
                    iconosFiltered.map((icono) => (
                      <div key={icono.value} className="col-4 col-sm-3">
                        <button
                          type="button"
                          className={`btn w-100 p-2 d-flex flex-column align-items-center ${
                            formData.icono === icono.value ? 'btn-primary' : 'btn-outline-secondary'
                          }`}
                          onClick={() => onChange('icono', icono.value)}
                          title={icono.label}
                          disabled={loading}
                        >
                          <i className={`fa ${icono.value} fa-lg mb-1`}></i>
                          <small className="text-truncate w-100 text-center">{icono.label}</small>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center text-muted py-4">
                      <i className="fa fa-search fa-lg mb-2 d-block"></i>
                      No se encontraron iconos
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 p-2 border rounded text-center">
                <small className="text-muted d-block mb-1">Seleccionado:</small>
                <i className={`fa ${formData.icono || 'fa-cube'} fa-2x text-primary`}></i>
              </div>
            </div>

            <div className="mb-1">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="categoriaActiva"
                  checked={formData.activo}
                  onChange={(e) => onChange('activo', e.target.checked)}
                  disabled={loading}
                />
                <label className="form-check-label fw-semibold" htmlFor="categoriaActiva">
                  Categoría Activa
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top">
            <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
              <i className="fa fa-times me-2"></i>Cancelar
            </button>
            <button className="btn btn-primary" onClick={onSave} disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
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

export default CategoriesForm;
