import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Submenu del sidebar
 * Renderiza un <li> con submenu colapsable usando estructura HTML original
 * Patrón acordeón: solo un submenu expandido a la vez
 * 
 * @param {Object} item - Configuración del item con submenu
 * @param {boolean} isCollapsed - Si el sidebar está colapsado
 * @param {boolean} isExpanded - Si este submenu está expandido
 * @param {function} onToggle - Callback para toggle del submenu
 * @param {function} isActive - Función para verificar si una ruta está activa
 */
const SidebarSubmenu = memo(({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  isActive
}) => {
  const navigate = useNavigate();
  const hasAnyActive = item.submenu?.some(sub => isActive(sub.path));

  const handleButtonClick = () => {
    // Si está colapsado, navega a la primera opción del submenu
    if (isCollapsed && item.submenu && item.submenu.length > 0) {
      navigate(item.submenu[0].path);
    } else {
      // Si no está colapsado, toggle del menú
      onToggle(item.id);
    }
  };

  return (
    <li className={`${isExpanded ? 'active' : ''} ${hasAnyActive ? 'active' : ''}`}>
      {/* Botón para expandir/contraer */}
      <button
        onClick={handleButtonClick}
        className="sidebar-menu-toggle"
        title={item.label}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '0.75rem 1rem',
          border: 'none',
          background: 'transparent',
          color: '#ccc',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.3s ease',
          fontSize: '0.95rem'
        }}
        aria-expanded={isExpanded}
      >
        <i 
          className={`fa ${item.icon} fa-fw`} 
          style={{marginRight: isCollapsed ? 0 : '0.5rem'}}
        ></i>
        {!isCollapsed && (
          <>
            <span className="menu-label" style={{flex: 1}}>{item.label}</span>
            <span className="fa arrow" style={{
              transition: 'transform 0.3s ease',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              fontSize: '0.75rem',
              marginLeft: 'auto'
            }}></span>
          </>
        )}
      </button>

      {/* Submenu - Siempre renderizado, visibilidad controlada por CSS */}
      <ul 
        className={`nav nav-second-level collapse ${isExpanded && !isCollapsed ? 'in' : ''}`}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: isExpanded && !isCollapsed ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out'
        }}
        aria-expanded={isExpanded}
      >
        {item.submenu.map((subitem) => (
          <li
            key={subitem.path}
            className={isActive(subitem.path) ? 'active' : ''}
          >
            <Link
              to={subitem.path}
              className="sidebar-submenu-link"
              title={subitem.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 1rem 0.5rem 3rem',
                color: isActive(subitem.path) ? '#0d6efd' : '#999',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                borderLeft: isActive(subitem.path) ? '3px solid #0d6efd' : '3px solid transparent',
                paddingLeft: isActive(subitem.path) ? '2.7rem' : '3rem'
              }}
            >
              <i className="fa fa-fi" style={{marginRight: '0.5rem', fontSize: '0.7rem'}}></i>
              <span>{subitem.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
});

SidebarSubmenu.displayName = 'SidebarSubmenu';

export default SidebarSubmenu;
