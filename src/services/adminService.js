import api from './api';

export const adminService = {
  // Exportar base de datos - genera archivo SQL en el backend
  exportarBaseDatos: async () => {
    try {
      const response = await api.post('/admin/exportar-sql');
      return { success: true, message: response.data };
    } catch (error) {
      console.error('Error al exportar base de datos:', error);
      const errorMessage = error.response?.data || 'Error al exportar la base de datos desde el backend';
      throw new Error(errorMessage);
    }
  },

  // Listar backups SQL disponibles en el backend
  listarBackups: async () => {
    try {
      const response = await api.get('/admin/listar-backups');
      return response.data;
    } catch (error) {
      console.error('Error al listar backups:', error);
      throw new Error('Error al obtener la lista de backups');
    }
  },

  // Importar base de datos desde backup SQL seleccionado
  importarBaseDatos: async (filename) => {
    try {
      const response = await api.post(`/admin/importar-sql/${filename}`);
      return { success: true, message: response.data };
    } catch (error) {
      console.error('Error al importar base de datos:', error);
      const errorMessage = error.response?.data || 'Error al importar la base de datos';
      throw new Error(errorMessage);
    }
  },

  // === CONFIGURACIÓN DE EMPRESA ===
  getEmpresaConfig: async () => {
    try {
      const response = await api.get('/admin/empresa');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de empresa:', error);
      throw new Error('Error al obtener la configuración de empresa');
    }
  },

  saveEmpresaConfig: async (config) => {
    try {
      const response = await api.post('/admin/empresa', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de empresa:', error);
      const errorMessage = error.response?.data || 'Error al guardar la configuración de empresa';
      throw new Error(errorMessage);
    }
  },

  // === CONFIGURACIÓN DE IMPUESTOS ===
  getImpuestos: async () => {
    try {
      const response = await api.get('/admin/impuestos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener impuestos:', error);
      throw new Error('Error al obtener la lista de impuestos');
    }
  },

  createImpuesto: async (impuesto) => {
    try {
      const response = await api.post('/admin/impuestos', impuesto);
      return response.data;
    } catch (error) {
      console.error('Error al crear impuesto:', error);
      const errorMessage = error.response?.data || 'Error al crear el impuesto';
      throw new Error(errorMessage);
    }
  },

  updateImpuesto: async (id, updates) => {
    try {
      const response = await api.put(`/admin/impuestos/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar impuesto:', error);
      const errorMessage = error.response?.data || 'Error al actualizar el impuesto';
      throw new Error(errorMessage);
    }
  },

  deleteImpuesto: async (id) => {
    try {
      const response = await api.delete(`/admin/impuestos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar impuesto:', error);
      const errorMessage = error.response?.data || 'Error al eliminar el impuesto';
      throw new Error(errorMessage);
    }
  },

  asignarImpuestoCategoria: async (categoriaId, impuestoId) => {
    try {
      const response = await api.post(`/admin/categorias/${categoriaId}/impuesto`, { impuestoId });
      return response.data;
    } catch (error) {
      console.error('Error al asignar impuesto a categoría:', error);
      const errorMessage = error.response?.data || 'Error al asignar el impuesto';
      throw new Error(errorMessage);
    }
  },

  getCategorias: async () => {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw new Error('Error al obtener la lista de categorías');
    }
  },

  // === CONFIGURACIÓN DE MÉTODOS DE PAGO ===
  getMetodosPago: async () => {
    try {
      const response = await api.get('/admin/metodos-pago');
      return response.data;
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      throw new Error('Error al obtener la lista de métodos de pago');
    }
  },

  createMetodoPago: async (metodo) => {
    try {
      const response = await api.post('/admin/metodos-pago', metodo);
      return response.data;
    } catch (error) {
      console.error('Error al crear método de pago:', error);
      const errorMessage = error.response?.data || 'Error al crear el método de pago';
      throw new Error(errorMessage);
    }
  },

  updateMetodoPago: async (id, updates) => {
    try {
      const response = await api.put(`/admin/metodos-pago/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
      const errorMessage = error.response?.data || 'Error al actualizar el método de pago';
      throw new Error(errorMessage);
    }
  },

  deleteMetodoPago: async (id) => {
    try {
      const response = await api.delete(`/admin/metodos-pago/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      const errorMessage = error.response?.data || 'Error al eliminar el método de pago';
      throw new Error(errorMessage);
    }
  },

  // === CONFIGURACIÓN DE NOTIFICACIONES ===
  getNotificacionesConfig: async () => {
    try {
      const response = await api.get('/admin/notificaciones');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de notificaciones:', error);
      throw new Error('Error al obtener la configuración de notificaciones');
    }
  },

  saveNotificacionesConfig: async (config) => {
    try {
      const response = await api.post('/admin/notificaciones', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de notificaciones:', error);
      const errorMessage = error.response?.data || 'Error al guardar la configuración de notificaciones';
      throw new Error(errorMessage);
    }
  },

  testEmailConfig: async () => {
    try {
      const response = await api.post('/admin/test-email');
      return response.data;
    } catch (error) {
      console.error('Error al probar configuración de email:', error);
      const errorMessage = error.response?.data || 'Error al probar la configuración de email';
      throw new Error(errorMessage);
    }
  },

  testSmsConfig: async () => {
    try {
      const response = await api.post('/admin/test-sms');
      return response.data;
    } catch (error) {
      console.error('Error al probar configuración de SMS:', error);
      const errorMessage = error.response?.data || 'Error al probar la configuración de SMS';
      throw new Error(errorMessage);
    }
  },

  // === CONFIGURACIÓN DE INVENTARIO ===
  getInventarioConfig: async () => {
    try {
      const response = await api.get('/admin/inventario');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de inventario:', error);
      const errorMessage = error.response?.data || 'Error al obtener la configuración de inventario';
      throw new Error(errorMessage);
    }
  },

  saveInventarioConfig: async (config) => {
    try {
      const response = await api.post('/admin/inventario', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de inventario:', error);
      const errorMessage = error.response?.data || 'Error al guardar la configuración de inventario';
      throw new Error(errorMessage);
    }
  },

  // === CONFIGURACIÓN DE INTEGRACIONES ===
  getIntegracionesConfig: async () => {
    try {
      const response = await api.get('/admin/integraciones');
      return response.data;
    } catch (error) {
      console.error('Error al obtener configuración de integraciones:', error);
      const errorMessage = error.response?.data || 'Error al obtener la configuración de integraciones';
      throw new Error(errorMessage);
    }
  },

  saveIntegracionesConfig: async (config) => {
    try {
      const response = await api.post('/admin/integraciones', config);
      return response.data;
    } catch (error) {
      console.error('Error al guardar configuración de integraciones:', error);
      const errorMessage = error.response?.data || 'Error al guardar la configuración de integraciones';
      throw new Error(errorMessage);
    }
  },

  // === INTEGRACIÓN TIENDA NUBE (MOCKS) ===
  testTiendaNubeConnection: async (config) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock: simular conexión exitosa si las credenciales están presentes
    if (config.apiKey && config.userId && config.storeId) {
      return {
        success: true,
        store: {
          id: config.storeId,
          name: "Mi Tienda Online",
          domain: "mitienda.tiendanube.com",
          country: "Argentina",
          currency: "ARS"
        }
      };
    } else {
      return {
        success: false,
        message: "Faltan credenciales de Tienda Nube"
      };
    }
  },

  syncTiendaNube: async (config) => {
    // Simular delay de sincronización
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock: simular sincronización exitosa
    return {
      success: true,
      syncedProducts: config.syncProducts ? Math.floor(Math.random() * 50) + 10 : 0,
      syncedOrders: config.syncOrders ? Math.floor(Math.random() * 20) + 5 : 0,
      syncedCustomers: config.syncCustomers ? Math.floor(Math.random() * 30) + 5 : 0,
      message: "Sincronización completada exitosamente"
    };
  },

  getTiendaNubeProducts: async () => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock: devolver productos simulados
    return [
      {
        id: "1",
        name: "Producto de Ejemplo 1",
        price: 1500.00,
        stock: 25,
        variants: [
          { id: "v1", name: "Talla S", stock: 10 },
          { id: "v2", name: "Talla M", stock: 15 }
        ]
      },
      {
        id: "2",
        name: "Producto de Ejemplo 2",
        price: 2500.00,
        stock: 12,
        variants: []
      },
      {
        id: "3",
        name: "Producto de Ejemplo 3",
        price: 800.00,
        stock: 50,
        variants: [
          { id: "v3", name: "Color Rojo", stock: 20 },
          { id: "v4", name: "Color Azul", stock: 30 }
        ]
      }
    ];
  },

  getTiendaNubeOrders: async () => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock: devolver pedidos simulados
    return [
      {
        id: "1001",
        number: "0001",
        status: "paid",
        total: 4000.00,
        customer: {
          id: "c1",
          name: "Juan Pérez",
          email: "juan@example.com"
        },
        products: [
          { id: "1", name: "Producto 1", quantity: 2, price: 1500.00 },
          { id: "2", name: "Producto 2", quantity: 1, price: 2500.00 }
        ],
        created_at: "2024-01-15T10:30:00Z"
      },
      {
        id: "1002",
        number: "0002",
        status: "fulfilled",
        total: 800.00,
        customer: {
          id: "c2",
          name: "María García",
          email: "maria@example.com"
        },
        products: [
          { id: "3", name: "Producto 3", quantity: 1, price: 800.00 }
        ],
        created_at: "2024-01-14T15:45:00Z"
      }
    ];
  },

  getTiendaNubeCustomers: async () => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock: devolver clientes simulados
    return [
      {
        id: "c1",
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+54911234567",
        addresses: [
          {
            address: "Calle Falsa 123",
            city: "Buenos Aires",
            zipcode: "1234"
          }
        ]
      },
      {
        id: "c2",
        name: "María García",
        email: "maria@example.com",
        phone: "+54911876543",
        addresses: [
          {
            address: "Av. Siempre Viva 742",
            city: "Córdoba",
            zipcode: "5678"
          }
        ]
      },
      {
        id: "c3",
        name: "Carlos López",
        email: "carlos@example.com",
        phone: "+54911555666",
        addresses: []
      }
    ];
  },

  // Obtener configuración específica de Tienda Nube (MOCK)
  getTiendaNubeConfig: async () => {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock: devolver configuración guardada o vacía
    const savedConfig = localStorage.getItem('tiendaNubeConfig');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        return {};
      }
    }
    return {};
  },

  // Guardar configuración específica de Tienda Nube (MOCK)
  saveTiendaNubeConfig: async (config) => {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock: guardar en localStorage
    localStorage.setItem('tiendaNubeConfig', JSON.stringify(config));

    return { success: true, message: "Configuración guardada correctamente" };
  }
};