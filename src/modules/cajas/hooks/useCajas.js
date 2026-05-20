import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { cajasService } from '../services/cajasService';

const USUARIO_ACTUAL = 'Admin';

export const useCajas = () => {
  const [cajaActual, setCajaActual] = useState(null);
  const [cajaAyer, setCajaAyer] = useState(null);
  const [todasLasCajas, setTodasLasCajas] = useState([]);
  const [resumenCaja, setResumenCaja] = useState(null);
  const [loading, setLoading] = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [cajaRes, cajaAyerRes, cajasRes] = await Promise.all([
        cajasService.obtenerCajaActual(),
        cajasService.obtenerCajaDeAyer(),
        cajasService.listar(),
      ]);

      setCajaActual(cajaRes.data);
      setCajaAyer(cajaAyerRes.data);
      setTodasLasCajas(cajasRes.data || []);

      if (cajaRes.data) {
        const resumenRes = await cajasService.obtenerResumen(cajaRes.data.id);
        setResumenCaja(resumenRes.data);
      } else {
        setResumenCaja(null);
      }
    } catch (error) {
      toast.error(error.message || 'Error al cargar cajas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirCaja = async (montoInicial) => {
    setLoading(true);
    try {
      const res = await cajasService.abrirCaja(montoInicial, USUARIO_ACTUAL);
      setCajaActual(res.data);
      toast.success('Caja abierta exitosamente');
      await cargarDatos();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registrarMovimiento = async (tipo, monto, descripcion) => {
    setLoading(true);
    try {
      await cajasService.registrarMovimiento(
        cajaActual.id,
        tipo,
        monto,
        descripcion,
        USUARIO_ACTUAL
      );
      toast.success(`${tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
      await cargarDatos();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cerrarCaja = async (montoFinal) => {
    setLoading(true);
    try {
      await cajasService.cerrarCaja(cajaActual.id, montoFinal, USUARIO_ACTUAL);
      toast.success('Caja cerrada exitosamente');
      await cargarDatos();
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cajaAbierta = cajaActual?.estado === 'abierta';

  return {
    cajaActual,
    cajaAyer,
    todasLasCajas,
    resumenCaja,
    loading,
    cajaAbierta,
    abrirCaja,
    registrarMovimiento,
    cerrarCaja,
  };
};
