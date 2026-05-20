import React from 'react';
import { formatCurrency } from './TPVUtils';

const TPVOnlineOrderSidebar = ({
  carrito,
  clienteSeleccionado,
  onOpenClientModal,
  onQtyChange,
  onRemove,
  descuento,
  tipoDescuento,
  onDescuentoChange,
  onTipoDescuentoChange,
  subtotal,
  descuentoCalculado,
  total,
  onOpenShippingForm,
  onOpenPaymentModal,
  onClearCart,
  datosEnvio,
}) => {
  const transporteNombre   = datosEnvio?._transporteNombre;
  const transporteServicio = datosEnvio?._transporteServicio;
  const envioConfigurado   = !!transporteNombre;

  return (
    <div className="card h-100 shadow-sm tpv-cart-card">
      <div className="d-flex align-items-center px-3 py-2"
        style={{ backgroundColor: '#198754', color: '#fff', borderRadius: '0.375rem 0.375rem 0 0' }}>
        <i className="fa fa-shopping-cart me-2" />
        <h5 className="mb-0 fw-semibold" style={{ color: '#fff' }}>Orden</h5>
        <span className="ms-2 badge rounded-pill"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.78rem' }}>
          {carrito.length}
        </span>
      </div>

      <div className="card-body d-flex flex-column" style={{ minHeight: '520px' }}>

        {/* Cliente */}
        <div className="mb-3">
          <label className="form-label fw-semibold small text-muted">Cliente</label>
          <button type="button" className="btn btn-outline-primary w-100 text-start btn-sm" onClick={onOpenClientModal}>
            <i className="fa fa-user me-2" />
            {clienteSeleccionado ? clienteSeleccionado.nombre : 'Seleccionar cliente...'}
          </button>
        </div>

        {/* Items del carrito */}
        <div className="mb-3 flex-grow-1 overflow-auto tpv-cart-items">
          {carrito.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fa fa-shopping-cart fa-2x d-block mb-2 opacity-25" />
              <span className="small">Carrito vacío</span>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="p-2 mb-2 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <div className="fw-semibold small">{item.nombre}</div>
                    {item.variantLabel && <div className="text-info small">{item.variantLabel}</div>}
                    <div className="text-muted small">{formatCurrency(item.precioVenta)} c/u</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => onRemove(item.id)}>
                    <i className="fa fa-trash" />
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary"
                    onClick={() => onQtyChange(item.id, item.cantidad - 1)}>
                    <i className="fa fa-minus" />
                  </button>
                  <input
                    type="number"
                    className="form-control form-control-sm text-center"
                    value={item.cantidad}
                    onChange={(e) => onQtyChange(item.id, parseInt(e.target.value, 10) || 1)}
                    min="1"
                    max={item.stock}
                    style={{ width: 56 }}
                  />
                  <button type="button" className="btn btn-sm btn-outline-secondary"
                    onClick={() => onQtyChange(item.id, item.cantidad + 1)}>
                    <i className="fa fa-plus" />
                  </button>
                  <span className="ms-auto fw-bold small">{formatCurrency(item.precioVenta * item.cantidad)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Descuento */}
        {carrito.length > 0 && (
          <div className="mb-3 pb-3 border-bottom">
            <label className="form-label small fw-semibold text-muted">Descuento</label>
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

        {/* Totales */}
        <div className="rounded p-3 mb-3" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="d-flex justify-content-between mb-1 small">
            <span className="text-muted">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {descuentoCalculado > 0 && (
            <div className="d-flex justify-content-between mb-1 small text-danger">
              <span>Descuento</span>
              <span>−{formatCurrency(descuentoCalculado)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between fw-bold border-top pt-2 mt-1">
            <span>Total</span>
            <span className="text-success fs-5">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Transportista */}
        <div className="mb-3 p-3 rounded border" style={{ borderColor: envioConfigurado ? '#198754' : '#dee2e6' }}>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small fw-semibold text-muted">
              <i className="fa fa-truck me-1" />Transportista
            </span>
            {envioConfigurado && (
              <span className="badge rounded-pill"
                style={{ backgroundColor: '#d1e7dd', color: '#198754', fontSize: '0.72rem' }}>
                <i className="fa fa-check me-1" />Configurado
              </span>
            )}
          </div>
          {envioConfigurado ? (
            <div>
              <div className="fw-semibold small">{transporteNombre}</div>
              {transporteServicio && (
                <div className="text-muted" style={{ fontSize: '0.78rem' }}>{transporteServicio}</div>
              )}
            </div>
          ) : (
            <div className="text-muted small">Sin transportista seleccionado</div>
          )}
        </div>

        {/* Acciones */}
        <div className="d-grid gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={onOpenShippingForm}
            disabled={carrito.length === 0}>
            <i className="fa fa-truck me-2" />
            {envioConfigurado ? 'Cambiar envío' : 'Configurar Envío'}
          </button>
          <button
            type="button"
            className="btn btn-warning btn-lg text-dark fw-semibold"
            onClick={onOpenPaymentModal}
            disabled={carrito.length === 0}>
            <i className="fa fa-credit-card me-2" />Proceder al Pago
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={onClearCart}
            disabled={carrito.length === 0}>
            <i className="fa fa-trash me-2" />Vaciar Carrito
          </button>
        </div>

      </div>
    </div>
  );
};

export default TPVOnlineOrderSidebar;
