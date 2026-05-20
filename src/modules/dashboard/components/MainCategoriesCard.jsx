import React from 'react';
import PropTypes from 'prop-types';
import styles from './MainCategoriesCard.module.css';

/**
 * Componente de tarjeta de categorías principales
 * @component
 */
const MainCategoriesCard = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
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
          <i className="fa fa-tags me-2 text-warning"></i>
          Categorías
        </h6>
        <small className="text-muted">Esta semana</small>
      </div>
      <div className={`card-body ${styles.categoriesList}`}>
        <div className="list-group list-group-flush">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`d-flex justify-content-between align-items-center p-3 border-bottom ${styles.categoryItem}`}
            >
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-1">
                  <span className={`badge ${category.badge} me-2 ${styles.badge}`}>
                    {category.count}
                  </span>
                  <span className={`fw-medium ${styles.categoryName}`}>
                    {category.name}
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <small className="text-muted me-2">Ventas:</small>
                  <strong className="text-success small">{category.ventas}</strong>
                </div>
              </div>
              <div className={`text-end ${getTrendColor(category.trend)}`}>
                <i className={`fa ${getTrendIcon(category.trend)} fa-sm`}></i>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-3 pt-3 border-top">
          <div className="row text-center">
            <div className="col-6">
              <small className="text-muted d-block">Total Categorías</small>
              <strong className="text-primary">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </strong>
            </div>
            <div className="col-6">
              <small className="text-muted d-block">Ventas Totales</small>
              <strong className="text-success">
                ${categories.reduce((sum, cat) => {
                  const ventasNum = parseFloat(cat.ventas.replace(/[$,]/g, ''));
                  return sum + ventasNum;
                }, 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

MainCategoriesCard.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      ventas: PropTypes.string.isRequired,
      badge: PropTypes.string.isRequired,
      trend: PropTypes.oneOf(['up', 'down', 'neutral']).isRequired
    })
  )
};

export default MainCategoriesCard;
