import { useState, useCallback } from 'react';
import { PANEL_STATS } from '../utils/dashboardConfig';

/**
 * Hook para gestionar la lógica del Dashboard
 * Maneja estadísticas, carga y actualizaciones
 */
export const usePanelStats = () => {
  const [stats, setStats] = useState(PANEL_STATS);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Actualiza las estadísticas
   */
  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Llamar a API para obtener datos reales
      // const response = await fetchDashboardStats();
      // setStats(response);
      
      // Por ahora usa datos de prueba
      setStats(PANEL_STATS);
    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stats,
    isLoading,
    refreshStats
  };
};
