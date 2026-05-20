import api from './api';

export const tiendaNubeService = {
  // Configuración base de la API de Tienda Nube
  baseURL: 'https://api.tiendanube.com/v1',

  // Construir headers de autenticación
  getAuthHeaders: (config) => {
    return {
      'Authentication': `bearer ${config.apiKey}`,
      'User-Agent': `POS-System (${config.userId})`,
      'Content-Type': 'application/json'
    };
  },

  // Probar conexión con Tienda Nube
  testConnection: async (config) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/store`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        store: data
      };
    } catch (error) {
      console.error('Error testing Tienda Nube connection:', error);
      return {
        success: false,
        message: error.message || 'Error al conectar con Tienda Nube'
      };
    }
  },

  // Obtener productos de Tienda Nube
  getProducts: async (config, params = {}) => {
    try {
      const headers = this.getAuthHeaders(config);
      const queryParams = new URLSearchParams(params);
      const url = `${this.baseURL}/${config.storeId}/products?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting products from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener productos de Tienda Nube');
    }
  },

  // Obtener un producto específico
  getProduct: async (config, productId) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/products/${productId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting product from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener producto de Tienda Nube');
    }
  },

  // Obtener pedidos de Tienda Nube
  getOrders: async (config, params = {}) => {
    try {
      const headers = this.getAuthHeaders(config);
      const queryParams = new URLSearchParams(params);
      const url = `${this.baseURL}/${config.storeId}/orders?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting orders from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener pedidos de Tienda Nube');
    }
  },

  // Obtener un pedido específico
  getOrder: async (config, orderId) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/orders/${orderId}`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting order from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener pedido de Tienda Nube');
    }
  },

  // Obtener clientes de Tienda Nube
  getCustomers: async (config, params = {}) => {
    try {
      const headers = this.getAuthHeaders(config);
      const queryParams = new URLSearchParams(params);
      const url = `${this.baseURL}/${config.storeId}/customers?${queryParams}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting customers from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener clientes de Tienda Nube');
    }
  },

  // Actualizar stock de un producto
  updateProductStock: async (config, productId, variantId, stock) => {
    try {
      const headers = this.getAuthHeaders(config);
      const updateData = {
        stock: stock
      };

      const url = variantId
        ? `${this.baseURL}/${config.storeId}/products/${productId}/variants/${variantId}`
        : `${this.baseURL}/${config.storeId}/products/${productId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product stock in Tienda Nube:', error);
      throw new Error(error.message || 'Error al actualizar stock en Tienda Nube');
    }
  },

  // Crear webhook
  createWebhook: async (config, webhookData) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/webhooks`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating webhook in Tienda Nube:', error);
      throw new Error(error.message || 'Error al crear webhook en Tienda Nube');
    }
  },

  // Obtener webhooks existentes
  getWebhooks: async (config) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/webhooks`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting webhooks from Tienda Nube:', error);
      throw new Error(error.message || 'Error al obtener webhooks de Tienda Nube');
    }
  },

  // Eliminar webhook
  deleteWebhook: async (config, webhookId) => {
    try {
      const headers = this.getAuthHeaders(config);
      const response = await fetch(`${this.baseURL}/${config.storeId}/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting webhook from Tienda Nube:', error);
      throw new Error(error.message || 'Error al eliminar webhook de Tienda Nube');
    }
  },

  // Sincronizar productos desde Tienda Nube hacia el POS
  syncProductsFromTiendaNube: async (config) => {
    try {
      const tiendaNubeProducts = await this.getProducts(config);
      const syncedProducts = [];

      for (const tnProduct of tiendaNubeProducts) {
        // Aquí iría la lógica para mapear y guardar el producto en el POS
        // Por ahora solo retornamos la información
        syncedProducts.push({
          id: tnProduct.id,
          name: tnProduct.name,
          price: tnProduct.price,
          stock: tnProduct.stock,
          variants: tnProduct.variants || []
        });
      }

      return {
        success: true,
        syncedCount: syncedProducts.length,
        products: syncedProducts
      };
    } catch (error) {
      console.error('Error syncing products from Tienda Nube:', error);
      return {
        success: false,
        message: error.message || 'Error al sincronizar productos desde Tienda Nube'
      };
    }
  },

  // Sincronizar pedidos desde Tienda Nube hacia el POS
  syncOrdersFromTiendaNube: async (config) => {
    try {
      const tiendaNubeOrders = await this.getOrders(config);
      const syncedOrders = [];

      for (const tnOrder of tiendaNubeOrders) {
        // Aquí iría la lógica para mapear y guardar el pedido en el POS
        syncedOrders.push({
          id: tnOrder.id,
          number: tnOrder.number,
          status: tnOrder.status,
          total: tnOrder.total,
          customer: tnOrder.customer,
          products: tnOrder.products || []
        });
      }

      return {
        success: true,
        syncedCount: syncedOrders.length,
        orders: syncedOrders
      };
    } catch (error) {
      console.error('Error syncing orders from Tienda Nube:', error);
      return {
        success: false,
        message: error.message || 'Error al sincronizar pedidos desde Tienda Nube'
      };
    }
  },

  // Sincronizar clientes desde Tienda Nube hacia el POS
  syncCustomersFromTiendaNube: async (config) => {
    try {
      const tiendaNubeCustomers = await this.getCustomers(config);
      const syncedCustomers = [];

      for (const tnCustomer of tiendaNubeCustomers) {
        // Aquí iría la lógica para mapear y guardar el cliente en el POS
        syncedCustomers.push({
          id: tnCustomer.id,
          name: tnCustomer.name,
          email: tnCustomer.email,
          phone: tnCustomer.phone,
          addresses: tnCustomer.addresses || []
        });
      }

      return {
        success: true,
        syncedCount: syncedCustomers.length,
        customers: syncedCustomers
      };
    } catch (error) {
      console.error('Error syncing customers from Tienda Nube:', error);
      return {
        success: false,
        message: error.message || 'Error al sincronizar clientes desde Tienda Nube'
      };
    }
  }
};