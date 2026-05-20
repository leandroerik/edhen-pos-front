import React from 'react';
import { formatCurrency } from './TPVUtils';

const BACKDROP_STYLE = { backgroundColor: 'rgba(0,0,0,0.5)' };
const STEPPER_BTN_STYLE = { width: 32, height: 32, padding: 0 };
const QTY_LABEL_STYLE = { minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: '1rem' };

function getVariantLabel(variante) {
  return Object.entries(variante)
    .filter(([key]) => key !== 'id' && key !== 'stock')
    .map(([, value]) => value)
    .join(' / ');
}

function getStockBadgeClass(stock) {
  if (stock > 5) return 'badge bg-success';
  if (stock > 0) return 'badge bg-warning text-dark';
  return 'badge bg-secondary';
}

function formatTotalLabel(count) {
  return `${count} unidad${count !== 1 ? 'es' : ''} seleccionada${count !== 1 ? 's' : ''}`;
}

const VariantRow = ({ variante, cantidad, onCantidadChange }) => {
  const stock = variante.stock || 0;
  const sinStock = stock === 0;

  return (
    <div className={`list-group-item d-flex justify-content-between align-items-center py-3 px-4${sinStock ? ' opacity-50' : ''}`}>
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold">{getVariantLabel(variante)}</span>
        <span className={getStockBadgeClass(stock)}>{stock} unid.</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center"
          style={STEPPER_BTN_STYLE}
          onClick={() => onCantidadChange(variante.id, -1)}
          disabled={sinStock || cantidad === 0}
          aria-label="Restar"
        >
          <i className="fa fa-minus" style={{ fontSize: 11 }} />
        </button>
        <span style={QTY_LABEL_STYLE}>{cantidad}</span>
        <button
          type="button"
          className="btn tpv-btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
          style={STEPPER_BTN_STYLE}
          onClick={() => onCantidadChange(variante.id, +1)}
          disabled={sinStock || cantidad >= stock}
          aria-label="Sumar"
        >
          <i className="fa fa-plus" style={{ fontSize: 11 }} />
        </button>
      </div>
    </div>
  );
};

const TPVVariantModal = ({ show, producto, variantCantidades, onCantidadChange, onCancel, onConfirm }) => {
  if (!show || !producto) return null;

  const totalItems = Object.values(variantCantidades).reduce((sum, q) => sum + q, 0);
  const precioDisplay = producto.oferta
    ? (producto.precioOferta ?? producto.precioVenta)
    : producto.precioVenta;

  return (
    <div className="modal d-block" style={BACKDROP_STYLE}>
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header border-bottom-0 pb-1">
            <div>
              <h5 className="modal-title mb-0">{producto.nombre}</h5>
              <small className="text-muted">{formatCurrency(precioDisplay)} · SKU: {producto.sku}</small>
            </div>
            <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} />
          </div>

          <div className="modal-body p-0">
            <div className="list-group list-group-flush">
              {producto.variantes.map((variante) => (
                <VariantRow
                  key={variante.id}
                  variante={variante}
                  cantidad={variantCantidades[variante.id] || 0}
                  onCantidadChange={onCantidadChange}
                />
              ))}
            </div>
          </div>

          <div className="modal-footer justify-content-between">
            <span className="text-muted small">
              {totalItems > 0 ? formatTotalLabel(totalItems) : 'Seleccioná las cantidades'}
            </span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn tpv-btn-primary btn-sm"
                onClick={onConfirm}
                disabled={totalItems === 0}
              >
                <i className="fa fa-cart-plus me-1" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TPVVariantModal;
