import React, { memo } from 'react';
import SidebarItem from './SidebarItem';

/**
 * Componente Sidebar
 * Contenedor del menú lateral con estructura UL/LI
 * Replica el estilo del sidebar original de Catinfog
 * 
 * @param {boolean} isCollapsed - Si el sidebar está colapsado
 * @param {Object} expandedMenus - Estado de los menús expandidos
 * @param {Array} menuItems - Array de items del menú
 * @param {function} onToggleMenu - Callback para toggle de items
 * @param {function} isActive - Función para verificar si una ruta está activa
 */
const Sidebar = memo(({
  isCollapsed,
  expandedMenus,
  menuItems,
  onToggleMenu,
  isActive
}) => {
  const sidebarWidth = isCollapsed ? '60px' : '250px';

  return (
    <aside
      className="bg-dark text-light"
      style={{
        width: sidebarWidth,
        height: 'calc(100vh - 56px)',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        zIndex: 1020,
        position: 'fixed',
        left: 0,
        top: '56px',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '0'
      }}
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <ul
        className="nav"
        id="side-menu"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0
        }}
      >
        {menuItems.map(item => (
          <SidebarItem
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
            isExpanded={expandedMenus[item.id] || false}
            onToggle={onToggleMenu}
            isActive={isActive}
          />
        ))}
      </ul>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
