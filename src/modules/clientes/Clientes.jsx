import React from 'react';
import styles from './Clientes.module.css';
import { ClientesList } from './pages';

/**
 * Componente principal de Clientes
 * Gestión de clientes, direcciones e historial de compras
 * @component
 */
const Clientes = () => {
  return (
    <div className={`container-fluid ${styles.clientesContainer}`}>
      {/* Header */}
      <div className={`d-flex justify-content-between align-items-center mb-4 ${styles.header}`}>
        <div>
          <h1 className="h3">
            <i className="fa fa-users me-2"></i>
            Clientes
          </h1>
          <p className="text-muted mb-0">Gestión de clientes y direcciones</p>
        </div>
      </div>

      {/* Contenido */}
      <div className={styles.contenido}>
        <ClientesList />
      </div>
    </div>
  );
};

export default Clientes;
