# Sistema de Stock y Ventas — Documento 5: Plan de Implementación

## Orden recomendado de desarrollo

La idea es tener algo **usable y vendiendo** lo antes posible, e ir sumando capas. Cada sprint es codeable en sesiones cortas conmigo.

---

### Sprint 0 — Setup del proyecto
- [ ] Crear proyecto Spring Boot (Spring Initializr: Web, JPA, Security, Validation, PostgreSQL Driver)
- [ ] Levantar Postgres local con Docker Compose
- [ ] Crear proyecto React + Vite + TypeScript + Tailwind
- [ ] Configurar Spring Boot para servir el build de React como estático
- [ ] Endpoint de salud (`GET /api/health`) funcionando de punta a punta

### Sprint 1 — Productos y variantes
- [ ] Entidades `Producto` y `VarianteProducto` + migraciones (recomiendo **Flyway** para versionar el esquema)
- [ ] CRUD completo (backend + pantalla en React)
- [ ] Carga de stock inicial por variante
- [ ] Búsqueda por SKU / código de barras

### Sprint 2 — Ventas (POS básico)
- [ ] Pantalla de venta: buscar producto → agregar al carrito → cobrar
- [ ] `POST /api/ventas` con generación automática de `MovimientoStock`
- [ ] Validación de stock disponible (no vender de más)
- [ ] Multi-medio de pago en una misma venta

### Sprint 3 — Comprobante interno + reportes básicos
- [ ] Generación de PDF con OpenPDF
- [ ] Reporte de ventas por período
- [ ] Reporte de stock bajo mínimo

### Sprint 4 — Sincronización con Google Sheets
- [ ] Alta de Service Account y Sheet compartido
- [ ] `SheetsSyncService` con sync inmediata + programada
- [ ] Panel de estado de sincronización en el admin

### Sprint 5 — Casos especiales
- [ ] Devoluciones y cambios
- [ ] Cuenta corriente de clientes
- [ ] Cierre de caja con arqueo
- [ ] Promociones (2x1, descuentos)

### Sprint 6 — Usuarios y permisos
- [ ] Login con JWT
- [ ] Roles admin/cajero aplicados en backend (no solo ocultar botones en el frontend)

### Sprint 7 — Facturación electrónica ARCA (cuando el local esté listo administrativamente)
- [ ] Certificado digital + alta de WSFE (trámite de la dueña)
- [ ] Integración WSAA + WSFEv1 en ambiente de homologación
- [ ] Pasaje a producción

### Sprint 8 — Pulido
- [ ] Backups automáticos de la base (`pg_dump` programado)
- [ ] Manejo de errores prolijo en el frontend
- [ ] Responsive para tablet en el mostrador

---

## Cómo seguimos a partir de acá

Te recomiendo que arranquemos por el **Sprint 0**, armando el esqueleto del proyecto (backend + frontend + Docker Compose para Postgres) para que tengas algo corriendo en tu máquina desde el primer día. Desde ahí avanzamos módulo por módulo, y en cada uno te voy mostrando el código explicado para que lo entiendas y lo puedas mantener vos.

Cuando quieras arrancar, decime "vamos con el Sprint 0" y empezamos a generar el código del proyecto base.
