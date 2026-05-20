import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import styles from './sidebar.module.css';

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

  return (
    <li className={`${styles['sidebar-item']} ${isItemActive ? styles.active : ''}`}>
      <Link
        to={item.path}
        className={styles['sidebar-link']}
        title={item.label}
        aria-current={isItemActive ? 'page' : undefined}
      >
        <i className={`fa ${item.icon} fa-fw ${styles['sidebar-icon']}`}></i>
        <span className={styles['sidebar-label']}>{item.label}</span>
      </Link>
    </li>
  );
});

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;
