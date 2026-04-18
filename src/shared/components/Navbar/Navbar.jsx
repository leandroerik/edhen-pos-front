import React from 'react';
import TopNavBar from './TopNavBar';
import Sidebar from './Sidebar';
import { MENU_ITEMS } from './menuConfig';
import { useLayout } from '../../../context/LayoutContext';
import { useMenuAccordion } from '../../../hooks/useMenuAccordion';
import { useActiveRoute } from '../../../hooks/useActiveRoute';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENTE: Navbar (Barra de Navegación Principal)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RESPONSABILIDAD:
 * Orquesta la navegación completa de la aplicación
 * - Renderiza la barra superior (TopNavBar)
 * - Renderiza el sidebar lateral con menú jerárquico (Sidebar)
 * 
 * ESTRUCTURA:
 * ┌─────────────────────────────────────────────┐
 * │         TopNavBar (fijo, arriba)           │
 * ├──────────────┬────────────────────────────┤
 * │   Sidebar    │      MainContent           │
 * │  (colapsable)│       (dinámico)           │
 * │              │                            │
 * └──────────────┴────────────────────────────┘
 * 
 * RESPONSIVIDAD:
 * - Desktop: Sidebar expandido / colapsable
 * - Mobile: Sidebar colapsado con toggle
 * 
 * @component
 */
const Navbar = () => {
  const { isCollapsed, toggleSidebar } = useLayout();
  const { expandedMenus, toggleMenu } = useMenuAccordion('catalogo');
  const isActive = useActiveRoute();

  return (
    <>
      {/* BARRA SUPERIOR: Logo, usuario, notificaciones, etc. */}
      <TopNavBar 
        isCollapsed={isCollapsed}
        onToggleSidebar={toggleSidebar}
      />
      
      {/* SIDEBAR LATERAL: Menú jerárquico navegable */}
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
