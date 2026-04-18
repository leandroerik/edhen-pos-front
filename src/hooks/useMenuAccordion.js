import { useState } from 'react';

/**
 * Hook para manejar el comportamiento de acordeón del menú
 * 
 * CARACTERÍSTICAS:
 * - Solo permite que un menú esté expandido a la vez
 * - Cierra automáticamente el anterior cuando abres uno nuevo
 * - Permite forzar cierre de un menú abierto
 * 
 * @param {string} defaultMenu - ID del menú abierto por defecto (ej: "catalogo")
 * @returns {Object} { expandedMenus, toggleMenu }
 */
export const useMenuAccordion = (defaultMenu = 'catalogo') => {
  const [expandedMenus, setExpandedMenus] = useState({ [defaultMenu]: true });

  /**
   * Alterna la expansión de un menú
   * Si ya está abierto → lo cierra
   * Si está cerrado → lo abre (cierra los demás)
   */
  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuId];
      
      // Toggle: si estaba abierto → cierra; si estaba cerrado → abre
      return isCurrentlyExpanded 
        ? { [menuId]: false }  // Cierra el menú actual
        : { [menuId]: true };  // Abre este menú (cierra implícitamente los demás)
    });
  };

  return { expandedMenus, toggleMenu };
};
