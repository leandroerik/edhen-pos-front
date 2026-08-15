# Sistema de Stock y Ventas — Documento 3: Funcionalidades, API y Casos Especiales

## 1. Módulos funcionales

1. **Productos y variantes** (ABM, carga de talles/colores, código de barras)
2. **Stock** (consulta, ajustes manuales, alertas de stock mínimo)
3. **Ventas / POS** (carrito, cobro, comprobante)
4. **Clientes** (opcional, cuenta corriente)
5. **Devoluciones y cambios**
6. **Promociones**
7. **Caja** (apertura, cierre, arqueo)
8. **Reportes** (ventas, stock, productos más vendidos)
9. **Sincronización con Google Sheets**
10. **Facturación** (interna → fiscal)
11. **Usuarios y permisos**

## 2. API REST sugerida (contrato)

Convención: JSON, `Content-Type: application/json`, autenticación JWT en header `Authorization: Bearer <token>`.

### Productos y variantes

```
GET    /api/productos                     → lista (con filtros: categoria, activo, texto)
GET    /api/productos/{id}                → detalle con sus variantes
POST   /api/productos                     → crear producto
PUT    /api/productos/{id}                → editar
DELETE /api/productos/{id}                → soft delete (activo=false)

GET    /api/productos/{id}/variantes       → variantes de un producto
POST   /api/productos/{id}/variantes       → crear variante (talle/color/sku)
PUT    /api/variantes/{id}                 → editar variante
GET    /api/variantes/buscar?codigoBarras=X   → lookup rápido para el POS
```

### Stock

```
GET    /api/stock                          → listado con cantidad actual (filtro: bajo mínimo)
POST   /api/stock/ajuste                   → ajuste manual (rotura, pérdida, inventario físico)
       body: { varianteId, cantidad, tipo: AJUSTE_POSITIVO|AJUSTE_NEGATIVO, motivo }
GET    /api/stock/{varianteId}/movimientos → historial de movimientos de una variante
```

### Ventas

```
POST   /api/ventas                          → crear venta (carrito completo)
       body: { clienteId?, items: [{varianteId, cantidad, precioUnitario, descuento?}],
                pagos: [{medioPago, monto, cuotas?}], observaciones? }
GET    /api/ventas/{id}                     → detalle de una venta
GET    /api/ventas?desde=&hasta=&estado=    → listado con filtros
POST   /api/ventas/{id}/anular              → anula una venta (antes del cierre de caja)
GET    /api/ventas/{id}/comprobante          → descarga el PDF del comprobante
```

### Devoluciones y cambios

```
POST   /api/devoluciones                    → registra devolución con reintegro/NC
       body: { ventaOriginalId, varianteId, cantidad, motivo, medioReintegro }
POST   /api/cambios                         → registra cambio de producto
       body: { ventaOriginalId, varianteDevueltaId, varianteNuevaId, cantidad, diferenciaMonto }
```

### Clientes

```
GET    /api/clientes
POST   /api/clientes
GET    /api/clientes/{id}/cuenta-corriente   → movimientos y saldo
POST   /api/clientes/{id}/pagos              → registrar pago a cuenta corriente
```

### Promociones

```
GET    /api/promociones?activas=true
POST   /api/promociones
PUT    /api/promociones/{id}
```

### Caja

```
POST   /api/caja/apertura      → { montoInicial }
POST   /api/caja/cierre        → calcula totales por medio de pago vs lo contado, guarda diferencia
GET    /api/caja/actual        → estado de la caja abierta
```

### Reportes

```
GET /api/reportes/ventas-por-periodo?desde=&hasta=
GET /api/reportes/productos-mas-vendidos?desde=&hasta=&limit=10
GET /api/reportes/stock-bajo-minimo
```

### Sincronización

```
POST /api/sync/sheets/ejecutar     → fuerza sincronización manual
GET  /api/sync/sheets/estado        → última sync, estado, errores
```

## 3. Casos especiales — cómo resolverlos

### 3.1 Cambio de talle/color (el más común en indumentaria)
- No es una devolución de dinero: es "devolver variante A" + "entregar variante B"
- Genera **dos** `MovimientoStock`: +1 en la variante devuelta, -1 en la variante nueva
- Si el precio difiere, se cobra o se devuelve la diferencia (`diferenciaMonto`, con su propio `Pago` si corresponde)
- **No** afecta el comprobante fiscal original si no hay diferencia de precio; si hay diferencia, se emite un comprobante adicional (nota de crédito/débito, o interno en fase 1)

