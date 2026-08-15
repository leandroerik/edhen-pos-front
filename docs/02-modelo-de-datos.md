# Sistema de Stock y Ventas — Documento 2 (v2): Modelo de Datos

> Esta versión fusiona el esquema original con la ampliación a **venta multicanal** (local, WhatsApp, web, marketplace) y **gestión de envíos**, sumando las tablas que faltaban para trazabilidad de stock, pagos múltiples, comprobantes, devoluciones y control operativo.

## 1. Diagrama conceptual

```
Cliente 1───N Direccion
Cliente 1───N Venta

Categoria 1───N Producto 1───N ProductoVariante (talla+color+SKU+stock)
Color N───┘         Talla N───┘

Venta 1───N VentaDetalle N───1 ProductoVariante
Venta 1───N Pago
Venta 1───1 Comprobante
Venta 1───1 Envio (opcional, solo si es venta con entrega a domicilio)
Envio 1───N DatoImpresion

ProductoVariante 1───N MovimientoStock
Venta 1───N DevolucionCambio

Usuario 1───N Venta (vendedor)
Usuario 1───N MovimientoStock (quién lo hizo)
Caja 1───N Venta (dentro de qué turno de caja se hizo)

Promocion N───N ProductoVariante
```

## 2. Catálogos base

### categorias
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | |
| descripcion | String | opcional |

### colores
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | |
| codigo_hex | String | para mostrar swatches de color en el frontend |

### tallas
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | S, M, L, 38, 40... |
| tipo | Enum | ROPA_SUPERIOR, ROPA_INFERIOR, CALZADO, UNICO |
| orden | Integer | para ordenar S < M < L en las pantallas, no alfabéticamente |

> Mantengo tu idea de catálogos normalizados — es mejor que texto libre, sobre todo para filtros y reportes por talle/color.

## 3. Productos y stock

### productos
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| categoria_id | FK | |
| codigo_barras | String | opcional, a nivel producto si aplica |
| nombre | String | |
| descripcion | String | |
| precio_base | BigDecimal | precio de referencia, puede overridearse por variante |
| imagen_url | String | opcional, útil si después mostrás catálogo online |
| activo | boolean | |

### producto_variantes
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| producto_id | FK | |
| color_id | FK | |
| talla_id | FK | |
| sku | String (único) | |
| codigo_barras | String | opcional, distinto del código de producto si cada variante tiene el suyo |
| precio | BigDecimal | override del precio_base si hace falta |
| stock | Integer | cantidad físicamente disponible en el local |
| stock_reservado | Integer | **agregado**: cantidad comprometida en pedidos online pendientes de cobrar/entregar |
| stock_minimo | Integer | para alertas |
| activo | boolean | |

> **Campo clave agregado: `stock_reservado`.** Resuelve el problema de doble venta que mencionaste en el flujo de WhatsApp: cuando armás un pedido online, reservás cantidad ahí (no la restás del `stock` real todavía, o si preferís restarla del disponible visible, la sumás acá para saber cuánto "libre" queda). El **stock disponible para vender** siempre se calcula como `stock - stock_reservado`, nunca se vende sobre ese número negativo.

### movimientos_stock — **agregado, crítico**
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| variante_id | FK producto_variantes | |
| tipo | Enum | INGRESO, VENTA, DEVOLUCION, RESERVA, LIBERA_RESERVA, AJUSTE_POSITIVO, AJUSTE_NEGATIVO |
| cantidad | Integer | positivo o negativo |
| fecha | Instant | |
| referencia_venta_id | FK ventas (nullable) | |
| usuario_id | FK usuarios | |
| motivo | String | obligatorio en ajustes manuales |

**Regla de oro:** nunca se actualiza `producto_variantes.stock` directo — siempre a través de un `MovimientoStock`, para tener trazabilidad completa (imprescindible cuando tengas dos canales de venta compitiendo por el mismo talle).

## 4. Clientes y direcciones

### clientes
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | |
| apellido | String | |
| email | String | opcional |
| telefono | String | clave para buscar por WhatsApp |
| dni | String | opcional, necesario si pide factura A |
| fecha_registro | Instant | |

### direcciones
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| cliente_id | FK | |
| direccion | String | |
| localidad | String | |
| provincia | String | |
| codigo_postal | String | |
| es_principal | boolean | |
| observaciones | String | ej: "timbre roto, golpear" |

Tu diseño acá estaba bien — lo dejo igual.

## 5. Ventas

### ventas
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| cliente_id | FK (nullable) | venta mostrador puede no tener cliente registrado |
| codigo_venta | String (único) | |
| fecha_venta | Instant | |
| usuario_id | FK usuarios | **agregado**: quién la registró |
| caja_id | FK cajas | **agregado**: en qué turno de caja cayó |
| subtotal | BigDecimal | |
| impuestos | BigDecimal | |
| descuento | BigDecimal | |
| total | BigDecimal | |
| tipo_compra | Enum | LOCAL_FISICO, WHATSAPP, WEB, MARKETPLACE, TELEFONO |
| estado_venta | Enum | PENDIENTE, COMPLETADA, CANCELADA |

