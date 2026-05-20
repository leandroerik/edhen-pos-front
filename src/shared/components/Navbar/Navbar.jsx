import React from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { useSidebar } from './useSidebar';

const Navbar = () => {
  const { isCollapsed, toggleSidebar, expandedMenus, toggleMenu, isActive, menuItems } = useSidebar();

  return (
    <>
      <TopNavBar isCollapsed={isCollapsed} onToggleSidebar={toggleSidebar} />
      <Sidebar
        isCollapsed={isCollapsed}
        expandedMenus={expandedMenus}
        menuItems={menuItems}
        onToggleMenu={toggleMenu}
        isActive={isActive}
      />
    </>
  );
};

export default Navbar;
