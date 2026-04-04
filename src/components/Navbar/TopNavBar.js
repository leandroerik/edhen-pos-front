import React from 'react';

/**
 * Barra de navegación superior
 * Incluye logo, botón de menú y botón de perfil
 * 
 * @param {boolean} isCollapsed - Estado del sidebar (expandido/colapsado)
 * @param {function} onToggleSidebar - Callback para toglear el sidebar
 */
const TopNavBar = ({ isCollapsed, onToggleSidebar }) => {
  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" 
      style={{ zIndex: 1030, height: '56px', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}
    >
      <div className="container-fluid" style={{ padding: '0 1rem', margin: 0 }}>
        {/* Botón de Menu */}
        <button
          className="btn btn-outline-light me-3"
          onClick={onToggleSidebar}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label="Toggle navigation"
        >
          <i className="fa fa-bars"></i>
        </button>

        {/* Logo/Marca */}
        <span className="navbar-brand mb-0 h1">
          <i className="fa fa-shopping-bag me-2"></i>
          EDHEN POS
        </span>

        {/* Acciones del usuario (derecha) */}
        <div className="ms-auto d-flex gap-2">
          <button 
            className="btn btn-outline-light"
            title="Ver perfil"
            aria-label="Profile"
          >
            <i className="fa fa-user me-2"></i>
            <span className="d-none d-sm-inline">Perfil</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
