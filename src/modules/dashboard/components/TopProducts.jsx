import React from 'react';
import PropTypes from 'prop-types';
import styles from './TopProducts.module.css';

/**
 * Componente de productos top del día
 * @component
 */
const TopProducts = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return null;
  }

  const getTrendIcon = (trend) => {
    if (trend === 'up') return 'fa-arrow-up';
    if (trend === 'down') return 'fa-arrow-down';
    return 'fa-minus';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-danger';
    return 'text-muted';
  };

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">
          <i className="fa fa-trophy me-2 text-warning"></i>
          Top Productos Hoy
        </h6>
        <small className="text-muted">Más vendidos</small>
      </div>
      <div className={`card-body ${styles.productsList}`}>
        <div className="list-group list-group-flush">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`d-flex justify-content-between align-items-center p-3 border-bottom ${styles.productItem}`}
            >
              <div className="d-flex align-items-center flex-grow-1">
                <div className={`badge bg-primary me-3 ${styles.rankBadge}`}>
                  #{index + 1}
                </div>
                <div className="flex-grow-1">
                  <h6 className="mb-0 small fw-bold">{product.name}</h6>
                  {product.variant && (
                    <small className="text-muted d-block mb-1">{product.variant}</small>
                  )}
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                      <i className="fa fa-shopping-cart me-1"></i>
                      {product.sales} vendidos
                    </small>
                    <small className="text-success fw-bold">{product.revenue}</small>
                  </div>
                </div>
              </div>
              <div className={`text-end ${getTrendColor(product.trend)}`}>
                <i className={`fa ${getTrendIcon(product.trend)}`}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="mt-3 pt-3 border-top">
          <div className="row text-center">
            <div className="col-6">
              <small className="text-muted d-block">Total Vendidos</small>
              <strong className="text-primary">
                {products.reduce((sum, product) => sum + product.sales, 0)}
              </strong>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Ingresos Totales</small>
              <strong className="text-success">
                ${products.reduce((sum, product) => {
                  const revenueNum = parseFloat(product.revenue.replace(/[$,]/g, ''));
                  return sum + revenueNum;
                }, 0).toLocaleString()}.00
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

TopProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
      revenue: PropTypes.string.isRequired,
      trend: PropTypes.oneOf(['up', 'down', 'neutral']).isRequired
    })
  )
};

export default TopProducts;