import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para verificar si una ruta está activa
 * 
 * CARACTERÍSTICAS:
 * - Compara la ruta actual con la proporcionada
 * - Se memoriza para evitar recalculos innecesarios
 * - Útil para resaltar enlaces activos en navegación
 * 
 * @returns {Function} isActive - Función que retorna true si la ruta es la actual
 * 
 * EJEMPLO:
 * const isActive = useActiveRoute();
 * {isActive('/products') && <span className="active">Productos</span>}
 */
export const useActiveRoute = () => {
  const location = useLocation();

  return useMemo(() => {
    return (path) => location.pathname === path;
  }, [location.pathname]);
};
