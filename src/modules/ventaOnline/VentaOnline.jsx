import React, { useState } from 'react';
import styles from './VentaOnline.module.css';
import { PedidosList } from './pages';
import TPVOnline from './components/TPVOnline';
import { VENTA_ONLINE_SECTIONS } from './utils/ventaOnlineConfig';

/**
 * Componente principal de Venta Online
 * Gestión de pedidos y entregas
 * @component
 */
const VentaOnline = () => {
  const [seccionActual, setSeccionActual] = useState('tpv');

  const sectionComponents = {
    tpv: TPVOnline,
    pendientes: PedidosList,
    proceso: PedidosList,
    entregadas: PedidosList
  };

  const ComponenteActual = sectionComponents[seccionActual] || PedidosList;

  return (
    <div className={`container-fluid ${styles.ventaOnlineContainer}`}>
      <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.header}`}>
        <div>
          <h1 className="h3">
            <i className="fa fa-globe me-2"></i>
            Venta Online
          </h1>
          <p className="text-muted mb-0">TPV online, gestión de pedidos y entregas</p>
        </div>
      </div>

      <div className={`mb-4 ${styles.secciones}`}>
        <div className="btn-group" role="group">
          {Object.entries(VENTA_ONLINE_SECTIONS).map(([key, label]) => (
            <button
              key={key}
              className={`btn ${seccionActual === key ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setSeccionActual(key)}
            >
              <i className={`fa ${key === 'tpv' ? 'fa-cash-register' : 'fa-box'} me-2`}></i>
              {key === 'tpv' ? 'TPV Online' : key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.contenido}>
        <ComponenteActual />
      </div>
    </div>
  );
};

export default VentaOnline;