import React, { memo } from 'react';
import { useLayout } from '../../../context/LayoutContext';

/**
 * Componente MainContent
 * Envuelve el contenido principal con padding/margin responsivo
 * Coordina con el TopNavBar (56px) y Sidebar (60px o 250px)
 * 
 * @param {React.ReactNode} children - Contenido a renderizar
 */
const MainContent = memo(({ children }) => {
  const { mainMargin } = useLayout();

  return (
    <main
      style={{
        // Espacio desde arriba: altura del TopNavBar
        paddingTop: '56px',
        // Espacio desde la izquierda: ancho del Sidebar
        paddingLeft: mainMargin,
        // Transición suave al cambiar el sidebar
        transition: 'padding-left 0.3s ease',
        // Altura mínima para llenar la pantalla
        minHeight: '100vh',
        // Ancho: viewport menos sidebar
        width: '100%',
        // Box-sizing border-box para que el padding no aumente el ancho
        boxSizing: 'border-box'
      }}
      role="main"
      aria-label="Main content"
    >
      {children}
    </main>
  );
});

MainContent.displayName = 'MainContent';

export default MainContent;
