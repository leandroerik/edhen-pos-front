import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useProducts } from '../hooks/useProducts';
import ProductsForm, { FORM_INICIAL } from '../components/ProductsForm';
import PrintBarcodesModal from '../components/PrintBarcodesModal';
import { CatalogoTable, SearchFilterBar, ConfirmDeleteModal } from '../../components';
const ProductosList = () => {
  const { products, categories, attributes, loading, crear, actualizar, eliminar, toggleActivo } = useProducts();

  const [searchTerm, setSearchTerm]           = useState('');
  const [showModal, setShowModal]             = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData]               = useState(FORM_INICIAL);
  const [errors, setErrors]                   = useState({});
  const [saving, setSaving]                   = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);
  const [printProducto,   setPrintProducto]   = useState(null);

  const filtrados = products.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = (data) => {
    const e = {};
    if (!data.nombre?.trim() || data.nombre.trim().length < 2)
      e.nombre = 'El nombre debe tener al menos 2 caracteres';
    if (!data.descripcion?.trim())
      e.descripcion = 'La descripción es obligatoria';
    if (!data.categoriaId)
      e.categoriaId = 'La categoría es obligatoria';
    if (!data.precioBase || parseFloat(data.precioBase) < 0)
      e.precioBase = 'El precio base es inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const abrirCrear = () => {
    setEditingProducto(null);
    setFormData(FORM_INICIAL);
    setErrors({});
    setShowModal(true);
  };

  const abrirEditar = (producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre:          producto.nombre          || '',
      descripcion:     producto.descripcion     || '',
      categoriaId:     producto.categoriaId     || '',
      precioBase:      producto.precioBase      || '',
      codigoBarras:    producto.codigoBarras    || '',
      atributosUsados: producto.atributosUsados || [],
      variants:        producto.variants        || [],
      activo:          producto.activo          ?? true,
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingProducto(null);
    setErrors({});
  };

  const handleGuardar = async (finalData) => {
    if (!validar(finalData)) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      if (editingProducto) {
        actualizar(editingProducto.id, finalData);
      } else {
        crear(finalData);
      }
      cerrarModal();
    } catch {
      toast.error('Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    if (!confirmEliminar) return;
    try {
      eliminar(confirmEliminar.id);
    } catch {
      toast.error('Error al eliminar el producto');
    } finally {
      setConfirmEliminar(null);
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Producto',
      width: '28%',
      render: (value) => (
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#e9ecef', color: '#495057',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {value.charAt(0).toUpperCase()}
          </div>
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'categoriaId',
      label: 'Categoría',
      width: '18%',
      render: (value) => {
        const cat = categories.find((c) => c.id === Number(value));
        return cat ? (
          <span className="d-flex align-items-center gap-2">
            <i className={`fa ${cat.icono || 'fa-tag'} text-primary`}></i>
            {cat.nombre}
          </span>
        ) : <span className="text-muted">—</span>;
      },
    },
    {
      key: 'precioBase',
      label: 'Precio',
      width: '12%',
      render: (value) => <span className="fw-semibold">${parseFloat(value || 0).toFixed(2)}</span>,
    },
    {
      key: 'atributosUsados',
      label: 'Atributos',
      width: '22%',
      render: (value) => (
        <small className="text-muted">
          {Array.isArray(value) && value.length > 0 ? value.join(', ') : 'Sin variantes'}
        </small>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      width: '12%',
      render: (value, row) => (
        <span
          onClick={() => toggleActivo(row)}
          style={{ cursor: 'pointer' }}
          className={`badge rounded-pill px-3 py-2 ${value ? 'text-bg-success' : 'text-bg-secondary'}`}
        >
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-3 pb-2 border-bottom">
        <div className="col-md-8">
          <h1 className="h3 fw-bold mb-1">
            <i className="fa fa-box me-3 text-primary"></i>Productos
          </h1>
          <p className="text-muted mb-0 small">Administrá el catálogo de productos y sus variantes</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nuevo Producto
          </button>
        </div>
      </div>

      <div className="mb-3">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar por nombre o descripción..."
        />
      </div>

      <CatalogoTable
        data={filtrados}
        columns={columns}
        loading={loading}
        onEdit={abrirEditar}
        onPrint={(producto) => setPrintProducto(producto)}
        onDelete={(id) => {
          const producto = filtrados.find((p) => p.id === id);
          if (producto) setConfirmEliminar(producto);
        }}
      />

      {showModal && (
        <ProductsForm
          editingId={editingProducto?.id}
          formData={formData}
          onChange={handleChange}
          errors={errors}
          onSave={handleGuardar}
          onCancel={cerrarModal}
          loading={saving}
          attributes={attributes}
          categories={categories}
        />
      )}

      {printProducto && (
        <PrintBarcodesModal
          producto={printProducto}
          onClose={() => setPrintProducto(null)}
        />
      )}

      {confirmEliminar && (
        <ConfirmDeleteModal
          nombre={confirmEliminar.nombre}
          entidad="producto"
          onConfirm={handleEliminar}
          onCancel={() => setConfirmEliminar(null)}
        />
      )}
    </div>
  );
};

export default ProductosList;
