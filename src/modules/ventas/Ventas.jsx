import React, { useState } from 'react';
import styles from './Ventas.module.css';
import { VentasHistorial } from './pages';
import Devoluciones from './pages/Devoluciones';
import TPVTienda from './components/TPVTienda';
import { VENTAS_SECTIONS } from './utils/ventasConfig';

/**
 * Componente principal de Ventas
 * @component
 */
const Ventas = () => {
  const [seccionActual, setSeccionActual] = useState('tpv');

  const sectionComponents = {
    tpv: TPVTienda,
    historial: VentasHistorial,
    devoluciones: Devoluciones
  };

  const ComponenteActual = sectionComponents[seccionActual];

  return (
    <div className={`container-fluid ${styles.ventasContainer}`}>
      <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.header}`}>
        <div>
          <h1 className="h3">
            <i className="fa fa-shopping-cart me-2"></i>
            Ventas
          </h1>
          <p className="text-muted mb-0">Gestión de ventas en tienda y devoluciones</p>
        </div>
      </div>

      <div className={`mb-4 ${styles.secciones}`}>
        <div className="btn-group" role="group">
          {Object.entries(VENTAS_SECTIONS).map(([key, label]) => (
            <button
              key={key}
              className={`btn ${seccionActual === key ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSeccionActual(key)}
              disabled={!sectionComponents[key]}
            >
              <i className={`fa ${key === 'tpv' ? 'fa-cash-register' : key === 'historial' ? 'fa-history' : 'fa-undo'} me-2`}></i>
              {key === 'tpv' ? 'TPV Tienda' : key === 'historial' ? 'Historial' : 'Devoluciones y Fallas'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contenido}>
        {ComponenteActual ? <ComponenteActual /> : (
          <div className="alert alert-info">
            <i className="fa fa-info-circle me-2"></i>
            Sección: <strong>{seccionActual}</strong> - En desarrollo
          </div>
        )}
      </div>np
    </div>
  );
};

export default Ventas;