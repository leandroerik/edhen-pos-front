import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatisticsCard.module.css';

/**
 * Componente de tarjeta de estadísticas reutilizable
 * @component
 */
const StatisticsCard = ({ stat }) => {
  if (!stat) return null;

  const { title, value, icon, bg, color } = stat;

  return (
    <div className={`${styles.card} col-md-3 mb-3`}>
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className={`text-muted mb-1 ${styles.title}`}>{title}</p>
              <h4 className={`mb-0 ${styles.value}`}>{value}</h4>
            </div>
            <div
              className={`${bg} text-white p-3 rounded-circle ${styles.iconContainer}`}
              role="img"
              aria-label={`Icono de ${title}`}
            >
              <i className={`fa ${icon} fa-lg`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StatisticsCard.propTypes = {
  stat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    color: PropTypes.string
  })
};

export default StatisticsCard;
