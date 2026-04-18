import React from 'react';
import { formatCurrency } from './TPVUtils';

const TPVVariantModal = ({
  show,
  producto,
  varianteSeleccionada,
  cantidadSeleccionada,
  onVarianteChange,
  onCantidadChange,
  onCancel,
  onConfirm
}) => {
  if (!show || !producto) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Seleccionar variante</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="mb-3">
              <strong>{producto.nombre}</strong>
              <span className="text-muted ms-2">SKU: {producto.sku}</span>
            </p>
            <div className="mb-4">
              <label className="form-label fw-semibold">Variante</label>
              <div className="list-group">
                {producto.variantes.map((variante) => (
                  <button
                    key={variante.id}
                    type="button"
                    className={`list-group-item list-group-item-action ${varianteSeleccionada?.id === variante.id ? 'active' : ''}`}
                    onClick={() => onVarianteChange(variante)}
                    disabled={(variante.stock || 0) === 0}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {Object.entries(variante)
                          .filter(([key]) => key !== 'id' && key !== 'stock')
                          .map(([_, value]) => value)
                          .join(' / ')}
                      </span>
                      <span className={`badge ${variante.stock > 0 ? 'bg-success' : 'bg-secondary'}`}>
                        {variante.stock} unid.
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cantidad</label>
                <input
                  type="number"
                  className="form-control"
                  value={cantidadSeleccionada}
                  min="1"
                  max={varianteSeleccionada ? varianteSeleccionada.stock : 1}
                  onChange={(e) => onCantidadChange(Math.max(1, Math.min(parseInt(e.target.value, 10) || 1, varianteSeleccionada ? varianteSeleccionada.stock : 1)))}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Precio unitario</label>
                <div className="form-control bg-light">{formatCurrency(producto.precioVenta)}</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirm}
              disabled={!varianteSeleccionada || (varianteSeleccionada.stock || 0) === 0}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVVariantModal;
