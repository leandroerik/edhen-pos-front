import { useEffect, useMemo, useState } from 'react';
import { mockProductoService } from '../../../services/mocks';
import { ventaService } from '../../../services/api';
import { toast } from 'react-hot-toast';

export const MOTIVOS_DEVUELTAS = ['Cambio de talla', 'No encaja', 'Cambio de opinión', 'Color diferente', 'Otro'];
export const MOTIVOS_FALLAS = ['Defecto de fabricación', 'Decoloración', 'Rotura/Costura', 'Mancha', 'Otro'];
export const TIPOS_REEMBOLSO = ['Dinero devuelto', 'Crédito tienda', 'Cambio de producto'];

const DEVO_STORAGE_KEY = 'devolucionesGuardadas';

const loadRegistro = () => {
  try {
    return JSON.parse(localStorage.getItem(DEVO_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveRegistro = (items) => {
  localStorage.setItem(DEVO_STORAGE_KEY, JSON.stringify(items));
};

const loadVentas = () => {
  try {
    return JSON.parse(localStorage.getItem('ventasGuardadas') || '[]');
  } catch {
    return [];
  }
};

export const useDevoluciones = () => {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('devueltas'); // 'devueltas' o 'fallas'
  const [selectedVentaNumero, setSelectedVentaNumero] = useState('');
  const [selectedVentaItemId, setSelectedVentaItemId] = useState('');
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [selectedVarianteId, setSelectedVarianteId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [reembolso, setReembolso] = useState(TIPOS_REEMBOLSO[0]);
  const [registro, setRegistro] = useState([]);
  const [filterMotivo, setFilterMotivo] = useState('');
  const [filterBusqueda, setFilterBusqueda] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      mockProductoService.listar(),
      ventaService.listar()
    ])
      .then(([resProductos, resVentas]) => {
        setProductos(resProductos.data || []);
        const ventasLocales = loadVentas().map((venta) => ({ ...venta, source: 'local' }));
        const ventasApi = (resVentas.data || []).map((venta) => ({ ...venta, source: 'api' }));
        setVentas([...ventasApi, ...ventasLocales]);
      })
      .catch((err) => {
        console.error('Error al cargar datos de devoluciones:', err);
        toast.error('No se pudieron cargar los datos de devoluciones');
        mockProductoService.listar()
          .then((res) => setProductos(res.data || []));
        setVentas(loadVentas().map((venta) => ({ ...venta, source: 'local' })));
      })
      .finally(() => {
        setLoading(false);
      });

    setRegistro(loadRegistro());
    setMotivo(MOTIVOS_DEVUELTAS[0]);
  }, []);

  const ventasRecientes = useMemo(
    () => ventas
      .filter((venta) => venta.fecha)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 10),
    [ventas]
  );

  const selectedVenta = useMemo(
    () => ventas.find((venta) => String(venta.numeroVenta) === String(selectedVentaNumero)),
    [ventas, selectedVentaNumero]
  );

  const itemsDeVenta = useMemo(
    () => selectedVenta?.items || [],
    [selectedVenta]
  );

  const selectedVentaItem = useMemo(
    () => itemsDeVenta.find((item) => String(item.id) === String(selectedVentaItemId)) || null,
    [itemsDeVenta, selectedVentaItemId]
  );

  const productoSeleccionado = useMemo(() => {
    if (selectedVentaItem) {
      return productos.find((producto) => producto.id === selectedVentaItem.productoId);
    }
    return productos.find((producto) => producto.id === Number(selectedProductoId));
  }, [productos, selectedProductoId, selectedVentaItem]);

  useEffect(() => {
    if (selectedVentaItem) {
      setSelectedProductoId(String(selectedVentaItem.productoId));
      setSelectedVarianteId(selectedVentaItem.varianteId || '');
      setCantidad(1);
      return;
    }

    if (productoSeleccionado?.tieneVariantes) {
      setSelectedVarianteId(productoSeleccionado.variantes[0]?.id || '');
    } else {
      setSelectedVarianteId('');
    }
  }, [selectedVentaItem, productoSeleccionado]);

  const varianteSeleccionada = useMemo(
    () => productoSeleccionado?.variantes?.find((v) => v.id === selectedVarianteId) || null,
    [productoSeleccionado, selectedVarianteId]
  );

  const motivesList = tab === 'devueltas' ? MOTIVOS_DEVUELTAS : MOTIVOS_FALLAS;

  const registrosFiltrados = useMemo(
    () => registro
      .filter((item) => item.tipo === tab)
      .filter((item) => !filterMotivo || item.motivo === filterMotivo)
      .filter((item) => !filterBusqueda || 
        item.producto.toLowerCase().includes(filterBusqueda.toLowerCase()) ||
        item.cliente?.toLowerCase().includes(filterBusqueda.toLowerCase())
      ),
    [registro, filterMotivo, filterBusqueda, tab]
  );

  const esDevolucion = tab === 'devueltas';
  const stockDisponible = productoSeleccionado
    ? productoSeleccionado.tieneVariantes
      ? varianteSeleccionada?.stock || 0
      : productoSeleccionado.stock || 0
    : 0;

  const stockAnterior = productoSeleccionado
    ? productoSeleccionado.tieneVariantes
      ? varianteSeleccionada?.stock || 0
      : productoSeleccionado.stock || 0
    : 0;

  const handleAplicarDevolucion = async (event) => {
    event.preventDefault();
    if (!productoSeleccionado) {
      toast.error('Seleccione un producto');
      return;
    }
    if (cantidad <= 0) {
      toast.error('Ingrese una cantidad válida');
      return;
    }
    if (!motivo) {
      toast.error('Seleccione un motivo');
      return;
    }
    if (selectedVentaItem) {
      if (cantidad > selectedVentaItem.cantidad) {
        toast.error('La cantidad no puede ser mayor a la cantidad vendida');
        return;
      }
    } else if (!esDevolucion && cantidad > stockDisponible) {
      toast.error('La cantidad supera el stock disponible');
      return;
    }

    const actualizado = { ...productoSeleccionado };
    if (productoSeleccionado.tieneVariantes && varianteSeleccionada) {
      actualizado.variantes = productoSeleccionado.variantes.map((variante) =>
        variante.id === varianteSeleccionada.id
          ? {
              ...variante,
              stock: Math.max(0, (variante.stock || 0) + (esDevolucion ? cantidad : -cantidad))
            }
          : variante
      );
      actualizado.stock = actualizado.variantes.reduce((sum, v) => sum + (v.stock || 0), 0);
    } else {
      actualizado.stock = Math.max(0, (productoSeleccionado.stock || 0) + (esDevolucion ? cantidad : -cantidad));
    }

    try {
      await mockProductoService.actualizar(productoSeleccionado.id, actualizado);
      setProductos((prev) => prev.map((prod) => (prod.id === actualizado.id ? actualizado : prod)));
      
      const nuevoItem = {
        id: Date.now(),
        tipo: tab,
        ventaId: selectedVenta?.id || null,
        ventaNumero: selectedVenta?.numeroVenta || null,
        cliente: selectedVenta?.cliente || 'Sin vincular',
        producto: productoSeleccionado.nombre,
        variante: varianteSeleccionada ? varianteSeleccionada.id : 'N/A',
        cantidad,
        motivo,
        descripcion,
        reembolso: esDevolucion ? reembolso : '-',
        stockAnterior,
        stockPosterior: actualizado.tieneVariantes 
          ? actualizado.variantes.reduce((sum, v) => sum + (v.stock || 0), 0)
          : actualizado.stock,
        registradoPor: 'Usuario',
        fecha: new Date().toLocaleString('es-AR')
      };

      const nuevoRegistro = [nuevoItem, ...registro];
      setRegistro(nuevoRegistro);
      saveRegistro(nuevoRegistro);
      
      toast.success(esDevolucion ? 'Devolución registrada (stock +)' : 'Falla registrada (stock -)');
      setCantidad(1);
      setDescripcion('');
      setSelectedProductoId('');
      setSelectedVentaNumero('');
    } catch (error) {
      console.error('Error al aplicar devolución:', error);
      toast.error('No se pudo registrar la devolución/falla');
    }
  };

  const handleChangeVentaNumero = (value) => {
    setSelectedVentaNumero(value);
    setSelectedVentaItemId('');
    if (!value) {
      setSelectedProductoId('');
    }
  };

  const handleChangeTab = (newTab) => {
    setTab(newTab);
    setMotivo(newTab === 'devueltas' ? MOTIVOS_DEVUELTAS[0] : MOTIVOS_FALLAS[0]);
    setDescripcion('');
    setSelectedVentaNumero('');
    setSelectedProductoId('');
  };

  const limpiarHistorial = () => {
    const registroFiltrado = registro.filter((item) => item.tipo !== tab);
    setRegistro(registroFiltrado);
    setFilterMotivo('');
    setFilterBusqueda('');
    saveRegistro(registroFiltrado);
    toast.info(`Historial de ${tab} limpiado`);
  };

  return {
    // Estado
    productos,
    ventas,
    loading,
    tab,
    selectedVentaNumero,
    selectedVentaItemId,
    selectedProductoId,
    selectedVarianteId,
    cantidad,
    motivo,
    descripcion,
    reembolso,
    registro,
    filterMotivo,
    filterBusqueda,
    // Computados
    ventasRecientes,
    selectedVenta,
    itemsDeVenta,
    selectedVentaItem,
    productoSeleccionado,
    varianteSeleccionada,
    registrosFiltrados,
    esDevolucion,
    stockDisponible,
    motivesList,
    // Acciones
    setTab: handleChangeTab,
    setSelectedVentaNumero: handleChangeVentaNumero,
    setSelectedVentaItemId,
    setSelectedProductoId,
    setSelectedVarianteId,
    setCantidad,
    setMotivo,
    setDescripcion,
    setReembolso,
    setFilterMotivo,
    setFilterBusqueda,
    handleAplicarDevolucion,
    limpiarHistorial
  };
};
