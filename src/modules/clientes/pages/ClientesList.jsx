import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useClientes } from '../hooks/useClientes';
import ClientForm from '../components/ClientForm';
import { AddressModal } from '../components/Addresses';
import { CatalogoTable, SearchFilterBar } from '../../catalogo/components';

const FORM_INICIAL = {
  tipoCliente: 'individual',
  estado:      'activo',
  nombre:      '',
  ruc:         '',
  email:       '',
  telefono:    '',
};

const ClientesList = () => {
  const {
    clientes, loading,
    crear, actualizar, eliminar, toggleEstado,
    agregarDireccion, actualizarDireccion, eliminarDireccion, setDireccionDefault,
  } = useClientes();

  const [searchTerm,       setSearchTerm]       = useState('');
  const [showModal,        setShowModal]         = useState(false);
  const [editingCliente,   setEditingCliente]    = useState(null);
  const [formData,         setFormData]          = useState(FORM_INICIAL);
  const [errors,           setErrors]            = useState({});
  const [saving,           setSaving]            = useState(false);
  const [confirmEliminar,  setConfirmEliminar]   = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const filtrados       = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.telefono || '').includes(searchTerm)
  );
  const selectedCliente = clientes.find((c) => c.id === selectedClientId) || null;

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
    if (formData.tipoCliente === 'empresa' && !formData.ruc.trim())
      e.ruc = 'El CUIT/RUC es requerido para empresas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const abrirCrear = () => {
    setEditingCliente(null);
    setFormData(FORM_INICIAL);
    setErrors({});
    setShowModal(true);
  };

  const abrirEditar = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      tipoCliente: cliente.tipoCliente || 'individual',
      estado:      cliente.estado      || 'activo',
      nombre:      cliente.nombre      || '',
      ruc:         cliente.ruc         || '',
      email:       cliente.email       || '',
      telefono:    cliente.telefono    || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setErrors({});
  };

  const handleGuardar = () => {
    if (!validar()) {
      toast.error('Corregí los errores antes de guardar');
      return;
    }
    setSaving(true);
    try {
      if (editingCliente) {
        actualizar(editingCliente.id, formData);
      } else {
        crear(formData);
      }
      cerrarModal();
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = () => {
    if (!confirmEliminar) return;
    try {
      eliminar(confirmEliminar.id);
    } catch {
      toast.error('Error al eliminar el cliente');
    } finally {
      setConfirmEliminar(null);
    }
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Cliente',
      width: '28%',
      render: (value, row) => (
        <div className="d-flex align-items-center gap-2">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#e9ecef', color: '#495057',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="fw-semibold">{value}</div>
            {row.ruc && <div className="text-muted" style={{ fontSize: '0.75rem' }}>CUIT: {row.ruc}</div>}
          </div>
        </div>
      ),
    },
    { key: 'email',    label: 'Email',    width: '22%' },
    { key: 'telefono', label: 'Teléfono', width: '13%' },
    {
      key: 'tipoCliente',
      label: 'Tipo',
      width: '10%',
      render: (value) => (
        <span className={`badge rounded-pill ${value === 'empresa' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
          {value === 'empresa' ? 'Empresa' : 'Individual'}
        </span>
      ),
    },
    {
      key: 'direcciones',
      label: 'Envíos',
      width: '10%',
      render: (value, row) => (
        <span
          onClick={() => setSelectedClientId(row.id)}
          style={{ cursor: 'pointer' }}
          className="badge rounded-pill text-bg-light border px-3 py-2"
          title="Gestionar direcciones de envío"
        >
          <i className="fa fa-map-pin me-1 text-secondary" />
          {(value || []).length}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      width: '10%',
      render: (value, row) => (
        <span
          onClick={() => toggleEstado(row)}
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
            <i className="fa fa-users me-3 text-primary"></i>Clientes
          </h1>
          <p className="text-muted mb-0 small">Gestioná clientes, contactos y direcciones de envío</p>
        </div>
        <div className="col-md-4 d-flex align-items-center justify-content-end">
          <button className="btn btn-primary" onClick={abrirCrear} disabled={loading}>
            <i className="fa fa-plus me-2"></i>Nuevo Cliente
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
          const cliente = filtrados.find((c) => c.id === id);
          if (cliente) setConfirmEliminar(cliente);
        }}
      />

      {showModal && (
        <ClientForm
          editingId={editingCliente?.id}
          formData={formData}
          onChange={handleChange}
          errors={errors}
          onSave={handleGuardar}
          onCancel={cerrarModal}
          loading={saving}
        />
      )}

      {selectedCliente && (
        <AddressModal
          cliente={selectedCliente}
          onClose={() => setSelectedClientId(null)}
          onAgregar={(d)        => agregarDireccion(selectedCliente.id, d)}
          onActualizar={(id, d) => actualizarDireccion(selectedCliente.id, id, d)}
          onEliminar={(id)      => eliminarDireccion(selectedCliente.id, id)}
          onSetDefault={(id)    => setDireccionDefault(selectedCliente.id, id)}
        />
      )}

      {confirmEliminar && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  <i className="fa fa-triangle-exclamation text-warning me-2"></i>
                  Eliminar cliente
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

export default ClientesList;
