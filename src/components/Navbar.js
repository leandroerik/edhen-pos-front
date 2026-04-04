import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SidebarItem from './Navbar/SidebarItem';
import TopNavBar from './Navbar/TopNavBar';
import Sidebar from './Navbar/Sidebar';
import { MENU_ITEMS } from './Navbar/menuConfig';
import { useLayout } from '../context/LayoutContext';

/**
 * Componente principal de navegación (Navbar)
 * Incluye la barra superior y el sidebar lateral con menú jerárquico
 * Implementa patrón acordeón: solo un menú expandido a la vez
 */
const Navbar = () => {
  const { isCollapsed, toggleSidebar } = useLayout();
  const [expandedMenus, setExpandedMenus] = useState({ catalogo: true }); // Catálogo abierto por defecto
  const location = useLocation();

  /**
   * Toggle para expandir/contraer menús específicos con patrón acordeón
   * Solo permite un menú expandido a la vez
   */
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuId];
      
      // Si el menú ya está expandido, lo cerramos
      if (isCurrentlyExpanded) {
        return { [menuId]: false };
      }
      
      // Si está colapsado, lo abrimos y cerramos todos los demás
      return { [menuId]: true };
    });
  };

  /**
   * Verifica si la ruta actual está activa
   */
  const isActive = useMemo(() => {
    return (path) => location.pathname === path;
  }, [location.pathname]);

  return (
    <>
      <TopNavBar 
        isCollapsed={isCollapsed}
        onToggleSidebar={toggleSidebar}
      />
      
      <Sidebar
        isCollapsed={isCollapsed}
        expandedMenus={expandedMenus}
        menuItems={MENU_ITEMS}
        onToggleMenu={toggleMenu}
        isActive={isActive}
      />
    </>
  );
};

export default Navbar;
