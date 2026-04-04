// Mock data para productos
export const productosData = [
  {
    id: 1,
    nombre: 'Laptop Dell',
    modelo: 'XPS 13',
    precio: 1200.00,
    categoria: 'Electrónica',
    activo: true,
    stock: 10
  },
  {
    id: 2,
    nombre: 'Mouse Logitech',
    modelo: 'MX Master 3',
    precio: 99.99,
    categoria: 'Accesorios',
    activo: true,
    stock: 25
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico',
    modelo: 'K380',
    precio: 79.99,
    categoria: 'Accesorios',
    activo: true,
    stock: 15
  },
  {
    id: 4,
    nombre: 'Monitor LG',
    modelo: '24UD58',
    precio: 299.00,
    categoria: 'Monitores',
    activo: true,
    stock: 8
  },
  {
    id: 5,
    nombre: 'Webcam Logitech',
    modelo: 'C920',
    precio: 89.99,
    categoria: 'Accesorios',
    activo: true,
    stock: 20
  },
  {
    id: 6,
    nombre: 'Headphones Sony',
    modelo: 'WH-1000XM4',
    precio: 349.99,
    categoria: 'Audio',
    activo: true,
    stock: 12
  }
];

// Mock data para clientes
export const clientesData = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '555-1234',
    ciudad: 'Buenos Aires',
    activo: true
  },
  {
    id: 2,
    nombre: 'María García',
    email: 'maria@example.com',
    telefono: '555-5678',
    ciudad: 'Córdoba',
    activo: true
  },
  {
    id: 3,
    nombre: 'Carlos López',
    email: 'carlos@example.com',
    telefono: '555-9012',
    ciudad: 'Rosario',
    activo: true
  }
];

// Mock data para ventas
export const ventasData = [
  {
    id: 1,
    fecha: '2026-04-01',
    cliente: 'Juan Pérez',
    total: 1289.99,
    estado: 'Completada'
  },
  {
    id: 2,
    fecha: '2026-04-02',
    cliente: 'María García',
    total: 429.97,
    estado: 'Completada'
  },
  {
    id: 3,
    fecha: '2026-04-03',
    cliente: 'Carlos López',
    total: 349.99,
    estado: 'Pendiente'
  }
];

// Mock Services
export const mockClienteService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: clientesData });
      }, 500);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: clientesData.find(c => c.id === id) });
      }, 300);
    });
  },
  crear: async (cliente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoCliente = { ...cliente, id: clientesData.length + 1 };
        clientesData.push(nuevoCliente);
        resolve({ data: nuevoCliente });
      }, 500);
    });
  },
  actualizar: async (id, cliente) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = clientesData.findIndex(c => c.id === id);
        if (idx !== -1) {
          clientesData[idx] = { ...clientesData[idx], ...cliente };
        }
        resolve({ data: clientesData[idx] });
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = clientesData.findIndex(c => c.id === id);
        if (idx !== -1) {
          clientesData.splice(idx, 1);
        }
        resolve({ data: { success: true } });
      }, 500);
    });
  }
};

export const mockProductoService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData });
      }, 500);
    });
  },
  obtener: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData.find(p => p.id === id) });
      }, 300);
    });
  },
  crear: async (producto) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoProducto = { ...producto, id: productosData.length + 1 };
        productosData.push(nuevoProducto);
        resolve({ data: nuevoProducto });
      }, 500);
    });
  },
  actualizar: async (id, producto) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = productosData.findIndex(p => p.id === id);
        if (idx !== -1) {
          productosData[idx] = { ...productosData[idx], ...producto };
        }
        resolve({ data: productosData[idx] });
      }, 500);
    });
  },
  eliminar: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = productosData.findIndex(p => p.id === id);
        if (idx !== -1) {
          productosData.splice(idx, 1);
        }
        resolve({ data: { success: true } });
      }, 500);
    });
  }
};

export const mockSkuService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 500);
    });
  }
};

export const mockVentaService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: ventasData });
      }, 500);
    });
  },
  crear: async (venta) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaVenta = { ...venta, id: ventasData.length + 1 };
        ventasData.push(nuevaVenta);
        resolve({ data: nuevaVenta });
      }, 500);
    });
  }
};

export const mockReporteService = {
  ventasPorPeriodo: async (desde, hasta) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: ventasData });
      }, 500);
    });
  },
  productosMasVendidos: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: productosData.slice(0, 10) });
      }, 500);
    });
  }
};

export const mockDocumentoService = {
  listar: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 500);
    });
  }
};
