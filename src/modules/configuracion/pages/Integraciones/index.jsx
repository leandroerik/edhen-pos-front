import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../../../services/adminService';

const IntegracionesConfig = () => {
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    userId: '',
    storeId: '',
    syncProducts: false,
    syncOrders: false,
    syncCustomers: false,
    webhookUrl: '',
    autoSync: false,
    syncInterval: 30 // minutos
  });
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [syncResults, setSyncResults] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTiendaNubeConfig();
      if (data && Object.keys(data).length > 0) {
        setConfig(prev => ({ ...prev, ...data }));
      }
      // Generar webhook URL automáticamente
      const baseUrl = window.location.origin;
      setConfig(prev => ({ ...prev, webhookUrl: `${baseUrl}/api/webhooks/tiendanube` }));
    } catch (error) {
      console.error('Error loading config:', error);
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminService.saveTiendaNubeConfig(config);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionStatus(null);
      const result = await adminService.testTiendaNubeConnection(config);
      setConnectionStatus(result);
      if (result.success) {
        toast.success('Conexión exitosa con Tienda Nube');
      } else {
        toast.error(result.message || 'Error en la conexión');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus({ success: false, message: error.message });
      toast.error(error.message || 'Error al probar la conexión');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncResults(null);
      const result = await adminService.syncTiendaNube(config);
      setSyncResults(result);
      if (result.success) {
        toast.success(`Sincronización completada: ${result.syncedProducts} productos, ${result.syncedOrders} pedidos, ${result.syncedCustomers} clientes`);
      } else {
        toast.error(result.message || 'Error en la sincronización');
      }
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncResults({ success: false, message: error.message });
      toast.error(error.message || 'Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  const isConfigValid = () => {
    return config.apiKey && config.userId && config.storeId;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Configuración de Integraciones</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <strong>Tienda Nube</strong> - Integra tu tienda online con el sistema POS para sincronizar productos, pedidos y clientes.
              </div>

              <form>
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Credenciales de Tienda Nube</h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-3">
                          <label htmlFor="apiKey" className="form-label">API Key</label>
                          <input
                            type="password"
                            className="form-control"
                            id="apiKey"
                            name="apiKey"
                            value={config.apiKey}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu API Key de Tienda Nube"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="userId" className="form-label">User ID</label>
                          <input
                            type="text"
                            className="form-control"
                            id="userId"
                            name="userId"
                            value={config.userId}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu User ID de Tienda Nube"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="storeId" className="form-label">Store ID</label>
                          <input
                            type="text"
                            className="form-control"
                            id="storeId"
                            name="storeId"
                            value={config.storeId}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu Store ID de Tienda Nube"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="webhookUrl" className="form-label">URL del Webhook</label>
                          <input
                            type="text"
                            className="form-control"
                            id="webhookUrl"
                            name="webhookUrl"
                            value={config.webhookUrl}
                            readOnly
                          />
                          <div className="form-text">
                            Esta URL se usa para recibir actualizaciones en tiempo real desde Tienda Nube
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Opciones de Sincronización</h6>
                      </div>
                      <div className="card-body">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="syncProducts"
                            name="syncProducts"
                            checked={config.syncProducts}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="syncProducts">
                            Sincronizar Productos
                          </label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="syncOrders"
                            name="syncOrders"
                            checked={config.syncOrders}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="syncOrders">
                            Sincronizar Pedidos
                          </label>
                        </div>

                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="syncCustomers"
                            name="syncCustomers"
                            checked={config.syncCustomers}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="syncCustomers">
                            Sincronizar Clientes
                          </label>
                        </div>

                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="autoSync"
                            name="autoSync"
                            checked={config.autoSync}
                            onChange={handleInputChange}
                          />
                          <label className="form-check-label" htmlFor="autoSync">
                            Sincronización Automática
                          </label>
                        </div>

                        {config.autoSync && (
                          <div className="mb-3">
                            <label htmlFor="syncInterval" className="form-label">Intervalo de Sincronización (minutos)</label>
                            <input
                              type="number"
                              className="form-control"
                              id="syncInterval"
                              name="syncInterval"
                              value={config.syncInterval}
                              onChange={handleInputChange}
                              min="5"
                              max="1440"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-header">
                        <h6 className="card-title mb-0">Estado de Conexión</h6>
                      </div>
                      <div className="card-body">
                        {connectionStatus && (
                          <div className={`alert ${connectionStatus.success ? 'alert-success' : 'alert-danger'}`}>
                            <strong>Estado:</strong> {connectionStatus.success ? 'Conectado' : 'Error'}
                            {connectionStatus.store && (
                              <div className="mt-2">
                                <strong>Tienda:</strong> {connectionStatus.store.name}
                              </div>
                            )}
                            {!connectionStatus.success && (
                              <div className="mt-2">
                                <strong>Error:</strong> {connectionStatus.message}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleTestConnection}
                            disabled={testingConnection || !isConfigValid()}
                          >
                            {testingConnection ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Probando...
                              </>
                            ) : (
                              'Probar Conexión'
                            )}
                          </button>

                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleSync}
                            disabled={syncing || !isConfigValid() || !connectionStatus?.success}
                          >
                            {syncing ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Sincronizando...
                              </>
                            ) : (
                              'Sincronizar Ahora'
                            )}
                          </button>
                        </div>

                        {syncResults && (
                          <div className="mt-3">
                            <h6>Resultado de Sincronización:</h6>
                            <div className="d-flex gap-3">
                              <span className="badge bg-primary">Productos: {syncResults.syncedProducts || 0}</span>
                              <span className="badge bg-success">Pedidos: {syncResults.syncedOrders || 0}</span>
                              <span className="badge bg-info">Clientes: {syncResults.syncedCustomers || 0}</span>
                            </div>
                            {!syncResults.success && (
                              <div className="alert alert-danger mt-2">
                                Error: {syncResults.message}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-12 text-center">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar Configuración'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegracionesConfig;
