import React, { useEffect } from 'react';
import styles from './Dashboard.module.css';
import StatisticsCard from './components/StatisticsCard';
import SalesChart from './components/SalesChart';
import MainCategoriesCard from './components/MainCategoriesCard';
import { usePanelStats } from './hooks/usePanelStats';
import { MAIN_CATEGORIES } from './utils/dashboardConfig';

/**
 * Componente principal del Dashboard
 * Muestra estadísticas, gráficos y categorías principales
 * @component
 */
const Dashboard = () => {
  const { stats, isLoading, refreshStats } = usePanelStats();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <div className={`container-fluid ${styles.panelContainer}`}>
      {/* Header */}
      <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.header}`}>
        <div>
          <h1 className="h3">
            <i className="fa fa-tachometer-alt me-2"></i>
            Panel de Control
          </h1>
          <p className="text-muted mb-0">Resumen general del sistema</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={refreshStats}
          disabled={isLoading}
          aria-label="Actualizar datos del panel"
        >
          <i className={`fa fa-refresh me-2 ${isLoading ? 'fa-spin' : ''}`}></i>
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Cards de estadísticas */}
      <div className={`row mb-4 ${styles.statisticsRow}`}>
        {stats.map((stat) => (
          <StatisticsCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Gráficos y tablas */}
      <div className={`row ${styles.chartsRow}`}>
        <div className="col-lg-8 mb-4">
          <SalesChart />
        </div>
        <div className="col-lg-4 mb-4">
          <MainCategoriesCard categories={MAIN_CATEGORIES} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
