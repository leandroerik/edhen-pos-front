import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle, Row, Col, Form, FormGroup, Label, Input, Button, Alert, Spinner, Badge } from 'reactstrap';
import { adminService } from '../../services/adminService';
import { toast } from 'react-toastify';

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
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <CardTitle tag="h5">Configuración de Integraciones</CardTitle>
            </CardHeader>
            <CardBody>
              <Alert color="info">
                <strong>Tienda Nube</strong> - Integra tu tienda online con el sistema POS para sincronizar productos, pedidos y clientes.
              </Alert>

              <Form>
                <Row>
                  <Col md={6}>
                    <Card className="mb-3">
                      <CardHeader>
                        <CardTitle tag="h6">Credenciales de Tienda Nube</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <FormGroup>
                          <Label for="apiKey">API Key</Label>
                          <Input
                            type="password"
                            id="apiKey"
                            name="apiKey"
                            value={config.apiKey}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu API Key de Tienda Nube"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="userId">User ID</Label>
                          <Input
                            type="text"
                            id="userId"
                            name="userId"
                            value={config.userId}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu User ID de Tienda Nube"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="storeId">Store ID</Label>
                          <Input
                            type="text"
                            id="storeId"
                            name="storeId"
                            value={config.storeId}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu Store ID de Tienda Nube"
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label for="webhookUrl">URL del Webhook</Label>
                          <Input
                            type="text"
                            id="webhookUrl"
                            name="webhookUrl"
                            value={config.webhookUrl}
                            readOnly
                          />
                          <small className="text-muted">
                            Esta URL se usa para recibir actualizaciones en tiempo real desde Tienda Nube
                          </small>
                        </FormGroup>
                      </CardBody>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card className="mb-3">
                      <CardHeader>
                        <CardTitle tag="h6">Opciones de Sincronización</CardTitle>
                      </CardHeader>
                      <CardBody>
                        <FormGroup check>
                          <Label check>
                            <Input
                              type="checkbox"
                              name="syncProducts"
                              checked={config.syncProducts}
                              onChange={handleInputChange}
                            />
                            Sincronizar Productos
                          </Label>
                        </FormGroup>

                        <FormGroup check>
                          <Label check>
                            <Input
                              type="checkbox"
                              name="syncOrders"
                              checked={config.syncOrders}
                              onChange={handleInputChange}
                            />
                            Sincronizar Pedidos
                          </Label>
                        </FormGroup>

                        <FormGroup check>
                          <Label check>
                            <Input
                              type="checkbox"
                              name="syncCustomers"
                              checked={config.syncCustomers}
                              onChange={handleInputChange}
                            />
                            Sincronizar Clientes
                          </Label>
                        </FormGroup>

                        <FormGroup check className="mt-3">
                          <Label check>
                            <Input
                              type="checkbox"
                              name="autoSync"
                              checked={config.autoSync}
                              onChange={handleInputChange}
                            />
                            Sincronización Automática
                          </Label>
                        </FormGroup>

                        {config.autoSync && (
                          <FormGroup>
                            <Label for="syncInterval">Intervalo de Sincronización (minutos)</Label>
                            <Input
                              type="number"
                              id="syncInterval"
                              name="syncInterval"
                              value={config.syncInterval}
                              onChange={handleInputChange}
                              min="5"
                              max="1440"
                            />
                          </FormGroup>
                        )}
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle tag="h6">Estado de Conexión</CardTitle>
                      </CardHeader>
                      <CardBody>
                        {connectionStatus && (
                          <Alert color={connectionStatus.success ? 'success' : 'danger'}>
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
                          </Alert>
                        )}

                        <div className="d-flex gap-2">
                          <Button
                            color="primary"
                            onClick={handleTestConnection}
                            disabled={testingConnection || !isConfigValid()}
                          >
                            {testingConnection ? <Spinner size="sm" /> : null}
                            {testingConnection ? ' Probando...' : 'Probar Conexión'}
                          </Button>

                          <Button
                            color="success"
                            onClick={handleSync}
                            disabled={syncing || !isConfigValid() || !connectionStatus?.success}
                          >
                            {syncing ? <Spinner size="sm" /> : null}
                            {syncing ? ' Sincronizando...' : 'Sincronizar Ahora'}
                          </Button>
                        </div>

                        {syncResults && (
                          <div className="mt-3">
                            <h6>Resultado de Sincronización:</h6>
                            <div className="d-flex gap-3">
                              <Badge color="primary">Productos: {syncResults.syncedProducts || 0}</Badge>
                              <Badge color="success">Pedidos: {syncResults.syncedOrders || 0}</Badge>
                              <Badge color="info">Clientes: {syncResults.syncedCustomers || 0}</Badge>
                            </div>
                            {!syncResults.success && (
                              <Alert color="danger" className="mt-2">
                                Error: {syncResults.message}
                              </Alert>
                            )}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col className="text-center">
                    <Button
                      color="primary"
                      size="lg"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" /> : null}
                      {loading ? ' Guardando...' : 'Guardar Configuración'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default IntegracionesConfig;