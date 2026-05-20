import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './BusinessInfo.module.css';

const BusinessInfo = ({ info = {} }) => {
  if (!info) return null;

  const cajaAbierta = info.cajaEstado === 'Abierta';

  return (
    <div className="card h-100">
      <div className="card-header border-bottom d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">
          <i className="fa fa-cash-register me-2 text-warning"></i>
          Estado del Turno
        </h6>
        <span className={`badge ${cajaAbierta ? 'bg-success' : 'bg-danger'}`}>
          <i className={`fa ${cajaAbierta ? 'fa-lock-open' : 'fa-lock'} me-1`}></i>
          {info.cajaEstado}
        </span>
      </div>

      <div className={`card-body ${styles.businessInfo}`}>

        {/* Total del turno — bloque destacado */}
        <div className={`${styles.turnoBlock} ${cajaAbierta ? styles.turnoOpen : styles.turnoClosed}`}>
          <small className="text-muted d-block mb-1">Total acumulado</small>
          <div className="d-flex align-items-baseline gap-2">
            <span className={styles.totalValue}>{info.totalTurno ?? '—'}</span>
            <small className="text-muted">{info.ventasTurno ?? 0} ventas</small>
          </div>
          <small className="text-muted">
            <i className="fa fa-clock me-1"></i>Apertura: {info.horaApertura ?? '—'}
          </small>
        </div>

        {/* Vendedor activo */}
        <div className={`d-flex align-items-center gap-2 ${styles.infoRow}`}>
          <i className="fa fa-user-circle text-primary fa-fw"></i>
          <div>
            <small className="text-muted d-block" style={{ lineHeight: 1 }}>Vendedor</small>
            <span className="fw-medium small">{info.vendedorActivo ?? '—'}</span>
          </div>
        </div>

        {/* Empleados activos */}
        <div className={`d-flex align-items-center gap-2 ${styles.infoRow}`}>
          <i className="fa fa-users text-info fa-fw"></i>
          <div>
            <small className="text-muted d-block" style={{ lineHeight: 1 }}>Empleados hoy</small>
            <span className="fw-medium small">{info.empleadosActivos} activos</span>
          </div>
        </div>

        {/* Horario */}
        <div className={`d-flex align-items-center gap-2 ${styles.infoRow}`}>
          <i className="fa fa-clock text-secondary fa-fw"></i>
          <div>
            <small className="text-muted d-block" style={{ lineHeight: 1 }}>Horario</small>
            <span className="fw-medium small">{info.horario}</span>
          </div>
        </div>

        {/* Sincronización Tienda Nube */}
        <div className={`d-flex align-items-center gap-2 ${styles.infoRow}`}>
          <i className="fa fa-sync text-success fa-fw"></i>
          <div>
            <small className="text-muted d-block" style={{ lineHeight: 1 }}>Tienda Nube</small>
            <span className="fw-medium small">{info.ultimaSincronizacion}</span>
          </div>
        </div>

        {/* Acción rápida */}
        <div className="mt-auto pt-3">
          <Link
            to="/cajas"
            className={`btn btn-sm w-100 ${cajaAbierta ? 'btn-outline-danger' : 'btn-outline-success'}`}
          >
            <i className={`fa ${cajaAbierta ? 'fa-sign-out-alt' : 'fa-sign-in-alt'} me-2`}></i>
            {cajaAbierta ? 'Cerrar Caja' : 'Abrir Caja'}
          </Link>
        </div>
      </div>
    </div>
  );
};

BusinessInfo.propTypes = {
  info: PropTypes.shape({
    horario: PropTypes.string,
    empleadosActivos: PropTypes.number,
    vendedorActivo: PropTypes.string,
    cajaEstado: PropTypes.string,
    horaApertura: PropTypes.string,
    totalTurno: PropTypes.string,
    ventasTurno: PropTypes.number,
    ultimaSincronizacion: PropTypes.string,
  })
};

export default BusinessInfo;
