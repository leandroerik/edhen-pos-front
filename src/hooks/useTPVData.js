import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { mockProductoService, mockClienteService } from '../services/mocks';
import { categoriaService } from '../services/api';

/**
 * Hook para cargar datos iniciales del TPV
 * 
 * RESPONSABILIDAD:
 * - Cargar productos desde API
 * - Cargar clientes desde API
 * - Cargar categorías desde API
 * - Manejar errores de carga
 * 
 * @returns {Object} { productos, clientes, categoriasDisponibles, loading }
 */
export const useTPVData = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(['Todas']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        // Cargar productos
        const resProductos = await mockProductoService.listar();
        const productosActivos = (resProductos.data || []).filter(p => p.activo);
        setProductos(productosActivos);

        // Cargar clientes
        const resClientes = await mockClienteService.listar();
        setClientes(resClientes.data || []);

        // Cargar categorías
        const resCategorias = await categoriaService.listar();
        const categoriasActivas = (resCategorias.data || [])
          .filter(cat => cat.activo)
          .map(cat => cat.nombre)
          .filter(Boolean);
        setCategoriasDisponibles(['Todas', ...new Set(categoriasActivas)]);
      } catch (error) {
        console.error('Error al cargar datos TPV:', error);
        toast.error('Error al cargar datos');
        
        // Fallback: extraer categorías de productos locales
        const categorias = ['Todas', ...new Set(productos.map(p => p.categoria).filter(Boolean))];
        setCategoriasDisponibles(categorias);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  return { productos, clientes, categoriasDisponibles, loading };
};
