import React from 'react';
import styles from './ClientForm.module.css';

/**
 * Componente ClientForm
 * Modal para crear/editar clientes con validaciones inline
 * Responsabilidad única: renderizar el formulario en modal
 */
const ClientForm = ({ 
  showModal, 
  editingId, 
  formData, 
  validationErrors = {}, 
  touchedFields = {},
  onClose, 
  onChange,
  onFieldBlur,
  onSubmit 
}) => {
  // Helper para obtener clase de validación
  const getFieldClass = (fieldName) => {
    if (!touchedFields[fieldName]) return 'form-control';
    return validationErrors[fieldName] ? 'form-control is-invalid' : 'form-control is-valid';
  };

  // Helper para mostrar error
  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] && validationErrors[fieldName] ? validationErrors[fieldName] : '';
  };

  return (
    <>
      {/* Modal para crear/editar */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose}
                ></button>
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Tipo de Cliente */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="tipoCliente" className="form-label">Tipo de Cliente *</label>
                      <select
                        className="form-select"
                        id="tipoCliente"
                        name="tipoCliente"
                        value={formData.tipoCliente}
                        onChange={onChange}
                        onBlur={onFieldBlur}
                      >
                        <option value="individual">Individual</option>
                        <option value="empresa">Empresa</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="estado" className="form-label">Estado</label>
                      <select
                        className="form-select"
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={onChange}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Nombre or Razón Social */}
                  <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">
                      {formData.tipoCliente === 'empresa' ? 'Razón Social' : 'Nombre Completo'} *
                    </label>
                    <input
                      type="text"
                      className={getFieldClass('nombre')}
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={onChange}
                      onBlur={onFieldBlur}
                      placeholder={formData.tipoCliente === 'empresa' ? 'Ej: Tienda Central EIRL' : 'Ej: Juan García López'}
                    />
                    {getFieldError('nombre') && (
                      <div className="invalid-feedback d-block">
                        <i className="fa fa-exclamation-circle me-1"></i>
                        {getFieldError('nombre')}
                      </div>
                    )}
                    {touchedFields['nombre'] && !validationErrors['nombre'] && (
                      <div className="valid-feedback d-block">
                        <i className="fa fa-check-circle me-1"></i>
                        Correcto
                      </div>
                    )}
                  </div>

                  {/* RUC (solo para empresas) */}
                  {formData.tipoCliente === 'empresa' && (
                    <div className="mb-3">
                      <label htmlFor="ruc" className="form-label">RUC *</label>
                      <input
                        type="text"
                        className={getFieldClass('ruc')}
                        id="ruc"
                        name="ruc"
                        value={formData.ruc}
                        onChange={onChange}
                        onBlur={onFieldBlur}
                        placeholder="Ej: 30-12345678-9"
                      />
                      {getFieldError('ruc') && (
                        <div className="invalid-feedback d-block">
                          <i className="fa fa-exclamation-circle me-1"></i>
                          {getFieldError('ruc')}
                        </div>
                      )}
                      {touchedFields['ruc'] && !validationErrors['ruc'] && (
                        <div className="valid-feedback d-block">
                          <i className="fa fa-check-circle me-1"></i>
                          Correcto
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email y Teléfono */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        type="email"
                        className={getFieldClass('email')}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        onBlur={onFieldBlur}
                        placeholder="Ej: juan@email.com"
                      />
                      {getFieldError('email') && (
                        <div className="invalid-feedback d-block">
                          <i className="fa fa-exclamation-circle me-1"></i>
                          {getFieldError('email')}
                        </div>
                      )}
                      {touchedFields['email'] && !validationErrors['email'] && (
                        <div className="valid-feedback d-block">
                          <i className="fa fa-check-circle me-1"></i>
                          Correcto
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="telefono" className="form-label">Teléfono *</label>
                      <input
                        type="tel"
                        className={getFieldClass('telefono')}
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={onChange}
                        onBlur={onFieldBlur}
                        placeholder="Ej: (011) 1234-5678"
                      />
                      {getFieldError('telefono') && (
                        <div className="invalid-feedback d-block">
                          <i className="fa fa-exclamation-circle me-1"></i>
                          {getFieldError('telefono')}
                        </div>
                      )}
                      {touchedFields['telefono'] && !validationErrors['telefono'] && (
                        <div className="valid-feedback d-block">
                          <i className="fa fa-check-circle me-1"></i>
                          Correcto
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instrucciones para direcciones */}
                  <div className="alert alert-info mt-4" role="alert">
                    <i className="fa fa-info-circle me-2"></i>
                    <strong>Direcciones de Envío:</strong> Usa el botón "Gestionar Direcciones" en la tabla para agregar, editar o eliminar direcciones de envío con datos de transportistas.
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para modal */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default ClientForm;