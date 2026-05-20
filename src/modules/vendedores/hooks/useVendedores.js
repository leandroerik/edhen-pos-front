import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { usuarioService } from '../../../services/api';

export const useVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarVendedores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usuarioService.listar();
      setVendedores((res.data || []).filter((u) => u.rol === 'vendedor'));
    } catch {
      toast.error('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVendedores();
  }, [cargarVendedores]);

  const crear = async (data) => {
    const res = await usuarioService.crear({ ...data, rol: 'vendedor' });
    setVendedores((prev) => [...prev, res.data]);
    toast.success('Vendedor creado');
  };

  const actualizar = async (id, data) => {
    const res = await usuarioService.actualizar(id, data);
    setVendedores((prev) => prev.map((v) => (v.id === id ? res.data : v)));
    toast.success('Vendedor actualizado');
  };

  const eliminar = async (id) => {
    await usuarioService.eliminar(id);
    setVendedores((prev) => prev.filter((v) => v.id !== id));
    toast.success('Vendedor eliminado');
  };

  const toggleActivo = async (vendedor) => {
    const nuevoEstado = vendedor.estado === 'activo' ? 'inactivo' : 'activo';
    const res = await usuarioService.actualizar(vendedor.id, { ...vendedor, estado: nuevoEstado });
    setVendedores((prev) => prev.map((v) => (v.id === vendedor.id ? res.data : v)));
    toast.success(`Vendedor ${nuevoEstado}`);
  };

  return { vendedores, loading, crear, actualizar, eliminar, toggleActivo };
};
