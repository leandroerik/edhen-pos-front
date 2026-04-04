import React, { createContext, useContext, useState } from 'react';

/**
 * Context para gestionar el estado del layout (sidebar colapsado/expandido)
 * Permite que componentes accedan al estado sin prop drilling
 */
const LayoutContext = createContext();

/**
 * Provider del Layout Context
 * Envuelve la aplicación para proporcionar el estado del sidebar
 */
export const LayoutProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const value = {
    isCollapsed,
    toggleSidebar,
    sidebarWidth: isCollapsed ? '60px' : '250px',
    mainMargin: isCollapsed ? '60px' : '250px'
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Hook para consumir el LayoutContext
 * Uso: const { isCollapsed, toggleSidebar, sidebarWidth } = useLayout();
 */
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout debe ser usado dentro de LayoutProvider');
  }
  return context;
};

export default LayoutContext;
