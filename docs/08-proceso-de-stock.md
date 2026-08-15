# Documento 8: Módulo de Stock (frontend)

Explica cómo funciona el módulo de Stock en `edhen-pos-front`
(`src/features/stock/`) y, sobre todo, cómo se terminó de cerrar la
"regla de oro" del Documento 2: *"nunca se actualiza
`producto_variantes.stock` directo — siempre a través de un
`MovimientoStock`"*.

> Estado actual: mock en memoria (`src/api/stock.api.ts`), que replica el
> contrato `GET /api/stock`, `POST /api/stock/ajuste`, `GET
> /api/stock/{varianteId}/movimientos` del Documento 3. El store real de
> productos y movimientos vive en `src/api/productos.api.ts` (misma fuente
> de verdad que usan Productos y Ventas) — `stock.api.ts` solo lo expone
> con la forma del contrato de este módulo.

## 1. Un solo punto de mutación de stock

Todo el stock del sistema pasa por una única función,
`ajustarStockVariante` (`productos.api.ts`), que **siempre** hace dos
cosas juntas: actualiza `producto_variantes.stock` y registra un
`MovimientoStock`. Nada más en el código toca `stock` directo. Quién la
llama y con qué `tipo`:

| Evento | Dónde | `tipo` | `cantidad` |
|---|---|---|---|
| Alta de una variante nueva con stock inicial | `crearVariante` | `INGRESO` | stock inicial cargado |
| Venta cobrada | `ventas.api.ts` → `crearVenta` | `VENTA` | negativa, `referenciaVentaId` = la venta |
| Venta anulada | `ventas.api.ts` → `anularVenta` | `AJUSTE_POSITIVO` | positiva (revierte), motivo automático "Anulación de venta ..." |
| Ajuste manual desde `/stock` | `stock.api.ts` → `ajustarStock` | `AJUSTE_POSITIVO` / `AJUSTE_NEGATIVO` | la que carga el usuario, con motivo obligatorio |

Los 10 productos de ejemplo del mock (que no pasaron por `crearVariante`)
tienen un `INGRESO` sintético generado al arrancar la app, para que el
historial no aparezca vacío al probar con ellos.

> Nota sobre `anularVenta`: el enum de `tipo` del Documento 2 no tiene un
> valor específico para "reversión de venta anulada" (solo `VENTA`,
> `DEVOLUCION`, `AJUSTE_POSITIVO`, etc. — una devolución de cliente con
> motivo es un caso distinto, Sprint 5). Se usó `AJUSTE_POSITIVO` con
> motivo autogenerado en vez de inventar un valor nuevo fuera del
> Documento 2.

## 2. Pantalla `/stock`

Listado de **todas** las variantes de todos los productos (no solo un
producto a la vez, a diferencia de la tabla de variantes dentro de
Productos), con:

- Buscador por nombre de producto o SKU (client-side, el dataset es
  chico).
- Checkbox "Solo stock bajo mínimo" → filtra server-side vía
  `listarStock({ bajoMinimo: true })`, el mismo filtro que describe el
  contrato de `GET /api/stock`.
- Fila con stock actual resaltado en rojo si está bajo el mínimo.
- "Ver / Ajustar" abre un modal con el detalle de esa variante.

## 3. Modal de variante: ajuste + historial en un solo lugar

`StockVarianteModal.tsx` combina dos cosas que en el contrato son
endpoints separados (`POST /api/stock/ajuste` y `GET
/api/stock/{varianteId}/movimientos`) porque en el uso real van juntas:
antes de ajustar querés ver el historial, y después de ajustar querés ver
que quedó registrado. El modal:

- Muestra el stock actual (se actualiza en el momento al confirmar un
  ajuste, sin cerrar el modal — pensado para una sesión de conteo físico
  donde se ajustan varias variantes seguidas).
- Formulario de ajuste: tipo (Ingreso/ajuste positivo vs. rotura o
  pérdida), cantidad, y **motivo obligatorio** — se valida tanto en el
  formulario como en `stock.api.ts` (`ajustarStock` tira error si viene
  vacío). Un ajuste negativo tampoco puede dejar el stock por debajo de
  cero.
- Debajo, el historial completo de movimientos de esa variante (fecha,
  tipo, cantidad con signo, motivo), más reciente primero.

## 4. Qué es y qué no es este módulo

Esto **no** reemplaza el flujo de venta ni el de alta de producto — sigue
siendo cierto que el stock inicial se carga al crear una variante
(Productos) y que vender descuenta stock automático (Ventas). Este módulo
es específicamente para los casos que no encajan en ninguno de los dos:
inventario físico, rotura, pérdida, corrección de un error de carga. Por
eso el campo `stock` de una variante existente sigue siendo de solo
lectura en el formulario de edición de Productos (ver
`docs/06-proceso-alta-de-producto.md`, sección 5) — el único lugar para
tocarlo a mano es acá, con motivo.
