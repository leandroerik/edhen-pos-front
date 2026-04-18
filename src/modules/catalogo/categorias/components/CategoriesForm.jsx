/**
 * Componente Form para Categorías
 * Formulario modal para crear/editar categorías
 */
import React, { useState } from 'react';
import { ICONOS_CATEGORIAS, buscarIconos } from '../constants/iconos';

export const CategoriesForm = ({ 
  editingId, 
  formData, 
  setFormData, 
  errors, 
  onSave, 
  onCancel 
}) => {
  const [searchIcono, setSearchIcono] = useState('');
  const iconosFiltered = buscarIconos(searchIcono);
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
            </h5>
            <button 
              className="btn-close"
              onClick={onCancel}
            />
          </div>
          <div className="modal-body p-4">
            <div className="mb-4">
              <label className="form-label fw-semibold">Nombre *</label>
              <input
                type="text"
                className={`form-control form-control-lg ${errors.nombre ? 'is-invalid' : ''}`}
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Remeras, Pantalones, Accesorios"
              />
              {errors.nombre && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.nombre}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                className={`form-control form-control-lg ${errors.descripcion ? 'is-invalid' : ''}`}
                rows="2"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                placeholder="Describe esta categoría de ropa"
              />
              {errors.descripcion && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.descripcion}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold mb-3">
                <i className="fa fa-icons me-2"></i>
                Selecciona un Icono
              </label>
              
              {/* Búsqueda de Iconos */}
              <div className="input-group input-group-lg mb-3">
                <span className="input-group-text bg-light">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Busca por nombre (ej: remera, pantalón, zapato)"
                  value={searchIcono}
                  onChange={(e) => setSearchIcono(e.target.value)}
                />
              </div>

              {/* Galería de Iconos */}
              <div className="border border-2 rounded p-3" style={{ maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                <div className="row g-2">
                  {iconosFiltered.length > 0 ? (
                    iconosFiltered.map(icono => (
                      <div key={icono.value} className="col-4 col-sm-3">
                        <button
                          type="button"
                          className={`btn w-100 p-3 d-flex flex-column align-items-center ${
                            formData.icono === icono.value 
                              ? 'btn-primary border-4' 
                              : 'btn-outline-secondary'
                          }`}
                          onClick={() => setFormData({...formData, icono: icono.value})}
                          title={icono.label}
                        >
                          <i className={`fa ${icono.value} fa-2x mb-2`}></i>
                          <small className="text-center text-truncate w-100">{icono.label}</small>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center text-muted py-5">
                      <i className="fa fa-search fa-2x mb-2 d-block"></i>
                      <p>No se encontraron iconos</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Icono Seleccionado */}
              <div className="mt-3 p-3 bg-light rounded text-center">
                <small className="text-muted d-block mb-2">Icono seleccionado:</small>
                <i className={`fa ${formData.icono || 'fa-cube'} fa-3x text-primary`}></i>
                <div className="small mt-2">
                  <code>{formData.icono || 'fa-cube'}</code>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                />
                <label className="form-check-label fw-semibold" htmlFor="activo">
                  Categoría Activa
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer bg-light border-top">
            <button 
              className="btn btn-secondary"
              onClick={onCancel}
            >
              <i className="fa fa-times me-2"></i>
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={onSave}
            >
              <i className="fa fa-save me-2"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesForm;
