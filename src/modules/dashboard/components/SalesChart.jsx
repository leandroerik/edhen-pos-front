import React from 'react';
import styles from './SalesChart.module.css';

/**
 * Componente del gráfico de ventas semanales
 * @component
 */
const SalesChart = () => {
  return (
    <div className="card h-100">
      <div className="card-header bg-light border-bottom">
        <h5 className="mb-0">
          <i className="fa fa-chart-line me-2 text-info"></i>
          Ventas Esta Semana
        </h5>
      </div>
      <div className={`card-body ${styles.chartContainer}`}>
        <div className={styles.placeholder}>
          <i className="fa fa-chart-bar fa-3x text-muted mb-3"></i>
          <p className="text-muted">Gráfico en desarrollo...</p>
          <small className="text-muted">Próximamente integración con fuentes de datos</small>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
