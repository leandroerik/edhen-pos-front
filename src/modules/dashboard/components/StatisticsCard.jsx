import React from 'react';
import PropTypes from 'prop-types';
import styles from './StatisticsCard.module.css';

/**
 * Componente de tarjeta de estadísticas reutilizable
 * @component
 */
const StatisticsCard = ({ stat }) => {
  if (!stat) return null;

  const { title, value, change, changeType, icon, bg, description, subtitle } = stat;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={`${styles.iconWrapper} ${bg}`}>
          <i className={`fa ${icon}`}></i>
        </div>
        <p className={styles.title}>{title}</p>
      </div>
      
      <div className={styles.cardContent}>
        <h2 className={styles.value}>{value}</h2>
        
        {change !== 0 && (
          <div className={`${styles.changeIndicator} ${styles[changeType]}`}>
            <i className={`fa ${changeType === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
            <span>{Math.abs(change)}% vs ayer</span>
          </div>
        )}
        
        {subtitle && (
          <p className={styles.subtitle}>{subtitle}</p>
        )}
      </div>
      
      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </div>
  );
};

StatisticsCard.propTypes = {
  stat: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    previousValue: PropTypes.string,
    change: PropTypes.number,
    changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
    icon: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    color: PropTypes.string,
    description: PropTypes.string
  })
};

export default StatisticsCard;