> Saqué `metodo_pago` de acá y lo pasé a una tabla `pagos` aparte (ver abajo) para soportar pago dividido.

### venta_detalles
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| venta_id | FK | |
| variante_id | FK producto_variantes | |
| cantidad | Integer | |
| precio_unitario | BigDecimal | precio al momento de la venta |
| subtotal | BigDecimal | |

### pagos — **agregado**
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| venta_id | FK | |
| metodo_pago | Enum | EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, MERCADO_PAGO, CUENTA_CORRIENTE |
| monto | BigDecimal | |
| cuotas | Integer | solo tarjeta crédito |

### comprobantes — **agregado**
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| venta_id | FK | |
| tipo | Enum | TICKET_INTERNO, FACTURA_A, FACTURA_B, FACTURA_C, NOTA_CREDITO |
| numero | String | |
| cae | String | nullable hasta fase 2 (fiscal) |
| cae_vencimiento | LocalDate | nullable |
| pdf_path | String | |
| fecha_emision | Instant | |

### devoluciones_cambios — **agregado**
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| venta_original_id | FK ventas | |
| tipo | Enum | DEVOLUCION, CAMBIO |
| variante_devuelta_id | FK | |
| variante_nueva_id | FK (nullable) | solo en cambios |
| cantidad | Integer | |
| diferencia_monto | BigDecimal | |
| motivo | String | |
| fecha | Instant | |

## 6. Envíos (tu aporte, con un par de agregados)

### envios
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| cliente_id | FK | |
| direccion_id | FK | |
| venta_id | FK (nullable) | |
| codigo_envio | String | |
| transportista | String | |
| costo_envio | BigDecimal | |
| fecha_solicitud | Instant | |
| fecha_estimada_entrega | Date | |
| fecha_real_entrega | Date | nullable |
| estado_envio | Enum | PENDIENTE, PREPARANDO, EN_CAMINO, ENTREGADO, CANCELADO |

### datos_impresion
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| envio_id | FK | |
| contenido | Text (JSON) | datos de la etiqueta |
| impreso | boolean | |
| fecha_impresion | Instant | nullable |

Ambas tablas quedan igual que tu propuesta — están bien pensadas.

## 7. Control operativo (agregado)

### usuarios
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | |
| usuario_login | String (único) | |
| password_hash | String | |
| rol | Enum | ADMIN, CAJERO |

### cajas
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| usuario_apertura_id | FK | |
| usuario_cierre_id | FK (nullable) | |
| fecha_apertura | Instant | |
| fecha_cierre | Instant (nullable) | |
| monto_inicial | BigDecimal | |
| monto_final_declarado | BigDecimal | nullable |
| diferencia | BigDecimal | nullable, calculada al cerrar |

### promociones
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| nombre | String | |
| tipo | Enum | DESCUENTO_PORCENTUAL, DOS_POR_UNO, SEGUNDA_UNIDAD_DESCUENTO |
| valor | BigDecimal | |
| fecha_inicio / fecha_fin | Date | |
| activa | boolean | |

### configuracion_sync
| Campo | Tipo | Notas |
|---|---|---|
| id | PK (singleton) | |
| spreadsheet_id | String | |
| ultima_sincronizacion | Instant | |
| estado | Enum | OK, ERROR, PENDIENTE |
| ultimo_error | String | nullable |

## 8. Cómo se resuelve la reserva de stock en pedidos online

Este es el punto que tu flujo de WhatsApp necesitaba y no tenía soporte de datos:

1. Cliente pide por WhatsApp → se crea `Venta` en estado `PENDIENTE`, tipo `WHATSAPP`
2. Por cada ítem, se genera un `MovimientoStock` tipo `RESERVA` (no descuenta `stock`, incrementa `stock_reservado`)
3. El disponible que se muestra en el POS y en Sheets es siempre `stock - stock_reservado`, así nadie en el local le vende a otro cliente esa unidad ya comprometida
4. Cuando el cliente paga y se despacha: la venta pasa a `COMPLETADA`, se genera `MovimientoStock` tipo `VENTA` (ahí sí descuenta `stock` real) y otro `LIBERA_RESERVA` (baja `stock_reservado`)
5. Si el cliente se arrepiente o no confirma en X días: se cancela la venta, se genera `LIBERA_RESERVA` sin `VENTA`, y el stock vuelve a estar 100% disponible

## 9. Índices recomendados

- `producto_variantes.sku` → único
- `producto_variantes.codigo_barras` → único
- `ventas.fecha_venta`, `ventas.tipo_compra` → para reportes por canal
- `movimientos_stock.variante_id + fecha` → compuesto
- `clientes.telefono` → para búsqueda rápida en pedidos de WhatsApp
- `envios.estado_envio` → para el panel de "envíos pendientes"

## 10. Qué falta actualizar en el resto de la documentación

Con este cambio de alcance (multicanal + envíos), el **Documento 3** (funcionalidades) necesita sumar: endpoints de `/api/envios`, el flujo completo de venta por WhatsApp con reserva de stock, y el estado "pendiente de envío" en los reportes. El **Documento 5** (plan de sprints) necesita un sprint dedicado a envíos y reservas. Si querés te los actualizo también — decime y sigo.
