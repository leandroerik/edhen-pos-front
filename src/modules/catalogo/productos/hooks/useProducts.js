import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const MOCK_PRODUCTOS = [
  {
    id: 1,
    nombre:         'Remera Básica',
    descripcion:    'Remera 100% algodón, cómoda y versátil',
    categoriaId:    1,
    precioBase:     29.99,
    codigoBarras:   '9780201637606',
    atributosUsados: ['Talla', 'Color'],
    activo:         true,
    variants: [
      { variantId: '1-M-Negro',  Talla: 'M', Color: 'Negro',  stock: 10, precio: 29.99 },
      { variantId: '1-M-Blanco', Talla: 'M', Color: 'Blanco', stock: 15, precio: 29.99 },
      { variantId: '1-L-Negro',  Talla: 'L', Color: 'Negro',  stock: 12, precio: 29.99 },
      { variantId: '1-L-Blanco', Talla: 'L', Color: 'Blanco', stock: 20, precio: 29.99 },
    ],
  },
  {
    id: 2,
    nombre:         'Buzo Oversize',
    descripcion:    'Buzo deportivo, corte oversize muy cómodo',
    categoriaId:    2,
    precioBase:     49.99,
    codigoBarras:   '9780134685991',
    atributosUsados: ['Talla'],
    activo:         true,
    variants: [
      { variantId: '2-S',  Talla: 'S',  stock: 5,  precio: 49.99 },
      { variantId: '2-M',  Talla: 'M',  stock: 8,  precio: 49.99 },
      { variantId: '2-L',  Talla: 'L',  stock: 12, precio: 49.99 },
      { variantId: '2-XL', Talla: 'XL', stock: 10, precio: 49.99 },
    ],
  },
];

const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Remeras',    icono: 'fa-shirt',         activo: true },
  { id: 2, nombre: 'Buzos',      icono: 'fa-coat',          activo: true },
  { id: 3, nombre: 'Pantalones', icono: 'fa-person-hiking', activo: true },
  { id: 4, nombre: 'Musculosas', icono: 'fa-vest',          activo: true },
  { id: 5, nombre: 'Gorros',     icono: 'fa-hat-cowboy',    activo: true },
  { id: 6, nombre: 'Accesorios', icono: 'fa-ring',          activo: true },
  { id: 7, nombre: 'Ofertas',    icono: 'fa-percent',       activo: true },
];

const MOCK_ATRIBUTOS = [
  { id: 1, nombre: 'Talla',    tipo: 'select', valores: 'XS,S,M,L,XL,XXL',             activo: true },
  { id: 2, nombre: 'Color',    tipo: 'select', valores: 'Negro,Blanco,Gris,Azul,Rojo',  activo: true },
  { id: 3, nombre: 'Material', tipo: 'select', valores: 'Algodón,Poliéster,Mezcla',     activo: true },
];

export const useProducts = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading,    setLoading]    = useState(false);

  const cargar = useCallback(() => {
    setLoading(true);
    try {
      setProducts(MOCK_PRODUCTOS);
      setCategories(MOCK_CATEGORIAS);
      setAttributes(MOCK_ATRIBUTOS);
    } catch {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = (data) => {
    const id = Math.max(...products.map((p) => p.id), 0) + 1;
    setProducts((prev) => [...prev, { ...data, id }]);
    toast.success('Producto creado');
  };

  const actualizar = (id, data) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    toast.success('Producto actualizado');
  };

  const eliminar = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Producto eliminado');
  };

  const toggleActivo = (producto) => {
    const activo = !producto.activo;
    setProducts((prev) => prev.map((p) => (p.id === producto.id ? { ...p, activo } : p)));
    toast.success(activo ? 'Producto activado' : 'Producto desactivado');
  };

  return { products, categories, attributes, loading, crear, actualizar, eliminar, toggleActivo };
};
