import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ClientForm from '../components/ClientForm';
import ClientTable from '../components/ClientTable';
import { AddressModal } from '../components/Addresses';
import SearchFilterBar from '../../catalogo/components/SearchFilterBar';
import styles from './ClientesList.module.css';

/**
 * Página de Listado de Clientes
 * Integra ClientForm, ClientTable y AddressModal
 * @component
 */
const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [formData, setFormData] = useState({
    tipoCliente: 'individual',
    estado: 'activo',
    nombre: '',
    ruc: '',
    email: '',
    telefono: '',
    direcciones: []
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      // Mock data con estructura completa
      const mockClientes = [
        { 
          id: 1, 
          tipoCliente: 'individual',
          nombre: 'Juan García López', 
          email: 'juan@email.com', 
          telefono: '(011) 1234-5678',
          estado: 'activo',
          ruc: '',
          direcciones: [
            {
              id: 1,
              calle: 'Avenida Santa Fe',
              numero: '3456',
              piso: '5',
              depto: 'A',
              codigoPostal: 'C1425',
              localidad: 'San Nicolás',
              provincia: 'CABA',
              transportista: 'Correo Argentino',
              tipoEnvio: 'Domicilio',
              codigoCliente: 'CA-123456',
              esPorDefecto: true
            }
          ]
        },
        { 
          id: 2, 
          tipoCliente: 'empresa',
          nombre: 'Tienda Central EIRL', 
          email: 'info@tiendacentral.com', 
          telefono: '(011) 4567-8901',
          estado: 'activo',
          ruc: '30-12345678-9',
          direcciones: [
            {
              id: 2,
              calle: 'Calle Rivadavia',
              numero: '789',
              piso: '',
              depto: '',
              codigoPostal: 'B1636',
              localidad: 'Olivos',
              provincia: 'Buenos Aires',
              transportista: 'OCA',
              tipoEnvio: 'Domicilio',
              codigoCliente: 'OCA-456789',
              esPorDefecto: true
            }
          ]
        }
      ];
      setClientes(mockClientes);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const validarNombre = (value) => {
    if (!value || !value.trim()) return 'El nombre es requerido';
    if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (value.trim().length > 100) return 'El nombre no puede exceder 100 caracteres';
    return '';
  };

  const validarEmail = (value) => {
    if (!value || !value.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Email no válido';
  };

  const validarTelefono = (value) => {
    if (!value || !value.trim()) return 'El teléfono es requerido';
    const phoneRegex = /^\s*(\+?[0-9]{1,3})?\s*[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\s*$/;
    return phoneRegex.test(value) ? '' : 'Teléfono no válido (ej: (011) 1234-5678)';
  };

  const validarRuc = (value) => {
    if (formData.tipoCliente === 'empresa') {
      if (!value || !value.trim()) return 'El RUC es requerido para empresas';
      return '';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (validarNombre(formData.nombre)) newErrors.nombre = validarNombre(formData.nombre);
    if (validarEmail(formData.email)) newErrors.email = validarEmail(formData.email);
    if (validarTelefono(formData.telefono)) newErrors.telefono = validarTelefono(formData.telefono);
    if (validarRuc(formData.ruc)) newErrors.ruc = validarRuc(formData.ruc);

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFieldBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    let error = '';
    if (name === 'nombre') error = validarNombre(formData.nombre);
    if (name === 'email') error = validarEmail(formData.email);
    if (name === 'telefono') error = validarTelefono(formData.telefono);
    if (name === 'ruc') error = validarRuc(formData.ruc);

    if (error) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Por favor corrige los errores');
      return;
    }

    try {
      if (editingId) {
        setClientes(prev => 
          prev.map(c => c.id === editingId ? { ...c, ...formData } : c)
        );
        toast.success('Cliente actualizado');
      } else {
        const newId = Math.max(...clientes.map(c => c.id), 0) + 1;
        setClientes(prev => [...prev, { ...formData, id: newId }]);
        toast.success('Cliente creado');
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const resetForm = () => {
    setFormData({
      tipoCliente: 'individual',
      estado: 'activo',
      nombre: '',
      ruc: '',
      email: '',
      telefono: '',
      direcciones: []
    });
    setEditingId(null);
    setValidationErrors({});
    setTouchedFields({});
  };

  const handleEdit = (cliente) => {
    setFormData(cliente);
    setEditingId(cliente.id);
    setValidationErrors({});
    setTouchedFields({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado');
    }
  };

  const handleToggleEstado = (id) => {
    setClientes(prev => 
      prev.map(c => 
        c.id === id 
          ? { ...c, estado: c.estado === 'activo' ? 'inactivo' : 'activo' }
          : c
      )
    );
    const cliente = clientes.find(c => c.id === id);
    toast.success(`Cliente ${cliente?.nombre} ${cliente?.estado === 'activo' ? 'desactivado' : 'activado'}`);
  };

  const handleManageAddresses = (client) => {
    setSelectedClient(client);
    setShowAddressModal(true);
  };

  const handleAddAddress = (address) => {
    if (selectedClient) {
      const addressWithId = {
        ...address,
        id: Date.now()
      };
      setClientes(prev =>
        prev.map(c =>
          c.id === selectedClient.id
            ? {
                ...c,
                direcciones: [...(c.direcciones || []), addressWithId]
              }
            : c
        )
      );
      setSelectedClient(prev => ({
        ...prev,
        direcciones: [...(prev?.direcciones || []), addressWithId]
      }));
      toast.success('Dirección agregada');
    }
  };

  const handleDeleteAddress = (clientId, addressId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      setClientes(prev =>
        prev.map(c =>
          c.id === clientId
            ? {
                ...c,
                direcciones: c.direcciones.filter(d => d.id !== addressId)
              }
            : c
        )
      );
      
      if (selectedClient?.id === clientId) {
        setSelectedClient(prev => ({
          ...prev,
          direcciones: prev?.direcciones?.filter(d => d.id !== addressId)
        }));
      }
      toast.success('Dirección eliminada');
    }
  };

  const handleSetDefault = (clientId, addressId) => {
    setClientes(prev =>
      prev.map(c =>
        c.id === clientId
          ? {
              ...c,
              direcciones: c.direcciones.map(d => ({
                ...d,
                esPorDefecto: d.id === addressId
              }))
            }
          : c
      )
    );

    if (selectedClient?.id === clientId) {
      setSelectedClient(prev => ({
        ...prev,
        direcciones: prev?.direcciones?.map(d => ({
          ...d,
          esPorDefecto: d.id === addressId
        }))
      }));
    }
    toast.success('Dirección establecida como predeterminada');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className="h4 mb-0">
            <i className="fa fa-users me-2"></i>
            Clientes
          </h2>
          <p className="text-muted small mb-0">Gestión de clientes, contactos y direcciones de envío</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <i className="fa fa-plus me-2"></i>
          Nuevo Cliente
        </button>
      </div>

      <SearchFilterBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClear={() => setSearchTerm('')}
        placeholder="Buscar por nombre, email o teléfono..."
      />

      <ClientTable
        clients={filteredClientes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEstado={handleToggleEstado}
        onManageAddresses={handleManageAddresses}
      />

      <ClientForm
        showModal={showModal}
        editingId={editingId}
        formData={formData}
        validationErrors={validationErrors}
        touchedFields={touchedFields}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        onChange={handleChange}
        onFieldBlur={handleFieldBlur}
        onSubmit={handleSubmit}
      />

      <AddressModal
        showModal={showAddressModal}
        client={selectedClient}
        onClose={() => {
          setShowAddressModal(false);
          setSelectedClient(null);
        }}
        onAddAddress={handleAddAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefault={handleSetDefault}
      />
    </div>
  );
};

export default ClientesList;