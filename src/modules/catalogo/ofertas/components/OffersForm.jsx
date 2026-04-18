/**
 * Componente Form para Ofertas
 * Formulario modal para crear/editar ofertas
 */
import React from 'react';

export const OffersForm = ({ 
  editingId, 
  formData, 
  setFormData, 
  errors, 
  products = [],
  onSave, 
  onCancel 
}) => {
  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h5 className="modal-title fw-bold">
              <i className={`fa ${editingId ? 'fa-edit' : 'fa-plus'} me-2`}></i>
              {editingId ? 'Editar Oferta' : 'Nueva Oferta'}
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
              />
              {errors.nombre && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.nombre}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                className="form-control form-control-lg"
                rows="2"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Producto *</label>
                <select
                  className={`form-select form-select-lg ${errors.productoId ? 'is-invalid' : ''}`}
                  value={formData.productoId}
                  onChange={(e) => setFormData({
                    ...formData,
                    productoId: e.target.value,
                    varianteId: ''
                  })}
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nombre}
                    </option>
                  ))}
                </select>
                {errors.productoId && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.productoId}</div>}
              </div>

              {products.find(p => p.id === Number(formData.productoId))?.variants?.length > 0 && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Variante *</label>
                  <select
                    className={`form-select form-select-lg ${errors.varianteId ? 'is-invalid' : ''}`}
                    value={formData.varianteId}
                    onChange={(e) => setFormData({ ...formData, varianteId: e.target.value })}
                  >
                    <option value="">Selecciona una variante</option>
                    {products.find(p => p.id === Number(formData.productoId))?.variants?.map(variant => (
                      <option key={variant.variantId} value={variant.variantId}>
                        {Object.entries(variant)
                          .filter(([key]) => !['variantId', 'productoId', 'stock', 'precio'].includes(key))
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' / ')}
                      </option>
                    ))}
                  </select>
                  {errors.varianteId && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.varianteId}</div>}
                </div>
              )}
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Monto Descuento *</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.descuento ? 'is-invalid' : ''}`}
                  value={formData.descuento}
                  onChange={(e) => setFormData({...formData, descuento: e.target.value})}
                />
                {errors.descuento && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.descuento}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Tipo</label>
                <select
                  className="form-select form-select-lg"
                  value={formData.tipoDescuento}
                  onChange={(e) => setFormData({...formData, tipoDescuento: e.target.value})}
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto">Monto ($)</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Precio de Oferta</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className={`form-control ${errors.precioOferta ? 'is-invalid' : ''}`}
                    value={formData.precioOferta}
                    onChange={(e) => setFormData({...formData, precioOferta: e.target.value})}
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.precioOferta && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.precioOferta}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Stock en Oferta</label>
                <input
                  type="number"
                  className={`form-control form-control-lg ${errors.stockOferta ? 'is-invalid' : ''}`}
                  value={formData.stockOferta}
                  onChange={(e) => setFormData({...formData, stockOferta: e.target.value})}
                  min="0"
                />
                {errors.stockOferta && <div className="invalid-feedback d-block mt-2"><i className="fa fa-exclamation-circle me-2"></i>{errors.stockOferta}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha Inicio</label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha Fin</label>
                <input
                  type="date"
                  className="form-control form-control-lg"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                />
              </div>
            </div>

            <div className="form-check form-switch mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="activo"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
              <label className="form-check-label fw-semibold" htmlFor="activo">
                Oferta Activa
              </label>
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

export default OffersForm;
