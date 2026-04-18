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

  return (
    <div className="card h-100">
      <div className="card-header bg-light border-bottom">
        <h5 className="mb-0">
          <i className="fa fa-cube me-2 text-warning"></i>
          Categorías Principales
        </h5>
      </div>
      <div className={`card-body ${styles.categoriesList}`}>
        <ul className="list-group list-group-flush">
          {categories.map((category) => (
            <li
              key={category.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${styles.categoryItem}`}
            >
              <span className={styles.categoryName}>{category.name}</span>
              <span className={`badge ${category.badge} ${styles.badge}`}>
                {category.count}
              </span>
            </li>
          ))}
        </ul>
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
      badge: PropTypes.string.isRequired
    })
  )
};

export default MainCategoriesCard;