### 3.2 Devolución con reintegro de dinero
- Genera `MovimientoStock` positivo (+1 vuelve al stock, si la prenda está en condiciones de reventa)
- Genera un `Pago` negativo o una `NotaCredito` según el medio de pago original
- Regla de negocio típica en indumentaria: **no se admite devolución si la prenda fue usada/lavada** → esto es un control humano, pero el sistema debe permitir marcar el motivo para estadísticas ("talle incorrecto", "no le gustó", "producto defectuoso")

### 3.3 Venta con seña / apartado ("layaway")
- Se crea una `Venta` en estado `PENDIENTE`
- El `MovimientoStock` de tipo VENTA se descuenta igual (para "reservar" la prenda y que no se venda dos veces), pero queda marcada como reservada
- Cuando el cliente termina de pagar, se agregan los `Pago` faltantes y la venta pasa a `COMPLETADA`, ahí se emite el comprobante
- Si el cliente no viene a buscarlo (vencido el plazo), se anula y el stock vuelve (`MovimientoStock` positivo)

### 3.4 Cuenta corriente / fiado
- `Cliente.saldo_cuenta_corriente` se incrementa cuando se vende con `medio_pago = CUENTA_CORRIENTE`
- Se decrementa con `POST /api/clientes/{id}/pagos`
- Reporte de clientes con saldo pendiente, para hacer seguimiento

### 3.5 Ajuste manual de stock (inventario físico, rotura, robo)
- Nunca se edita `Stock.cantidad` directo desde una pantalla de "editar" libre
- Siempre pasa por `POST /api/stock/ajuste`, que **exige motivo** y genera su `MovimientoStock`
- Esto da trazabilidad total: en cualquier auditoría se puede reconstruir por qué el stock cambió

### 3.6 Descuentos manuales
- Se permite descuento por ítem (`DetalleVenta.descuento_item`) y descuento general (`Venta.descuento_total`)
- Regla sugerida: descuentos mayores a un % configurable requieren rol `ADMIN` (se valida en el backend, no solo se oculta en el frontend)

### 3.7 Combos y promociones
- `2x1`: se detecta automáticamente en el carrito cuando hay 2+ unidades de variantes marcadas como aplicables, y se recalcula el precio del ítem más barato a $0
- `Descuento por segunda unidad`: similar, pero con % en vez de gratis
- Las promociones tienen vigencia (`fecha_inicio`/`fecha_fin`) y se validan al momento de armar la venta, no se "congelan" antes

### 3.8 Cierre de caja
- Al abrir el día: `POST /api/caja/apertura` con el monto inicial en efectivo
- El sistema va sumando automáticamente lo cobrado por cada medio de pago según las ventas del día
- Al cerrar: el cajero cuenta el efectivo físico, lo ingresa, y el sistema muestra la diferencia (sobrante/faltante) contra lo esperado
- Este cierre debería **bloquear la anulación de ventas de ese día** una vez cerrado (para evitar descuadres retroactivos)

### 3.9 Anulación de venta
- Solo permitida si la caja del día sigue abierta
- Revierte todos los `MovimientoStock` de esa venta (vuelve el stock)
- Si ya tiene comprobante fiscal emitido (fase 2), no se puede "anular" en el sentido contable — hay que emitir una Nota de Crédito

## 4. Roles y permisos sugeridos

| Acción | Cajero | Admin |
|---|---|---|
| Registrar venta | ✅ | ✅ |
| Ver stock | ✅ | ✅ |
| Editar productos/precios | ❌ | ✅ |
| Ajustar stock manualmente | ❌ (o con motivo obligatorio) | ✅ |
| Anular venta | ❌ | ✅ |
| Descuentos grandes | ❌ | ✅ |
| Cerrar caja | ✅ | ✅ |
| Ver reportes generales | ❌ | ✅ |

## 5. Próximo documento

En el **Documento 4** vemos en detalle la sincronización con Google Sheets (paso a paso técnico) y el plan de facturación electrónica con ARCA/AFIP.
