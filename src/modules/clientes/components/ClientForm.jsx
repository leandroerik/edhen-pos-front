import React from 'react';

const ClientForm = ({ editingId, formData, onChange, errors, onSave, onCancel, loading }) => (
  <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog modal-dialog-centered modal-lg">
      <div className="modal-content">
        <div className="modal-header border-bottom">
          <h5 className="modal-title fw-bold">
            <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
            {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h5>
          <button className="btn-close" onClick={onCancel} disabled={loading} />
        </div>

        <div className="modal-body p-4">
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tipo de Cliente</label>
              <select
                className="form-select"
                value={formData.tipoCliente}
                onChange={(e) => onChange('tipoCliente', e.target.value)}
                disabled={loading}
              >
                <option value="individual">Individual</option>
                <option value="empresa">Empresa</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Estado</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => onChange('estado', e.target.value)}
                disabled={loading}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              {formData.tipoCliente === 'empresa' ? 'Razón Social' : 'Nombre Completo'} *
            </label>
            <input
              type="text"
              className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
              value={formData.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              placeholder={formData.tipoCliente === 'empresa' ? 'Ej: Mi Empresa S.A.' : 'Ej: Juan García'}
              disabled={loading}
            />
            {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
          </div>

          {formData.tipoCliente === 'empresa' && (
            <div className="mb-3">
              <label className="form-label fw-semibold">CUIT / RUC *</label>
              <input
                type="text"
                className={`form-control ${errors.ruc ? 'is-invalid' : ''}`}
                value={formData.ruc}
                onChange={(e) => onChange('ruc', e.target.value)}
                placeholder="Ej: 30-12345678-9"
                disabled={loading}
              />
              {errors.ruc && <div className="invalid-feedback d-block">{errors.ruc}</div>}
            </div>
          )}

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Email *</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
              />
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Teléfono *</label>
              <input
                type="tel"
                className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                value={formData.telefono}
                onChange={(e) => onChange('telefono', e.target.value)}
                placeholder="(011) 1234-5678"
                disabled={loading}
              />
              {errors.telefono && <div className="invalid-feedback d-block">{errors.telefono}</div>}
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

export default ClientForm;
