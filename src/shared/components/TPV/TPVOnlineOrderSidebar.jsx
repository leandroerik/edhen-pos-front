import React, { useState } from 'react';
import { formatCurrency } from './TPVUtils';
import TPVOnlineShippingForm from './TPVOnlineShippingForm';

const TPVOnlineOrderSidebar = ({
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
  clienteEnvio,
  setClienteEnvio
}) => {
  const [showShippingForm, setShowShippingForm] = useState(false);

  const handleConfirmShipping = () => {
    setShowShippingForm(false);
    onOpenPaymentModal();
  };

  return (
    <>
      <div className="card h-100 shadow-sm tpv-cart-card">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">
            <i className="fa fa-shopping-cart me-2"></i>Orden ({carrito.length})
          </h5>
        </div>
        <div className="card-body d-flex flex-column" style={{ minHeight: '520px' }}>
          <div className="mb-3">
            <label className="form-label fw-bold">Cliente</label>
            <button type="button" className="btn btn-outline-primary w-100 text-start" onClick={onOpenClientModal}>
              <i className="fa fa-user me-2"></i>
              {clienteSeleccionado ? clienteSeleccionado.nombre : 'Seleccionar cliente...'}
            </button>
          </div>

          <div className="mb-3 flex-grow-1 overflow-auto tpv-cart-items">
            {carrito.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fa fa-shopping-cart fa-2x mb-2"></i>
                <p>Carrito vacío</p>
              </div>
            ) : (
              carrito.map((item) => (
                <div key={item.id} className="p-2 mb-2 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold small">{item.nombre}</div>
                      {item.variantLabel && (
                        <div className="text-info small">{item.variantLabel}</div>
                      )}
                      <div className="text-muted small">{formatCurrency(item.precioVenta)} c/u</div>
                    </div>
                    <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => onRemove(item.id)}>
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onQtyChange(item.id, item.cantidad - 1)}>
                      <i className="fa fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      value={item.cantidad}
                      onChange={(e) => onQtyChange(item.id, parseInt(e.target.value, 10) || 1)}
                      min="1"
                      max={item.stock}
                      style={{ width: '60px' }}
                    />
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onQtyChange(item.id, item.cantidad + 1)}>
                      <i className="fa fa-plus"></i>
                    </button>
                    <span className="ms-auto fw-bold">{formatCurrency(item.precioVenta * item.cantidad)}</span>
                  </div>
                </div>
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
                <select className="form-select" value={tipoDescuento} onChange={(e) => onTipoDescuentoChange(e.target.value)}>
                  <option value="porcentaje">%</option>
                  <option value="fijo">$</option>
                </select>
              </div>
            </div>
          )}

          <div className="bg-light p-3 rounded mb-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {descuentoCalculado > 0 && (
              <div className="d-flex justify-content-between mb-2 text-danger">
                <span>- Descuento:</span>
                <span>{formatCurrency(descuentoCalculado)}</span>
              </div>
            )}
            <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
              <span>Total:</span>
              <span className="text-success">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button 
              type="button" 
              className="btn btn-warning btn-lg text-dark" 
              onClick={() => setShowShippingForm(true)} 
              disabled={carrito.length === 0}
            >
              <i className="fa fa-truck me-2"></i>Generar Envío
            </button>
            <button type="button" className="btn btn-outline-danger" onClick={onClearCart} disabled={carrito.length === 0}>
              <i className="fa fa-trash me-2"></i>Vaciar Carrito
            </button>
          </div>
        </div>
      </div>

      {showShippingForm && (
        <TPVOnlineShippingForm
          show={showShippingForm}
          clienteEnvio={clienteEnvio}
          setClienteEnvio={setClienteEnvio}
          onConfirm={handleConfirmShipping}
          onCancel={() => setShowShippingForm(false)}
        />
      )}
    </>
  );
};

export default TPVOnlineOrderSidebar;
