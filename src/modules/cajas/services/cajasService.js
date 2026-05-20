/**
 * Servicio de Cajas
 * Gestiona operaciones de apertura, cierre y arqueo de cajas
 */

// Mock de datos para desarrollo
const CAJAS_STORAGE_KEY = 'cajasGuardadas';

const loadCajas = () => {
  try {
    return JSON.parse(localStorage.getItem(CAJAS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveCajas = (cajas) => {
  localStorage.setItem(CAJAS_STORAGE_KEY, JSON.stringify(cajas));
};

const todayDate = () => new Date().toISOString().slice(0, 10);
const yesterdayDate = () => {
  const hoy = new Date();
  hoy.setDate(hoy.getDate() - 1);
  return hoy.toISOString().slice(0, 10);
};

const normalizeDate = (fecha) => {
  if (!fecha) return null;
  return fecha.toString().slice(0, 10);
};

const esMismaFecha = (fecha, fechaComparar) => normalizeDate(fecha) === normalizeDate(fechaComparar);

export const cajasService = {
  // Listar todas las cajas
  listar: async () => {
    return {
      data: loadCajas()
    };
  },

  // Obtener caja abierta de hoy o, si no hay, cualquier caja abierta pendiente
  obtenerCajaActual: async () => {
    const cajas = loadCajas();
    let cajaActual = cajas.find(c => c.estado === 'abierta' && esMismaFecha(c.fecha, todayDate()));
    if (!cajaActual) {
      cajaActual = cajas.find(c => c.estado === 'abierta');
    }
    return {
      data: cajaActual || null
    };
  },

  obtenerCajaPorFecha: async (fecha) => {
    const cajas = loadCajas();
    const caja = cajas.find(c => esMismaFecha(c.fecha, fecha));
    return {
      data: caja || null
    };
  },

  obtenerCajaDeAyer: async () => {
    return await cajasService.obtenerCajaPorFecha(yesterdayDate());
  },

  obtenerCajaAbiertaPendiente: async () => {
    const cajas = loadCajas();
    return {
      data: cajas.find(c => c.estado === 'abierta') || null
    };
  },

  // Abrir nueva caja de hoy
  abrirCaja: async (montoInicial, usuario) => {
    const cajas = loadCajas();
    
    const cajaAbiertaHoy = cajas.find(c => c.estado === 'abierta' && esMismaFecha(c.fecha, todayDate()));
    if (cajaAbiertaHoy) {
      throw new Error('Ya existe una caja abierta para hoy');
    }

    const cajaAbiertaAntes = cajas.find(c => c.estado === 'abierta' && !esMismaFecha(c.fecha, todayDate()));
    if (cajaAbiertaAntes) {
      throw new Error('Hay una caja anterior abierta que debe cerrarse primero');
    }

    const nuevaCaja = {
      id: Date.now(),
      fecha: todayDate(),
      horaApertura: new Date().toISOString(),
      estado: 'abierta',
      usuario,
      montoInicial: parseFloat(montoInicial),
      montoActual: parseFloat(montoInicial),
      ventas: [],
      entradas: [],
      salidas: [],
      operaciones: [
        {
          id: 1,
          tipo: 'apertura',
          descripcion: 'Apertura de caja',
          monto: parseFloat(montoInicial),
          fecha: new Date().toISOString(),
          usuario
        }
      ]
    };

    cajas.push(nuevaCaja);
    saveCajas(cajas);

    return { data: nuevaCaja };
  },

  // Registrar entrada/salida
  registrarMovimiento: async (cajasId, tipo, monto, descripcion, usuario) => {
    const cajas = loadCajas();
    const caja = cajas.find(c => c.id === cajasId);

    if (!caja) {
      throw new Error('Caja no encontrada');
    }

    const operacion = {
      id: (caja.operaciones?.length || 0) + 1,
      tipo,
      descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toISOString(),
      usuario
    };

    if (tipo === 'entrada') {
      caja.entradas = [...(caja.entradas || []), operacion];
      caja.montoActual += parseFloat(monto);
    } else if (tipo === 'salida') {
      caja.salidas = [...(caja.salidas || []), operacion];
      caja.montoActual -= parseFloat(monto);
    }

    caja.operaciones = [...(caja.operaciones || []), operacion];
    saveCajas(cajas);

    return { data: caja };
  },

  // Cerrar caja
  cerrarCaja: async (cajasId, montoFinal, usuario) => {
    const cajas = loadCajas();
    const caja = cajas.find(c => c.id === cajasId);

    if (!caja) {
      throw new Error('Caja no encontrada');
    }

    const diferencia = parseFloat(montoFinal) - caja.montoActual;
    const resumen = {
      id: (caja.operaciones?.length || 0) + 1,
      tipo: 'cierre',
      descripcion: 'Cierre de caja',
      montoDeclarado: parseFloat(montoFinal),
      montoSistema: caja.montoActual,
      diferencia,
      fecha: new Date().toISOString(),
      usuario
    };

    caja.operaciones = [...(caja.operaciones || []), resumen];
    caja.estado = 'cerrada';
    caja.resumenCierre = resumen;

    saveCajas(cajas);

    return { data: caja };
  },

  // Obtener resumen de caja
  obtenerResumen: async (cajasId) => {
    const cajas = loadCajas();
    const caja = cajas.find(c => c.id === cajasId);

    if (!caja) {
      throw new Error('Caja no encontrada');
    }

    const totalEntradas = (caja.entradas || []).reduce((sum, e) => sum + e.monto, 0);
    const totalSalidas = (caja.salidas || []).reduce((sum, s) => sum + s.monto, 0);

    return {
      data: {
        cajasId: caja.id,
        estado: caja.estado,
        montoInicial: caja.montoInicial,
        totalEntradas,
        totalSalidas,
        montoCalculado: caja.montoInicial + totalEntradas - totalSalidas,
        montoActual: caja.montoActual,
        diferencia: caja.montoActual - (caja.montoInicial + totalEntradas - totalSalidas),
        operacionesCount: caja.operaciones?.length || 0
      }
    };
  }
};
