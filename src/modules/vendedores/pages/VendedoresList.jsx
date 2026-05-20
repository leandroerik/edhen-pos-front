import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useVendedores } from '../hooks/useVendedores';
import VendedorForm, { FORM_INICIAL, PERMISOS_DISPONIBLES } from '../components/VendedorForm';
import { CatalogoTable, SearchFilterBar } from '../../catalogo/components';

const VendedoresList = () => {
  const { vendedores, loading, crear, actualizar, eliminar, toggleActivo } = useVendedores();

  const [searchTerm, setSearchTerm]           = useState('');
  const [showModal, setShowModal]             = useState(false);
  const [editingVendedor, setEditingVendedor] = useState(null);
  const [formData, setFormData]               = useState(FORM_INICIAL);
  const [errors, setErrors]                   = useState({});
  const [saving, setSaving]                   = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const filtrados = vendedores.filter((v) =>
    v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.telefono || '').includes(searchTerm)
  );

  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const e = {};
    if (!formData.nombre.trim() || formData.nombre.trim().length < 3)
      e.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Email no válido';
    if (!formData.telefono.trim())
      e.telefono = 'El teléfono es requerido';
    if (formData.dni && !/^\d{7,8}$/.test(formData.dni))
      e.dni = 'El DNI debe tener 7 u 8 dígitos';
    if (formData.permisos.length === 0)
      e.permisos = 'Seleccioná al menos un permiso';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const abrirCrear = () => {
    setEditingVendedor(null);
    setFormData(FORM_INICIAL);
    setErrors({});
    setShowModal(true);
  };

  const abrirEditar = (vendedor) => {
    setEditingVendedor(vendedor);
    setFormData({
      nombre:    vendedor.nombre    || '',
      email:     vendedor.email     || '',
      telefono:  vendedor.telefono  || '',
      dni:       vendedor.dni       || '',
      direccion: vendedor.direccion || '',
      estado:    vendedor.estado    || 'activo',
      permisos:  Array.isArray(vendedor.permisos) ? vendedor.permisos : [],
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingVendedor(null);
    setErrors({});
  };

  const handleGuardar = async () => {
    if (!validar()) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      if (editingVendedor) {
        await actualizar(editingVendedor.id, formData);
      } else {
        await crear(formData);
      }
      cerrarModal();
    } catch {
      toast.error('Error al guardar el vendedor');
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    try {
      await eliminar(confirmEliminar.id);
    } catch {
      toast.error('Error al eliminar el vendedor');
    } finally {
      setConfirmEliminar(null);
    }
  };

  const handleToggle = async (vendedor) => {
    try {
      await toggleActivo(vendedor);
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      width: '25%',
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
    { key: 'email',    label: 'Email',    width: '25%' },
    { key: 'telefono', label: 'Teléfono', width: '15%' },
    {
      key: 'permisos',
      label: 'Permisos',
      width: '20%',
      render: (value) => {
        const lista = Array.isArray(value) ? value : [];
        if (lista.length === 0) return <span className="text-muted">—</span>;
        return (
          <div className="d-flex gap-2 align-items-center">
            {lista.map((p) => {
              const permiso = PERMISOS_DISPONIBLES.find((x) => x.id === p);
              return (
                <i
                  key={p}
                  className={`fa ${permiso?.icon || 'fa-circle'} text-secondary`}
                  title={permiso?.label || p}
                  style={{ fontSize: '0.9rem' }}
                />
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '15%',
      render: (value, row) => (
        <span
          onClick={() => handleToggle(row)}
          style={{ cursor: 'pointer' }}
          className={`badge rounded-pill px-3 py-2 ${value === 'activo' ? 'text-bg-success' : 'text-bg-secondary'}`}
        >
          {value === 'activo' ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="row mb-3 pb-2 border-bottom">
        <div className="col-md-8">
          <h1 className="h3 fw-bold mb-1">
            <i className="fa fa-user-tie me-3 text-primary"></i>Vendedores
          </h1>
          <p className="text-muted mb-0 small">Gestioná vendedores, permisos y acceso al sistema</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nuevo Vendedor
          </button>
        </div>
      </div>

      <div className="mb-3">
        <SearchFilterBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar por nombre, email o teléfono..."
        />
      </div>

      <CatalogoTable
        data={filtrados}
        columns={columns}
        loading={loading}
        onEdit={abrirEditar}
        onDelete={(id) => {
          const vendedor = filtrados.find((v) => v.id === id);
          if (vendedor) setConfirmEliminar(vendedor);
        }}
      />

      {showModal && (
        <VendedorForm
          editingId={editingVendedor?.id}
          formData={formData}
          onChange={handleChange}
          errors={errors}
          onSave={handleGuardar}
          onCancel={cerrarModal}
          loading={saving}
        />
      )}

      {confirmEliminar && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <i className="fa fa-triangle-exclamation text-warning me-2"></i>
                  Eliminar vendedor
                </h5>
              </div>
              <div className="modal-body">
                ¿Estás seguro de que querés eliminar a{' '}
                <strong>{confirmEliminar.nombre}</strong>? Esta acción no se puede deshacer.
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => setConfirmEliminar(null)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleEliminar}>
                  <i className="fa fa-trash me-2"></i>Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendedoresList;
