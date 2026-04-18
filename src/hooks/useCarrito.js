import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook para manejar el carrito de compras
 * 
 * RESPONSABILIDAD:
 * - Agregar productos al carrito
 * - Actualizar cantidad de items
 * - Eliminar items del carrito
 * - Vaciar carrito completo
 * - Calcular subtotal
 * 
 * @returns {Object} { carrito, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, subtotal }
 */
export const useCarrito = () => {
  const [carrito, setCarrito] = useState([]);

  const agregarAlCarrito = useCallback((producto, cantidad = 1, variante = null) => {
    setCarrito(prev => {
      const itemId = variante 
        ? `${producto.id}-${variante.id}` 
        : `${producto.id}`;
      
      const existing = prev.find(item => item.id === itemId);

      if (existing) {
        return prev.map(item =>
          item.id === itemId
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }

      return [...prev, {
        id: itemId,
        productoId: producto.id,
        nombre: producto.nombre,
        precioVenta: variante?.precio || producto.precioVenta,
        precioOriginal: producto.precioVenta,
        cantidad,
        variante,
        stock: variante?.stock || producto.stock,
        sku: producto.sku
      }];
    });

    toast.success(`${producto.nombre} agregado al carrito`);
  }, []);

  const actualizarCantidad = useCallback((id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(prev => prev.filter(item => item.id !== id));
      return;
    }

    setCarrito(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, cantidad: Math.min(cantidad, item.stock) }
          : item
      )
    );
  }, []);

  const eliminarDelCarrito = useCallback((id) => {
    setCarrito(prev => {
      const producto = prev.find(item => item.id === id);
      const nuevo = prev.filter(item => item.id !== id);
      
      if (producto) {
        toast.success(`${producto.nombre} removido del carrito`);
      }
      
      return nuevo;
    });
  }, []);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
    toast.info('Carrito vaciado');
  }, []);

  const subtotal = carrito.reduce(
    (sum, item) => sum + (item.precioVenta * item.cantidad),
    0
  );

  return {
    carrito,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    subtotal
  };
};
