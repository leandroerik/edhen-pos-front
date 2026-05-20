import React, { memo } from 'react';
import SidebarItem from './SidebarItem';
import styles from './sidebar.module.css';

const Sidebar = memo(({
  isCollapsed,
  expandedMenus,
  menuItems,
  onToggleMenu,
  isActive
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      role="navigation"
      aria-label="Menú de navegación principal"
    >
      <ul className={styles['sidebar-menu']} id="side-menu">
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
