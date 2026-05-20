import { useState, useCallback } from 'react';
import { PANEL_STATS, SALES_DATA, TODAY_SALES_DATA, RECENT_ACTIVITIES, ALERTS, TOP_PRODUCTS, BUSINESS_INFO, QUICK_ACTIONS } from '../utils/dashboardConfig';

/**
 * Hook para gestionar la lógica del Dashboard
 * Maneja estadísticas, carga y actualizaciones con datos mockeados realistas
 */
export const usePanelStats = () => {
  const [stats, setStats] = useState(PANEL_STATS);
  const [salesData, setSalesData] = useState(SALES_DATA);
  const [todaySalesData, setTodaySalesData] = useState(TODAY_SALES_DATA);
  const [recentActivities, setRecentActivities] = useState(RECENT_ACTIVITIES);
  const [alerts, setAlerts] = useState(ALERTS);
  const [topProducts, setTopProducts] = useState(TOP_PRODUCTS);
  const [businessInfo, setBusinessInfo] = useState(BUSINESS_INFO);
  const [quickActions, setQuickActions] = useState(QUICK_ACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Genera datos de estadísticas realistas
   */
  const generateMockStats = () => {
    // Mantener los valores específicos del usuario para las estadísticas principales
    return PANEL_STATS.map(stat => ({
      ...stat,
      // Mantener los valores fijos especificados por el usuario
    }));
  };

  /**
   * Genera datos de ventas semanales realistas
   */
  const generateMockSalesData = () => {
    return SALES_DATA.map(day => ({
      ...day,
      ventas: Math.floor(Math.random() * 2000) + 800,
      pedidos: Math.floor(Math.random() * 10) + 5
    }));
  };

  /**
   * Genera productos top del día
   */
  const generateTopProducts = () => {
    return TOP_PRODUCTS.map(product => ({
      ...product,
      sales: Math.floor(Math.random() * 20) + 5,
      revenue: `$${(Math.floor(Math.random() * 5000) + 1000).toLocaleString()}.00`,
      trend: Math.random() > 0.3 ? 'up' : 'down'
    }));
  };

  /**
   * Actualiza las estadísticas
   */
  const refreshStats = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generar datos mockeados realistas
      const newStats = generateMockStats();
      const newSalesData = generateMockSalesData();
      const newTopProducts = generateTopProducts();

      setStats(newStats);
      setSalesData(newSalesData);
      setTopProducts(newTopProducts);

      // Simular hora actual para actualizar el gráfico de hoy
      const currentHour = new Date().getHours();
      const updatedTodayData = TODAY_SALES_DATA.map(item => {
        const h = parseInt(item.hora);
        return { ...item, futura: h > currentHour };
      });
      setTodaySalesData(updatedTodayData);

      // Actualizar actividades recientes con timestamps frescos
      const updatedActivities = RECENT_ACTIVITIES.map(activity => ({
        ...activity,
        time: generateRandomTime()
      }));
      setRecentActivities(updatedActivities);

    } catch (error) {
      console.error('Error al actualizar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Genera un tiempo aleatorio para actividades
   */
  const generateRandomTime = () => {
    const times = ['Hace 2 min', 'Hace 8 min', 'Hace 15 min', 'Hace 32 min', 'Hace 1 hora', 'Hace 2 horas'];
    return times[Math.floor(Math.random() * times.length)];
  };

  return {
    stats,
    salesData,
    todaySalesData,
    recentActivities,
    alerts,
    topProducts,
    businessInfo,
    quickActions,
    isLoading,
    refreshStats
  };
};
