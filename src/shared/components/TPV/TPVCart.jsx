import React from 'react';
import { formatCurrency } from './TPVUtils';

const CartItem = ({ item, onQtyChange, onPriceChange, onRemove }) => (
  <div className="p-2 mb-2 border rounded">
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div>
        <div className="fw-bold small">{item.nombre}</div>
        {item.variantLabel && <div className="text-info small">{item.variantLabel}</div>}
        <div className="text-muted small">{formatCurrency(item.precioVenta)} c/u</div>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-link text-danger p-0"
        onClick={() => onRemove(item.id)}
        aria-label="Eliminar"
      >
        <i className="fa fa-trash" />
      </button>
    </div>
    <div className="d-flex align-items-center gap-2 mb-2">
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => onQtyChange(item.id, item.cantidad - 1)}
        aria-label="Restar"
      >
        <i className="fa fa-minus" />
      </button>
      <input
        type="number"
        className="form-control form-control-sm text-center"
        value={item.cantidad}
        onChange={(e) => onQtyChange(item.id, parseInt(e.target.value, 10) || 1)}
        min="1"
        max={item.stock}
        style={{ width: 60 }}
      />
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={() => onQtyChange(item.id, item.cantidad + 1)}
        aria-label="Sumar"
      >
        <i className="fa fa-plus" />
      </button>
      <span className="ms-auto fw-bold">{formatCurrency(item.precioVenta * item.cantidad)}</span>
    </div>
    <div className="d-flex align-items-center gap-2">
      <label className="form-label mb-0 small">Precio</label>
      <input
        type="number"
        className="form-control form-control-sm"
        value={item.precioVenta}
        onChange={(e) => onPriceChange(item.id, parseFloat(e.target.value) || 0)}
        min="0"
        step="0.01"
        style={{ width: 110 }}
      />
    </div>
  </div>
);

const TPVCart = ({
  carrito,
  clienteSeleccionado,
  onOpenClientModal,
  onQtyChange,
  onPriceChange,
  onRemove,
  descuento,
  tipoDescuento,
  onDescuentoChange,
  onTipoDescuentoChange,
  subtotal,
  descuentoCalculado,
  total,
  onOpenPaymentModal,
  onClearCart,
}) => (
  <div className="card h-100 shadow-sm tpv-cart-card">
    <div className="d-flex justify-content-between align-items-center px-3 py-2"
      style={{ backgroundColor: '#198754', color: '#fff' }}>
      <h5 className="mb-0" style={{ color: '#fff' }}>
        <i className="fa fa-shopping-cart me-2" />Carrito ({carrito.length})
      </h5>
    </div>
    <div className="card-body d-flex flex-column" style={{ minHeight: 520 }}>
      <div className="mb-3">
        <label className="form-label fw-bold">Cliente</label>
        <button type="button" className="btn tpv-btn-outline-primary w-100 text-start" onClick={onOpenClientModal}>
          <i className="fa fa-user me-2" />
          {clienteSeleccionado ? clienteSeleccionado.nombre : 'Seleccionar cliente...'}
        </button>
      </div>

      <div className="mb-3 flex-grow-1 overflow-auto tpv-cart-items">
        {carrito.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fa fa-shopping-cart fa-2x mb-2 d-block" />
            <p className="mb-0">Carrito vacío</p>
          </div>
        ) : (
          carrito.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onQtyChange={onQtyChange}
              onPriceChange={onPriceChange}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {carrito.length > 0 && (
        <div className="mb-3 pb-3 border-bottom">
          <label className="form-label fw-bold">Descuento</label>
          <div className="input-group input-group-sm">
            <input
              type="number"
              className="form-control"
              value={descuento}
              onChange={(e) => onDescuentoChange(parseFloat(e.target.value) || 0)}
              min="0"
            />
            <select
              className="form-select"
              value={tipoDescuento}
              onChange={(e) => onTipoDescuentoChange(e.target.value)}
            >
              <option value="porcentaje">%</option>
              <option value="fijo">$</option>
            </select>
          </div>
        </div>
      )}

      <div className="tpv-totals-panel p-3 mb-3">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted small">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {descuentoCalculado > 0 && (
          <div className="d-flex justify-content-between mb-2 text-danger small">
            <span>- Descuento</span>
            <span>{formatCurrency(descuentoCalculado)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2 mt-1">
          <span>Total</span>
          <span className="tpv-text-total">{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="d-grid gap-2">
        <button
          type="button"
          className="btn tpv-btn-success btn-lg"
          onClick={onOpenPaymentModal}
          disabled={carrito.length === 0}
        >
          <i className="fa fa-check-circle me-2" />Procesar Venta
        </button>
        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={onClearCart}
          disabled={carrito.length === 0}
        >
          <i className="fa fa-trash me-2" />Vaciar Carrito
        </button>
      </div>
    </div>
  </div>
);

export default TPVCart;
