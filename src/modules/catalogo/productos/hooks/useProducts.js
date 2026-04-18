/**
 * Hook personalizado para la lógica de Productos - MEJORADO
 * Maneja estado, validaciones, variantes y llamadas al servicio
 */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchProducts, saveProduct, deleteProduct } from '../services/productsService';
import { fetchProductVariants } from '../services/variantsService';
import { fetchAttributes } from '../../atributos/services/attributesService';
import { fetchCategories } from '../../categorias/services/categoriesService';
import { usePagination, useSearchFilter } from '../../hooks/useCatalogoHooks';
import { validaciones, validateObject } from '../../utils/validators';
import { generateBarcode } from '../../utils/barcodeGenerator';

// Mock de Atributos directo
const ATTRIBUTES_MOCK_LOCAL = [
  { 
    id: 1, 
    nombre: 'Talla', 
    tipo: 'select', 
    valores: 'XS,S,M,L,XL,XXL',
    activo: true
  },
  { 
    id: 2, 
    nombre: 'Color', 
    tipo: 'select', 
    valores: 'Negro,Blanco,Gris,Azul,Rojo,Verde',
    activo: true
  },
  { 
    id: 3, 
    nombre: 'Material', 
    tipo: 'select', 
    valores: 'Algodón,Poliéster,Mezcla,Lana',
    activo: true
  }
];

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precioBase: 0,
    codigoBarras: '',
    atributosUsados: [],
    activo: true
  });
  const [errors, setErrors] = useState({});

  // Variantes y Atributos
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState({}); // { attrId: [valor1, valor2] }
  const [variants, setVariants] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(products);
  const pagination = usePagination(filteredItems, 10);

  // Cargar productos, atributos y categorías al montar
  useEffect(() => {
    loadProductsData();
    loadAttributesData();
    loadCategoriesData();
  }, []);

  const loadProductsData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadAttributesData = async () => {
    setLoadingAttributes(true);
    try {
      // Usar mock local directamente para evitar dependencias de importación
      console.log('📦 Atributos mockados cargados:', ATTRIBUTES_MOCK_LOCAL);
      setAttributes(ATTRIBUTES_MOCK_LOCAL);
    } catch (error) {
      console.error('Error loading attributes:', error);
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const loadCategoriesData = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Cargar variantes cuando se edita un producto
  const loadVariantsData = async (productId) => {
    try {
      const data = await fetchProductVariants(productId);
      setVariants(data);
    } catch (error) {
      console.error('Error loading variants:', error);
      setVariants([]);
    }
  };

  // Generar variantes basadas en valores de atributos seleccionados
  const generateVariants = (attributeValuesMap) => {
    // attributeValuesMap = { attrId: [valor1, valor2], ... }
    const attrIds = Object.keys(attributeValuesMap);

    if (attrIds.length === 0) {
      setVariants([]);
      return;
    }

    // Obtener atributos ordenados
    const attrs = attrIds.map(id => ({
      id,
      nombre: attributes.find(a => a.id === id)?.nombre || id
    }));

    // Generar combinaciones cartesianas
    const generateCombinations = (index, current) => {
      if (index === attrIds.length) {
        return [current];
      }
      const attrId = attrIds[index];
      const attrName = attrs[index].nombre;
      const values = attributeValuesMap[attrId];
      const results = [];

      values.forEach(value => {
        const newCurrent = { ...current, [attrName]: value };
        results.push(...generateCombinations(index + 1, newCurrent));
      });

      return results;
    };

    const combinations = generateCombinations(0, {});

    // Mapear a formato de variante
    const newVariants = combinations.map((combo, idx) => ({
      variantId: `${editingId || 'new'}-${idx}-${Date.now()}`,
      productoId: editingId,
      ...combo,
      stock: 0,
      precio: formData.precioBase || 0
    }));

    setVariants(newVariants);
  };

  // Actualizar stock de una variante específica
  const handleVariantStockChange = (variantId, stock) => {
    setVariants(prev =>
      prev.map(v =>
        v.variantId === variantId ? { ...v, stock } : v
      )
    );
  };

  // Actualizar precio de una variante específica
  const handleVariantPriceChange = (variantId, precio) => {
    setVariants(prev =>
      prev.map(v =>
        v.variantId === variantId ? { ...v, precio } : v
      )
    );
  };

  // Manejar selección/deselección de valores de atributo
  const handleAttributeValueToggle = (attrId, values) => {
    const newSelection = { ...selectedAttributeValues, [attrId]: values };

    // Si se deseleccionan todos los valores, eliminar el atributo
    if (values.length === 0) {
      delete newSelection[attrId];
    }

    setSelectedAttributeValues(newSelection);

    // Regenerar variantes
    if (Object.keys(newSelection).length > 0) {
      generateVariants(newSelection);
    } else {
      setVariants([]);
    }
  };

  const validateForm = () => {
    const fieldValidations = {
      nombre: validaciones.nombre,
      descripcion: validaciones.descripcion,
      categoriaId: (val) => !val ? 'Categoría es obligatoria' : null,
      precioBase: (val) => !val || val < 0 ? 'Precio base inválido' : null
    };
    const newErrors = validateObject(formData, fieldValidations);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (productData) => {
    // productData ya viene con variants y atributosUsados desde ProductsForm
    console.log('handleSave recibido:', productData);
    
    try {
      const savedProduct = await saveProduct(productData, editingId);
      console.log('Producto guardado:', savedProduct);

      if (editingId) {
        setProducts(prev =>
          prev.map(p => p.id === editingId ? savedProduct : p)
        );
        toast.success('Producto actualizado');
      } else {
        setProducts(prev => [...prev, savedProduct]);
        toast.success('Producto creado exitosamente');
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este producto?')) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Producto eliminado');
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error al eliminar');
      }
    }
  };

  const handleToggleActive = async (id, activo) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      const updatedProduct = await saveProduct({ ...product, activo }, id);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success(`Producto ${activo ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      console.error('Error toggling product active state:', error);
      toast.error('Error al cambiar estado del producto');
    }
  };

  const handleEdit = (product) => {
    console.log('🔧 EDIT - Producto recibido:', product);
    setFormData(product); // Aquí está el producto CON variants si existen
    setEditingId(product.id);
    
    // Si el producto tiene variantes, usarlas directamente
    if (product.variants && Array.isArray(product.variants)) {
      console.log('✓ Variantes encontradas en producto:', product.variants.length);
      setVariants(product.variants);
    }
    
    setShowModal(true);
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoriaId: '',
      precioBase: 0,
      codigoBarras: generateBarcode(),
      atributosUsados: [],
      activo: true
    });
    setEditingId(null);
    setErrors({});
    setSelectedAttributeValues({});
    setVariants([]);
  };

  return {
    // Productos
    products,
    categories,
    loading,
    showModal,
    setShowModal,
    editingId,
    formData,
    setFormData,
    errors,
    searchTerm,
    setSearchTerm,
    filteredItems,
    pagination,

    // Manejos
    handleSave,
    handleDelete,
    handleEdit,
    handleOpenModal,
    handleToggleActive,
    validateForm,

    // Variantes y Atributos
    attributes,
    loadingAttributes,
    selectedAttributeValues,
    handleAttributeValueToggle,
    variants,
    setVariants,
    generateVariants,
    handleVariantStockChange,
    handleVariantPriceChange,
    loadVariantsData
  };
};
