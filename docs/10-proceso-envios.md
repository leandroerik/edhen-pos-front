# Documento 10: Módulo de Envíos (frontend)

Explica el módulo de Envíos en `edhen-pos-front` (`src/features/envios/`),
que completa lo que había quedado anotado como pendiente en
`docs/09-proceso-clientes.md` (dirección cargada, pero sin seguimiento de
envío en sí).

> Estado actual: la app consume la API REST real del backend
> (`src/api/envios.api.ts`). Los componentes y flujos están descritos a
> continuación.

## 1. Flujo

1. **Nuevo envío** (`/envios/nuevo`): en el costado derecho (sidebar fijo
   con `sticky`, mismo patrón que la "Venta actual" del POS) hay un
   listado siempre visible de **pedidos pendientes**
   (`listarVentas({ estado: 'PENDIENTE' })`) — son los que más necesitan
   seguimiento de envío, porque todavía no se retiraron/pagaron del todo
   (ver `docs/07-proceso-de-venta.md` sección 6). Tocar uno lo selecciona
   directo, sin tener que escribir nada. Si el pedido que buscás no está
   en esa lista (por ejemplo, ya está `COMPLETADA`), también se puede
   buscar cualquier venta por código o nombre de cliente
   (`buscarVentasParaEnvio`, `ventas.api.ts`). Elegir una venta con
   cliente **autocompleta el cliente** de la sección de abajo.
2. Si no se parte de una venta (o la venta no tenía cliente asociado), se
   busca el cliente directo (mismo patrón de debounce + dropdown que ya
   se usa en Ventas), y se elige una de sus direcciones cargadas (radio
   list, la marcada como principal viene preseleccionada). Si el cliente
   no tiene ninguna dirección todavía, se muestra un link directo a su
   ficha para cargarla ahí (`docs/09-proceso-clientes.md`, sección 2).
3. Transportista, costo de envío y fecha estimada de entrega son
   obligatorios. La venta asociada (`Venta 1─1 Envio` del Documento 2,
   "solo si es venta con entrega a domicilio") sigue siendo opcional — un
   envío también puede existir sin venta, por ejemplo un pedido armado
   por WhatsApp que todavía no se registró como venta.
4. El envío arranca en estado `PENDIENTE`.

## 2. Estados y transiciones

`EstadoEnvio`: `PENDIENTE → PREPARANDO → EN_CAMINO → ENTREGADO`, con
`CANCELADO` como salida en cualquier punto antes de `ENTREGADO`. No hay
vuelta atrás — cada estado solo avanza al siguiente en la secuencia
(`avanzarEstadoEnvio`, botón con el nombre del paso siguiente en
`/envios`: "Marcar en preparación" → "Marcar en camino" → "Marcar
entregado"). Al llegar a `ENTREGADO` se registra `fechaRealEntrega`
automáticamente. No se puede cancelar un envío ya entregado.

## 3. Qué es y qué no es este módulo

- **Snapshot, no referencia viva**: `Envio.cliente` y `Envio.direccion`
  (`src/types/envio.ts`) son una copia de los datos al momento de crear
  el envío, mismo criterio que se usa en toda la app para
  `VentaDetalle.producto`/`variante` y `Venta.cliente` — si el cliente
  edita su dirección después, el envío ya creado no cambia.
- **No incluye impresión de etiqueta**: el Documento 2 tiene una entidad
  aparte `datos_impresion` (contenido JSON, impreso, fecha de impresión)
  para eso. Productos ya tiene un patrón de impresión armado
  (`EtiquetaVariantePage.tsx`, con `window.print()`) que se podría
  reutilizar para una etiqueta de envío el día que haga falta — no se
  construyó todavía porque no fue parte de lo pedido en esta vuelta.
- **No recalcula el costo de envío automáticamente** (por transportista,
  distancia, peso, etc.) — se carga a mano.
