import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const MOCK_CLIENTES = [
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
        esPorDefecto: true,
      },
    ],
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
        esPorDefecto: true,
      },
    ],
  },
];

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading]   = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      setClientes(MOCK_CLIENTES);
    } catch {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const crear = (data) => {
    const id = Math.max(...clientes.map((c) => c.id), 0) + 1;
    setClientes((prev) => [...prev, { ...data, id, direcciones: [] }]);
    toast.success('Cliente creado');
  };

  const actualizar = (id, data) => {
    setClientes((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    toast.success('Cliente actualizado');
  };

  const eliminar = (id) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    toast.success('Cliente eliminado');
  };

  const toggleEstado = (cliente) => {
    const nuevo = cliente.estado === 'activo' ? 'inactivo' : 'activo';
    setClientes((prev) => prev.map((c) => (c.id === cliente.id ? { ...c, estado: nuevo } : c)));
    toast.success(`${cliente.nombre} ${nuevo}`);
  };

  const agregarDireccion = (clienteId, direccion) => {
    const conId = { ...direccion, id: Date.now() };
    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? { ...c, direcciones: [...(c.direcciones || []), conId] }
          : c
      )
    );
    toast.success('Dirección agregada');
  };

  const actualizarDireccion = (clienteId, direccionId, data) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? { ...c, direcciones: c.direcciones.map((d) => (d.id === direccionId ? { ...d, ...data } : d)) }
          : c
      )
    );
    toast.success('Dirección actualizada');
  };

  const eliminarDireccion = (clienteId, direccionId) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? { ...c, direcciones: c.direcciones.filter((d) => d.id !== direccionId) }
          : c
      )
    );
    toast.success('Dirección eliminada');
  };

  const setDireccionDefault = (clienteId, direccionId) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? { ...c, direcciones: c.direcciones.map((d) => ({ ...d, esPorDefecto: d.id === direccionId })) }
          : c
      )
    );
  };

  return {
    clientes, loading,
    crear, actualizar, eliminar, toggleEstado,
    agregarDireccion, actualizarDireccion, eliminarDireccion, setDireccionDefault,
  };
};
