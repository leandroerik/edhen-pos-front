import React from 'react';

export const PERMISOS_DISPONIBLES = [
  { id: 'ventas',       label: 'Realizar ventas',        icon: 'fa-cart-shopping' },
  { id: 'devoluciones', label: 'Gestionar devoluciones', icon: 'fa-rotate-left' },
  { id: 'clientes',     label: 'Ver clientes',           icon: 'fa-users' },
  { id: 'historial',    label: 'Ver historial',          icon: 'fa-clock-rotate-left' },
  { id: 'caja',         label: 'Gestionar caja',         icon: 'fa-cash-register' },
];

export const FORM_INICIAL = {
  nombre:    '',
  email:     '',
  telefono:  '',
  dni:       '',
  direccion: '',
  estado:    'activo',
  permisos:  ['ventas'],
};

const VendedorForm = ({ editingId, formData, onChange, errors, onSave, onCancel, loading }) => {
  const togglePermiso = (id) => {
    const permisos = formData.permisos.includes(id)
      ? formData.permisos.filter((p) => p !== id)
      : [...formData.permisos, id];
    onChange('permisos', permisos);
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Vendedor' : 'Nuevo Vendedor'}
            </h5>
            <button className="btn-close" onClick={onCancel} disabled={loading} />
          </div>

          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre Completo *</label>
              <input
                type="text"
                className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                value={formData.nombre}
                onChange={(e) => onChange('nombre', e.target.value)}
                placeholder="Ej: Juan Pérez"
                disabled={loading}
              />
              {errors.nombre && <div className="invalid-feedback d-block">{errors.nombre}</div>}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Email *</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="vendedor@ejemplo.com"
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
                  placeholder="11-1234-5678"
                  disabled={loading}
                />
                {errors.telefono && <div className="invalid-feedback d-block">{errors.telefono}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">DNI</label>
                <input
                  type="text"
                  className={`form-control ${errors.dni ? 'is-invalid' : ''}`}
                  value={formData.dni}
                  onChange={(e) => onChange('dni', e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                  disabled={loading}
                />
                {errors.dni && <div className="invalid-feedback d-block">{errors.dni}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Dirección</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.direccion}
                  onChange={(e) => onChange('direccion', e.target.value)}
                  placeholder="Av. Corrientes 1234, CABA"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
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

            <div className="mb-1">
              <label className="form-label fw-semibold">Permisos *</label>
              {errors.permisos && <div className="text-danger small mb-2">{errors.permisos}</div>}
              <div className="row g-2">
                {PERMISOS_DISPONIBLES.map(({ id, label, icon }) => (
                  <div key={id} className="col-md-6">
                    <div
                      className={`border rounded p-2 d-flex align-items-center gap-2 ${
                        formData.permisos.includes(id) ? 'border-primary bg-primary bg-opacity-10' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => !loading && togglePermiso(id)}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input m-0"
                        checked={formData.permisos.includes(id)}
                        onChange={() => togglePermiso(id)}
                        disabled={loading}
                      />
                      <i className={`fa ${icon} text-secondary`} style={{ fontSize: '0.85rem', width: 14 }} />
                      <span className="small">{label}</span>
                    </div>
                  </div>
                ))}
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

export default VendedorForm;
