import { useAuth } from '../../../context/AuthContext';
import { useLayout } from '../../../context/LayoutContext';
import { useActiveRoute } from '../../../hooks/useActiveRoute';
import { useMenuAccordion } from '../../../hooks/useMenuAccordion';
import { MENU_ITEMS } from './menuConfig';
import { filterMenuItemsByRole } from './menuUtils';

export const useSidebar = () => {
  const { isCollapsed, toggleSidebar } = useLayout();
  const { expandedMenus, toggleMenu } = useMenuAccordion('catalogo');
  const isActive = useActiveRoute();
  const { user } = useAuth();

  const menuItems = filterMenuItemsByRole(MENU_ITEMS, user?.role || 'vendedor');

  return { isCollapsed, toggleSidebar, expandedMenus, toggleMenu, isActive, menuItems };
};
