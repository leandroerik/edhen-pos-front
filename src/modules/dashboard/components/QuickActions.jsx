import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './QuickActions.module.css';

/**
 * Componente de acciones rápidas
 * @component
 */
const QuickActions = ({ actions = [] }) => {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="card h-100">
      <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">
          <i className="fa fa-bolt me-2 text-warning"></i>
          Acciones Rápidas
        </h6>
        <small className="text-muted">Acceso directo</small>
      </div>
      <div className={`card-body ${styles.actionsGrid}`}>
        {actions.map((action) => (
          <Link key={action.id} to={action.url} className={`${styles.actionButton}`}>
            <i className={`fa ${action.icon} ${styles.actionIcon}`}></i>
            <span className={styles.actionTitle}>{action.title}</span>
            <small className={styles.actionDesc}>{action.description}</small>
          </Link>
        ))}
      </div>
    </div>
  );
};

QuickActions.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired
    })
  )
};

export default QuickActions;