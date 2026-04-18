import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ESTADOS_ENVIO } from '../constants';

const ENVIO_STORAGE_KEY = 'enviosGuardados';

const loadEnvios = () => {
  try {
    return JSON.parse(localStorage.getItem(ENVIO_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveEnvios = (envios) => {
  localStorage.setItem(ENVIO_STORAGE_KEY, JSON.stringify(envios));
};

export const useEnvios = () => {
  const [envios, setEnvios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => {
      setEnvios(loadEnvios());
      setLoading(false);
    }, 500);
  }, []);

  const enviosPendientes = useMemo(
    () => envios.filter(envio => envio.estado === ESTADOS_ENVIO.PENDIENTE || envio.estado === ESTADOS_ENVIO.PAGADO),
    [envios]
  );

  const enviosEnProceso = useMemo(
    () => envios.filter(envio => envio.estado === ESTADOS_ENVIO.EN_PREPARACION || envio.estado === ESTADOS_ENVIO.ENVIADO),
    [envios]
  );

  const enviosHistorial = useMemo(
    () => envios.filter(envio => envio.estado === ESTADOS_ENVIO.ENTREGADO || envio.estado === ESTADOS_ENVIO.CANCELADO),
    [envios]
  );

  const crearEnvio = (nuevoEnvio) => {
    const envioConId = {
      ...nuevoEnvio,
      id: Date.now(),
      estado: ESTADOS_ENVIO.PENDIENTE,
      fechaCreacion: new Date().toISOString(),
      tracking: '',
      fechaEstimadaEntrega: null
    };
    const nuevosEnvios = [envioConId, ...envios];
    setEnvios(nuevosEnvios);
    saveEnvios(nuevosEnvios);
    toast.success('Pedido online creado exitosamente');
    return envioConId;
  };

  const actualizarEnvio = (id, updates) => {
    const nuevosEnvios = envios.map(envio =>
      envio.id === id ? { ...envio, ...updates } : envio
    );
    setEnvios(nuevosEnvios);
    saveEnvios(nuevosEnvios);
    toast.success('Pedido actualizado');
  };

  const eliminarEnvio = (id) => {
    const nuevosEnvios = envios.filter(envio => envio.id !== id);
    setEnvios(nuevosEnvios);
    saveEnvios(nuevosEnvios);
    toast.info('Pedido eliminado');
  };

  return {
    envios,
    loading,
    enviosPendientes,
    enviosEnProceso,
    enviosHistorial,
    crearEnvio,
    actualizarEnvio,
    eliminarEnvio
  };
};