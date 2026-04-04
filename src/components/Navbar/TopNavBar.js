import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TopNavBar.css';

/**
 * Barra de navegación superior
 * Incluye logo, botón de menú, TPV, carrito, ayuda y perfil de usuario
 * 
 * @param {boolean} isCollapsed - Estado del sidebar (expandido/colapsado)
 * @param {function} onToggleSidebar - Callback para toglear el sidebar
 */
const TopNavBar = ({ isCollapsed, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin, loading } = useAuth();
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(3); // Simulado

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // No renderizar hasta que el usuario esté cargado
  if (loading) {
    return null;
  }

  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top" 
      style={{ zIndex: 1030, height: '56px', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}
    >
      <div className="container-fluid" style={{ padding: '0 1rem', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* SECCIÓN IZQUIERDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Botón de Menu */}
          <button
            className="btn btn-outline-light"
            onClick={onToggleSidebar}
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-label="Toggle navigation"
          >
            <i className="fa fa-bars"></i>
          </button>

          {/* Logo/Marca */}
          <span className="navbar-brand mb-0">
            <i className="fa fa-shopping-bag me-2"></i>
            <strong>EDHEN POS</strong>
          </span>
        </div>

        {/* SECCIÓN DERECHA */}
        <ul className="nav navbar-top-links navbar-right" style={{ display: 'flex', gap: '0.5rem', margin: 0, padding: 0 }}>
          
          {/* Botón TPV - Abrir Caja */}
          <li style={{ listStyle: 'none' }}>
            <button 
              className="btn btn-light btn-sm"
              onClick={() => navigate('/ventas/tienda')}
              title="Abrir TPV"
              style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem' }}
            >
              <i className="fa fa-cash-register me-1"></i>
              TPV
            </button>
          </li>

          {/* Carrito */}
          <li style={{ listStyle: 'none' }}>
            <a 
              href="/" 
              style={{ textDecoration: 'none', color: '#0d6efd', cursor: 'pointer', position: 'relative', fontSize: '1.2rem' }}
              title="Ver carrito"
            >
              <i className="fa fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span 
                  className="badge-pulse"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '-5px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ff9800',
                    borderRadius: '50%',
                    border: '1px solid #fff',
                    display: 'block'
                  }}
                ></span>
              )}
            </a>
          </li>

          {/* Código de barras */}
          <li style={{ listStyle: 'none' }}>
            <a 
              href="#" 
              style={{ textDecoration: 'none', color: '#0d6efd', cursor: 'pointer', fontSize: '1.2rem' }}
              title="Escanear código de barras"
            >
              <i className="fa fa-barcode"></i>
            </a>
          </li>

          {/* Ayuda */}
          <li className="dropdown" style={{ listStyle: 'none', position: 'relative' }}>
            <button 
              className="btn btn-link text-light p-0"
              onClick={() => setShowHelpDropdown(!showHelpDropdown)}
              style={{ fontSize: '1.2rem', textDecoration: 'none' }}
              title="Ayuda"
            >
              <i className="fa fa-question-circle"></i>
              <i className="fa fa-caret-down ms-1" style={{ fontSize: '0.8rem' }}></i>
            </button>
            
            {showHelpDropdown && (
              <div className="dropdown-menu show" style={{ display: 'block', right: 0, left: 'auto', minWidth: '200px' }}>
                <a className="dropdown-item" href="https://catinfog.com/docs/" target="_blank" rel="noreferrer">
                  <i className="fa fa-book me-2"></i>Documentación
                </a>
                <a className="dropdown-item" href="tel:+34921929770">
                  <i className="fa fa-phone me-2"></i>921929770
                </a>
                <a className="dropdown-item" href="https://api.whatsapp.com/send?phone=34638803532&text=Hola,%20%C2%BFPodéis%20ayudarme%20en%20esto?" target="_blank" rel="noreferrer">
                  <i className="fa fa-whatsapp me-2"></i>638803532
                </a>
                <a className="dropdown-item" href="mailto:info@catinfog.com">
                  <i className="fa fa-envelope me-2"></i>info@catinfog.com
                </a>
                <a className="dropdown-item" href="https://catinfog.com/docs/ticket-soporte/" target="_blank" rel="noreferrer">
                  <i className="fa fa-ticket me-2"></i>Ticket de soporte
                </a>
              </div>
            )}
          </li>

          {/* Usuario */}
          <li className="dropdown" style={{ listStyle: 'none', position: 'relative' }}>
            <button 
              className="btn btn-link text-light p-0"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              style={{ fontSize: '1.2rem', textDecoration: 'none' }}
              title={user?.email || 'Usuario'}
            >
              <i className="fa fa-user"></i>
              <i className="fa fa-caret-down ms-1" style={{ fontSize: '0.8rem' }}></i>
            </button>

            {showUserDropdown && user && (
              <div className="dropdown-menu show" style={{ display: 'block', right: 0, left: 'auto', minWidth: '250px' }}>
                <div className="dropdown-header">
                  <span style={{ fontWeight: 600 }}>{user?.email || 'Usuario'}</span>
                  <br />
                  <small style={{ color: '#999' }}>
                    {isAdmin ? '👤 Administrador' : '💼 Vendedor'}
                  </small>
                </div>
                <divider className="dropdown-divider"></divider>
                <a className="dropdown-item" href="/">
                  <i className="fa fa-user me-2"></i>Mi Perfil
                </a>
                <a className="dropdown-item" href="/configuracion/opciones">
                  <i className="fa fa-cog me-2"></i>Opciones
                </a>
                <divider className="dropdown-divider"></divider>
                <button 
                  className="dropdown-item" 
                  onClick={handleLogout}
                  style={{ color: '#d32f2f', width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <i className="fa fa-sign-out me-2"></i>Cerrar Sesión
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>

      {/* Cerrar dropdowns al hacer click fuera */}
      {(showHelpDropdown || showUserDropdown) && (
        <div 
          onClick={() => {
            setShowHelpDropdown(false);
            setShowUserDropdown(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
          }}
        />
      )}
    </nav>
  );
};

export default TopNavBar;
