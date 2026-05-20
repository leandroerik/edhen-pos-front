import React from 'react';
import { formatCurrency } from './TPVUtils';

function getTotalStock(producto) {
  return producto.tieneVariantes
    ? producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0)
    : producto.stock;
}

function hasAvailableStock(producto) {
  return producto.tieneVariantes
    ? producto.variantes.some((v) => (v.stock || 0) > 0)
    : producto.stock > 0;
}

function getButtonLabel(producto) {
  if (producto.oferta) return 'Agregar oferta';
  if (producto.tieneVariantes) return 'Seleccionar variante';
  return 'Agregar';
}

function getButtonClass(producto) {
  return `btn btn-sm w-100 mt-auto ${producto.oferta ? 'btn-warning text-dark' : 'tpv-btn-primary'}`;
}

const TPVProductCard = ({ producto, onAdd }) => {
  const totalStock = getTotalStock(producto);
  const hasStock = hasAvailableStock(producto);

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="card h-100 tpv-product-card">
        <div className="card-body text-center d-flex flex-column justify-content-between">
          <div>
            <div className="product-icon rounded-circle tpv-icon-bg d-inline-flex align-items-center justify-content-center mb-3">
              <i className={`fa fa-${producto.icono || 'box'} fs-4`} />
            </div>
            <h6 className="card-title mb-1">{producto.nombre}</h6>
            {producto.oferta ? (
              <>
                <span className="badge bg-warning text-dark mb-2">Oferta</span>
                <div className="mb-2">
                  <span className="text-decoration-line-through text-muted me-2">
                    {formatCurrency(producto.precioVenta)}
                  </span>
                  <span className="text-success fw-semibold">
                    {formatCurrency(producto.precioOferta ?? producto.precioVenta)}
                  </span>
                </div>
              </>
            ) : (
              <p className="tpv-text-price mb-2">{formatCurrency(producto.precioVenta)}</p>
            )}
            <small className="text-muted d-block mb-2">SKU: {producto.sku}</small>
            <small className={`d-block mb-3 ${totalStock > 5 ? 'tpv-text-price' : 'text-danger'}`}>
              {producto.tieneVariantes ? `Stock variantes: ${totalStock}` : `Stock: ${totalStock}`}
            </small>
          </div>
          <button
            type="button"
            className={getButtonClass(producto)}
            onClick={() => onAdd(producto)}
            disabled={!hasStock}
          >
            <i className="fa fa-plus me-1" />
            {getButtonLabel(producto)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TPVProductCard;
