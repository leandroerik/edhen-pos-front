# Documento 8: Módulo de Stock (frontend)

Explica cómo funciona el módulo de Stock en `edhen-pos-front`
(`src/features/stock/`) y, sobre todo, cómo se terminó de cerrar la
"regla de oro" del Documento 2: *"nunca se actualiza
`producto_variantes.stock` directo — siempre a través de un
`MovimientoStock`"*.

> Estado actual: la app consume la API REST real del backend
> (`src/api/stock.api.ts`). Los componentes y flujos están descritos a
> continuación.

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

Los 10 productos de ejemplo del DataInitializer (que no pasaron por
`crearVariante`) tienen un `INGRESO` sintético generado al arrancar la
app, para que el historial no aparezca vacío al probar con ellos.

> Nota sobre `anularVenta`: el enum de `tipo` del Documento 2 no tiene un
> valor específico para "reversión de venta anulada" (solo `VENTA`,
> `DEVOLUCION`, `AJUSTE_POSITIVO`, etc. — una devolución de cliente con
> motivo es un caso distinto, Sprint 5). Se usó `AJUSTE_POSITIVO` con
> motivo autogenerado en vez de inventar un valor nuevo fuera del
> Documento 2.

## 2. Pantalla `/stock`

Listado de **todas** las variantes de todos los productos, con 2 modos de
visualización:

### Modo búsqueda (con texto en el buscador)
- Barra de búsqueda grande con autofocus, busca por nombre de producto,
  SKU, color o talle (client-side).
- Mientras se escribe, aparecen las variantes que coinciden en una lista
  plana: nombre del producto, color dot + color/talle, stock (rojo si
  bajo mínimo, amber si sin stock), y botón **"Ajustar"** que abre el
  modal directamente.
- Contador de variantes encontradas.

### Modo agrupado (sin búsqueda)
- Productos agrupados con expand/collapse.
- Filtro por categoría (select) y "Bajo mínimo" (checkbox).
- Botón "Limpiar filtros" cuando hay filtros activos.
- Al expandir, cada variante muestra color/talle, SKU, stock, y botón
  "Ajustar".

### Filtros
- `GET /api/stock` ahora acepta `categoriaId` como parámetro opcional
  (filtrado server-side).
- El checkbox "Bajo mínimo" usa `bajoMinimo=true` (filtrado server-side).

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
