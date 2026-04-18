import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';

/**
 * Componente individual para un item del sidebar
 * Soporta items con y sin submenús
 * Con patrón acordeón: solo un submenu expandido a la vez
 * 
 * @param {Object} item - Configuración del item
 * @param {string} item.id - ID único del item
 * @param {string} item.label - Etiqueta del item
 * @param {string} item.icon - Clase de icono (ej: 'fa-users')
 * @param {string} item.path - Ruta del item (si no tiene submenu)
 * @param {Array} item.submenu - Submenu items (opcional)
 * @param {boolean} isCollapsed - Si el sidebar está colapsado
 * @param {boolean} isExpanded - Si este item está expandido
 * @param {function} onToggle - Callback para toggle del submenu
 * @param {function} isActive - Función para verificar si una ruta está activa
 */
const SidebarItem = memo(({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  isActive
}) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isItemActive = item.path && isActive(item.path);

  if (hasSubmenu) {
    return (
      <SidebarSubmenu
        item={item}
        isCollapsed={isCollapsed}
        isExpanded={isExpanded}
        onToggle={onToggle}
        isActive={isActive}
      />
    );
  }

  // Item simple sin submenu
  return (
    <li className={isItemActive ? 'active' : ''}>
      <Link
        to={item.path}
        className="sidebar-link"
        title={item.label}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          color: isItemActive ? '#0d6efd' : '#ccc',
          textDecoration: 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <i className={`fa ${item.icon} fa-fw`} style={{marginRight: isCollapsed ? 0 : '0.5rem'}}></i>
        {!isCollapsed && <span className="menu-label">{item.label}</span>}
      </Link>
    </li>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;
