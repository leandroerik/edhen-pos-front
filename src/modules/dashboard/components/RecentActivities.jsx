import React from 'react';
import PropTypes from 'prop-types';
import styles from './RecentActivities.module.css';

const COLOR_MAP = {
  'text-success': { bg: 'rgba(25,135,84,0.12)',  icon: '#198754' },
  'text-info':    { bg: 'rgba(13,202,240,0.14)',  icon: '#0dcaf0' },
  'text-warning': { bg: 'rgba(255,193,7,0.14)',   icon: '#ffc107' },
  'text-danger':  { bg: 'rgba(220,53,69,0.12)',   icon: '#dc3545' },
  'text-primary': { bg: 'rgba(13,110,253,0.12)',  icon: '#0d6efd' },
  'text-muted':   { bg: 'rgba(108,117,125,0.10)', icon: '#6c757d' },
};

const RecentActivities = ({ activities = [] }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">
          <i className="fa fa-history me-2 text-secondary"></i>
          Actividad Reciente
        </h6>
        <small className="text-muted">Últimas 24h</small>
      </div>

      <div className="card-body p-0">
        <div className={styles.activitiesList}>
          {activities.map((activity, index) => {
            const colors = COLOR_MAP[activity.color] ?? COLOR_MAP['text-muted'];
            return (
              <div
                key={activity.id}
                className={`d-flex align-items-start ${styles.activityItem} ${index < activities.length - 1 ? styles.withDivider : ''}`}
              >
                {/* Ícono coloreado */}
                <div
                  className={`${styles.iconWrapper} flex-shrink-0`}
                  style={{ background: colors.bg }}
                >
                  <i className={`fa ${activity.icon}`} style={{ color: colors.icon, fontSize: '0.85rem' }}></i>
                </div>

                {/* Contenido */}
                <div className="flex-grow-1 ms-3 min-w-0">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span className={`fw-semibold ${styles.activityTitle}`}>{activity.title}</span>
                    <span className={`text-muted flex-shrink-0 ${styles.activityTime}`}>{activity.time}</span>
                  </div>
                  <p className={`text-muted mb-0 ${styles.activityDesc}`}>{activity.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-3 pb-3 pt-2 border-top">
          <button className="btn btn-outline-secondary btn-sm w-100">
            <i className="fa fa-eye me-2"></i>
            Ver toda la actividad
          </button>
        </div>
      </div>
    </div>
  );
};

RecentActivities.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  ),
};

export default RecentActivities;
