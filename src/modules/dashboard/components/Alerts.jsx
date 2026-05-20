import React from 'react';
import PropTypes from 'prop-types';
import styles from './Alerts.module.css';

/**
 * Componente de alertas del sistema - versión compacta
 * @component
 */
const Alerts = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return null; // No mostrar nada si no hay alertas
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'warning': return 'fa-exclamation-triangle';
      case 'danger': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      case 'success': return 'fa-check-circle';
      default: return 'fa-bell';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      case 'info': return 'text-info';
      case 'success': return 'text-success';
      default: return 'text-secondary';
    }
  };

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fa fa-bell me-2 text-warning"></i>
          Alertas del Sistema
        </h6>
        <span className="badge bg-danger">{alerts.length}</span>
      </div>
      <div className="card-body p-3">
        {alerts.length === 0 ? (
          <div className="text-center py-4">
            <i className="fa fa-check-circle fa-2x text-success mb-3"></i>
            <h6 className="text-success mb-2">¡Todo en orden!</h6>
            <p className="text-muted small mb-0">No hay alertas pendientes</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert alert-${alert.type} alert-dismissible fade show mb-0 ${styles.compactAlert}`}
                role="alert"
              >
                <div className="d-flex align-items-start gap-2">
                  <i className={`fa ${getAlertIcon(alert.type)} ${getAlertColor(alert.type)} mt-1`}></i>
                  <div className="flex-grow-1">
                    <div className="fw-bold small mb-1">{alert.title}</div>
                    <div className="small opacity-75 mb-1">{alert.message}</div>
                    {alert.time && (
                      <div className="small text-muted">{alert.time}</div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-sm"
                  data-bs-dismiss="alert"
                  aria-label="Close"
                ></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

Alerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['warning', 'danger', 'info', 'success']),
      action: PropTypes.string,
      actionUrl: PropTypes.string,
      icon: PropTypes.string,
      time: PropTypes.string
    })
  )
};

export default Alerts;