import React from 'react';
import { formatCurrency } from './TPVUtils';

const TPVProductCard = ({ producto, onAdd }) => {
  const totalStock = producto.tieneVariantes
    ? producto.variantes.reduce((sum, v) => sum + (v.stock || 0), 0)
    : producto.stock;
  const hasStock = producto.tieneVariantes
    ? producto.variantes.some((v) => (v.stock || 0) > 0)
    : producto.stock > 0;

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div className="card h-100 tpv-product-card">
        <div className="card-body text-center d-flex flex-column justify-content-between">
          <div>
            <div className="product-icon rounded-circle bg-light text-primary d-inline-flex align-items-center justify-content-center mb-3">
              <i className={`fa fa-${producto.icono || 'box'} fs-4`}></i>
            </div>
            <h6 className="card-title mb-1">{producto.nombre}</h6>
            {producto.oferta ? (
              <>
                <span className="badge bg-warning text-dark mb-2">Oferta</span>
                <div className="mb-2">
                  <span className="text-decoration-line-through text-muted me-2">{formatCurrency(producto.precioVenta)}</span>
                  <span className="text-success fw-semibold">{formatCurrency(producto.precioOferta ?? producto.precioVenta)}</span>
                </div>
              </>
            ) : (
              <p className="text-success fw-semibold mb-2">{formatCurrency(producto.precioVenta)}</p>
            )}
            <small className="text-muted d-block mb-2">SKU: {producto.sku}</small>
            <small className={`d-block mb-3 ${totalStock > 5 ? 'text-success' : 'text-danger'}`}>
              {producto.tieneVariantes ? `Stock variantes: ${totalStock}` : `Stock: ${totalStock}`}
            </small>
          </div>

          <button
            type="button"
            className={`btn btn-primary btn-sm w-100 mt-auto ${producto.oferta ? ' btn-warning text-dark' : ''}`}
            onClick={() => onAdd(producto)}
            disabled={!hasStock}
          >
            <i className="fa fa-plus me-1"></i>{producto.oferta ? 'Agregar oferta' : producto.tieneVariantes ? 'Seleccionar variante' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TPVProductCard;
