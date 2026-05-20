import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Remeras',    descripcion: 'Remeras casuales y deportivas', icono: 'fa-shirt',           activo: true },
  { id: 2, nombre: 'Buzos',      descripcion: 'Buzos y sudaderas cómodas',     icono: 'fa-coat',            activo: true },
  { id: 3, nombre: 'Pantalones', descripcion: 'Jeans, deportivos y casuales',  icono: 'fa-person-hiking',   activo: true },
  { id: 4, nombre: 'Musculosas', descripcion: 'Musculosas y tops deportivos',  icono: 'fa-vest',            activo: true },
  { id: 5, nombre: 'Gorros',     descripcion: 'Gorros y accesorios de cabeza', icono: 'fa-hat-cowboy',      activo: true },
  { id: 6, nombre: 'Accesorios', descripcion: 'Cinturones, bolsos y complementos', icono: 'fa-ring',        activo: true },
  { id: 7, nombre: 'Ofertas',    descripcion: 'Productos en oferta y descuentos',  icono: 'fa-percent',     activo: true },
];

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setCategories(MOCK_CATEGORIAS);
    } catch {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = (data) => {
    const id = Math.max(...categories.map((c) => c.id), 0) + 1;
    setCategories((prev) => [...prev, { ...data, id }]);
    toast.success('Categoría creada');
  };

  const actualizar = (id, data) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    toast.success('Categoría actualizada');
  };

  const eliminar = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('Categoría eliminada');
  };

  const toggleActivo = (categoria) => {
    const activo = !categoria.activo;
    setCategories((prev) => prev.map((c) => (c.id === categoria.id ? { ...c, activo } : c)));
    toast.success(activo ? 'Categoría activada' : 'Categoría desactivada');
  };

  return { categories, loading, crear, actualizar, eliminar, toggleActivo };
};
