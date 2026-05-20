import React, { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './sidebar.module.css';

const SidebarSubmenu = memo(({
  item,
  isCollapsed,
  isExpanded,
  onToggle,
  isActive
}) => {
  const navigate = useNavigate();
  const submenuId = `submenu-${item.id}`;
  const buttonId = `menu-toggle-${item.id}`;
  const hasAnyActive = item.submenu?.some(sub => isActive(sub.path));

  const handleButtonClick = () => {
    if (isCollapsed && item.submenu && item.submenu.length > 0) {
      navigate(item.submenu[0].path);
    } else {
      onToggle(item.id);
    }
  };

  return (
    <li className={`${styles['sidebar-item']} ${isExpanded || hasAnyActive ? styles['has-active'] : ''}`}>
      <button
        id={buttonId}
        onClick={handleButtonClick}
        className={styles['sidebar-menu-toggle']}
        title={item.label}
        aria-expanded={isExpanded && !isCollapsed}
        aria-controls={submenuId}
      >
        <i className={`fa ${item.icon} fa-fw ${styles['sidebar-icon']}`}></i>
        {!isCollapsed && (
          <>
            <span className={styles['sidebar-label']}>{item.label}</span>
            <i className={`fa fa-chevron-right ${styles['sidebar-menu-arrow']}`} aria-hidden="true"></i>
          </>
        )}
      </button>

      <ul
        id={submenuId}
        className={`${styles['sidebar-submenu']} ${isExpanded && !isCollapsed ? styles.expanded : ''}`}
        aria-labelledby={buttonId}
      >
        {item.submenu.map((subitem) => (
          <li
            key={subitem.path}
            className={`${styles['sidebar-submenu-item']} ${isActive(subitem.path) ? styles.active : ''}`}
          >
            <Link
              to={subitem.path}
              className={styles['sidebar-submenu-link']}
              title={subitem.label}
              aria-current={isActive(subitem.path) ? 'page' : undefined}
            >
              <span className={styles['sidebar-submenu-bullet']}></span>
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
