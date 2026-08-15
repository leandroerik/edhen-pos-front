# Documento 7: Proceso de venta / POS (frontend)

Explica cómo funciona hoy el módulo de Ventas en `edhen-pos-front`
(`src/features/ventas/`), las decisiones tomadas para esta primera versión
(Sprint 2 del plan de implementación) y qué queda pendiente a propósito
para cuando existan otros módulos (Clientes, Caja).

> Estado actual: corre contra un mock en memoria
> (`src/api/ventas.api.ts`), que reutiliza el mismo store de
> `src/api/productos.api.ts` para descontar stock real. Replica el
> contrato de `POST/GET /api/ventas`, `POST /api/ventas/{id}/anular` del
> Documento 3. Cuando el backend exista, cambia el cuerpo de estas
> funciones, no los componentes.

## 1. Flujo de una venta

1. **Encontrar el producto**, de dos formas (conviven, no son excluyentes):
   - **Buscar/escanear**: el input de arriba de todo busca por nombre, SKU,
     o código de barras (match exacto si coincide con un código completo).
     Usa `buscarVariantesParaVenta` (`productos.api.ts`), con debounce de
     250ms para lo que se tipea a mano. Al elegir un resultado (clic), agrega
     1 unidad directo al carrito. El flujo pensado para el lector de código
     de barras (que no usa el mouse) se explica abajo, en **"Flujo con
     lector de código de barras"**.
   - **Catálogo sin escáner** (`VentasPage.tsx`): siempre visible debajo del
     buscador, con pestañas por categoría. Tocar un producto lo despliega y
     muestra el selector de **color → talle** (`SelectorColorTalle`, ver
     más abajo) — así podés armar "2 en M negro, 1 en S blanco" del mismo
     producto antes de mandar nada al carrito. Recién con el botón
     **"Agregar"** se suma todo lo elegido al carrito de una vez.
2. Ambos caminos respetan el stock disponible (`stock - stockReservado`,
   la misma regla del Documento 2): no dejan agregar más de lo que hay, y
   si la variante ya está en el carrito, suman cantidad en vez de duplicar
   la fila. Si el resultado de la búsqueda/escaneo está sin stock, no
   queda solo un botón deshabilitado y una etiqueta chica — al tocarlo
   aparece un aviso explícito arriba de todo ("Sin stock: producto
   (color/talla)"), pensado para el escaneo rápido en el mostrador donde
   nadie va a leer letra chica en un dropdown.
3. **Venta actual** (sidebar a la derecha, fijo con `sticky` mientras
   scrolleás el catálogo): funciona como una mini-factura de lo que se va
   a cobrar. Por cada ítem se puede ajustar cantidad con `− n +`, precio
   unitario (por si se vende a un precio distinto del de lista) y
   descuento, todo compacto para no tener que navegar una tabla ancha.
4. **Cliente** (buscador opcional) y **descuento general** son opcionales,
   a nivel de toda la venta — ver sección 2.
5. **Pagos**: se pueden cargar una o más líneas (multi-medio de pago en la
   misma venta). Mientras haya un único medio de pago cargado y no se haya
   tocado el monto a mano, el campo **sigue al total en vivo** (ver
   `montoEfectivo` en `VentasPage.tsx`) — cubre el caso más común (pago
   completo en un solo medio) sin tener que retipear el total. En cuanto
   se edita el monto, o se agrega una segunda línea para dividir el pago,
   deja de autocompletarse. El botón "Cobrar" se habilita recién cuando la
   suma de los pagos cubre el total.
6. Al cobrar, `crearVenta` valida stock disponible de nuevo (por si algo
   cambió desde que se buscó), descuenta el stock real de cada variante
   (equivalente a un `MovimientoStock` tipo `VENTA`), y guarda la venta
   con estado `COMPLETADA`.

### Flujo con lector de código de barras (sin mouse)

Pensado para que el cajero pueda escanear todo el pedido y cobrar sin
soltar el lector ni tocar el mouse. Un lector de código de barras funciona
como un teclado rápido: "tipea" el código y manda un `Enter` — por eso
todo el flujo se arma alrededor del input de búsqueda (`busquedaInputRef`
en `VentasPage.tsx`, que mantiene el foco ahí después de cada acción) y su
handler `onKeyDown` (`handleBusquedaKeyDown`), que evita el debounce de
250ms y llama a `buscarVariantesParaVenta` directo para no perder
velocidad con el escaneo:

1. **Escanear una variante puntual** (código de barras propio de esa
   combinación talle/color — ver `docs/06-proceso-alta-de-producto.md`
   para el EAN-13 interno): el `Enter` que manda el lector agrega esa
   unidad al carrito de una y limpia el input, listo para el siguiente
   escaneo. Si no hay stock disponible, muestra el aviso "Sin stock" en
   vez de agregarla — no corta el flujo de escaneo.
2. **Escanear un código de barras general** (a nivel `Producto`, no de una
   variante — el código "genérico" que se genera solo por producto, ver
   `docs/06-proceso-alta-de-producto.md` sección 4): `buscarVariantesParaVenta`
   devuelve *todas* las variantes activas de ese producto, y como no hay un
   único resultado, el `Enter` no agrega nada solo — deja el dropdown de
   búsqueda abierto, mostrando el selector **color → talle**
   (`SelectorColorTalle`, ver más abajo) para elegir a mano qué se lleva.
   Si el producto tiene una sola variante activa, no hay ambigüedad y se
   agrega directo, igual que el caso anterior.
3. **Confirmar la venta**: con el input de búsqueda vacío (ya sea porque
   no se escaneó nada más, o porque se limpió solo después del último
   escaneo), un `Enter` extra dispara "Cobrar" — el mismo botón, mismas
   validaciones (pagos deben cubrir el total). En la práctica, cobrar un
   pedido escaneado se siente como "escanear cada prenda + Enter, Enter
   final para cobrar".
4. **Imprimir el ticket**: al cobrar se abre `TicketVentaModal`
   automáticamente (ver sección 7). Con el modal abierto, un `Enter` más
   dispara `window.print()` — mismo atajo que el botón "Imprimir ticket",
   así el último paso también queda sin mouse. `Escape` sigue cerrando el
   modal sin imprimir.

Esto no reemplaza la búsqueda por texto ni el catálogo sin escáner — son
el mismo input y los mismos resultados, el lector simplemente "escribe"
más rápido que una persona y siempre remata con `Enter`.

### Selector color → talle (`SelectorColorTalle`)

`src/features/ventas/components/SelectorColorTalle.tsx`, compartido por
el catálogo sin escáner y el dropdown de búsqueda/escaneo (cuando el
resultado son varias variantes del mismo producto). Reemplazó a la lista
plana de talle×color que había antes — pedido explícito, para no mostrar
15-20 combinaciones de una sola vez: primero un puñado de chips, uno por
**color** distinto (swatch + nombre), y recién al elegir uno se
despliegan sus talles con el contador `− n +`.

- Elegir un color no borra lo cargado en otro: las cantidades quedan en
  un `cantidadesDraft` interno del selector, así se puede armar "2 en
  negro M, 1 en blanco S" cambiando de color en el medio sin perder lo
  ya tocado. Cada chip de color muestra la cantidad ya cargada en ese
  color (aunque no sea el que está abierto en este momento), para no
  perder de vista el pedido mientras se sigue eligiendo.
- Si el producto tiene un solo color, se salta el paso — arranca
  directo mostrando los talles, no tiene sentido pedir elegir entre una
  sola opción.
- El botón **"Agregar"** dispara `onConfirmar` con todo lo cargado
  (todas las combinaciones con cantidad > 0, sin importar el color), y
  quien lo usa (`VentasPage.tsx`) decide qué hacer — sumar cada una al
  carrito y cerrar el desplegable/dropdown que lo contiene.
- En el dropdown de búsqueda solo aparece si **todos** los resultados
  son del mismo producto (código genérico escaneado, o una búsqueda de
  texto que por casualidad no trajo más que un producto): una búsqueda
  de texto que trae variantes de productos distintos ("remera" matchea
  varios modelos) sigue mostrando la lista plana de siempre, porque
  agrupar por color ahí no tendría sentido (son productos distintos, no
  colores de lo mismo).

## 2. Cliente

**Actualizado** — esta sección describía originalmente un selector stub
Mayorista/Minorista sin `Cliente` real detrás (el módulo Clientes no
existía todavía). Eso ya no aplica: ver `docs/09-proceso-clientes.md`
para el detalle completo. En resumen, `VentasPage.tsx` busca y selecciona
un `Cliente` real (`buscarClientesParaVenta`), la venta sigue pudiendo
hacerse sin cliente ("venta mostrador"), y `Venta.cliente` guarda un
snapshot `{id, nombre, apellido, tipo}` al momento de la venta — el tipo
de cliente sigue siendo puramente informativo, no aplica precio
diferencial automático.

## 3. Medios de pago habilitados

`MedioPago` en `src/types/venta.ts` tiene el enum completo del Documento
2 (`EFECTIVO`, `TARJETA_DEBITO`, `TARJETA_CREDITO`, `TRANSFERENCIA`,
`MERCADO_PAGO`, `CUENTA_CORRIENTE`), pero el selector del POS
(`VentasPage.tsx`, constante `MEDIOS_PAGO_HABILITADOS`) hoy solo muestra
**Efectivo** y **Transferencia**, que es lo que el negocio cobra
actualmente. Habilitar el resto es agregar el valor a esa constante — el
tipo ya los soporta, no hace falta tocar el modelo.

`CUENTA_CORRIENTE` queda deliberadamente afuera: sin un `Cliente` real
identificado no hay a quién cargarle el saldo (ver Documento 3, §3.4).

## 4. Descuentos

Se puede cargar descuento por ítem (en el carrito) y un descuento general
de la venta, sin ninguna restricción por rol. El Documento 3 (§3.6) pide
que descuentos grandes requieran rol `ADMIN` — como todavía no hay login
(Sprint 6), esa validación no existe aún. Cuando se agregue autenticación,
el chequeo va en el backend (nunca alcanza con ocultar el botón en el
frontend, como ya aclara el propio documento).

## 5. Anular venta — sin el bloqueo de caja (todavía)

`anularVenta` revierte el stock de cada ítem de la venta (vuelve al
`stock` real) y marca la venta como `CANCELADA`. El Documento 3 (§3.9)
dice que anular debería bloquearse si la caja del día ya cerró — pero el
módulo Caja (Sprint 5) todavía no existe, así que por ahora se puede
anular cualquier venta `COMPLETADA` sin esa restricción. Se agrega el
bloqueo cuando exista Caja.

Solo aplica a ventas `COMPLETADA` — `anularVenta` rechaza una venta
`PENDIENTE` con un error explícito, porque ahí nunca se tocó el stock
real (ver sección 6, `cancelarPedido` es lo que corresponde en ese caso).

## 6. Pedidos pendientes (Documento 2 §8 / Documento 3 §3.3)

No es una entidad nueva — es el mismo `Venta`, con `estadoVenta =
'PENDIENTE'`. Sirve para el caso de "se prepara y se espera el pago o el
retiro" (pedido por WhatsApp, seña/apartado, etc.), tal como lo describe
el Documento 2 §8.

- **Crear un pedido**: en `/ventas`, junto al botón "Cobrar" hay
  **"Guardar como pedido pendiente"**. Arma el carrito igual que una
  venta normal, pero admite pago parcial o nulo — no exige que los pagos
  cubran el total. En vez de descontar `stock`, incrementa
  `stockReservado` (`ajustarStockReservado`, `productos.api.ts`, tipo de
  movimiento `RESERVA`) — el ítem deja de estar disponible para otra
  venta, pero sigue físicamente en el local.
- **Completar el pago**: desde `/ventas/historial`, filtrando por
  Pendientes, el botón "Completar pago" abre un modal que muestra cuánto
  falta y deja cargar los pagos restantes (`completarPagoVenta`). Al
  cubrir el total, la venta pasa a `COMPLETADA`: se libera la reserva
  (`LIBERA_RESERVA`) y recién ahí se descuenta el stock real (`VENTA`) —
  el disponible neto no cambia en este paso, porque ya estaba reservado.
- **Cancelar el pedido**: botón "Cancelar" en la misma fila
  (`cancelarPedido`). Libera la reserva (`LIBERA_RESERVA`) sin generar
  ningún movimiento sobre el stock real, porque nunca se tocó. Distinto
  de "Anular" — ver sección 5.
- **Vencimiento**: por ahora es manual — el cajero cancela el pedido a
  mano cuando corresponda. No hay fecha límite ni cancelación automática
  todavía (se dejó afuera a propósito, es una regla de negocio aparte:
  ¿cuántos días? ¿aviso previo?).

## 7. Ticket de venta (comprobante interno imprimible)

`TicketVentaModal.tsx` (`src/features/ventas/components/`), compartido
entre `VentasPage.tsx` y `VentasHistorialPage.tsx`:

- Al **cobrar** una venta (no al guardar un pedido pendiente — todavía no
  está pagada), se abre automáticamente mostrando el comprobante, con el
  formato estándar de un ticket de mostrador: logo
  (`/public/logo.png`), código + fecha, cliente (si hay); por cada
  ítem, cantidad + producto + variante + importe de esa línea, y una
  segunda línea chica con precio unitario (solo si la cantidad es mayor a
  1 — con cantidad 1 el importe ya es el precio unitario, mostrarlo dos
  veces es ruido) y el descuento del ítem si tiene; después
  Subtotal/Descuento/Total, medios de pago con su monto, y el disclaimer
  + agradecimiento al pie. Botón "Imprimir ticket" dispara
  `window.print()` — con el modal abierto, `Enter` hace lo mismo (ver
  "Flujo con lector de código de barras" en la sección 1), y `Escape` lo
  cierra sin imprimir.
- Desde `/ventas/historial`, cualquier venta `COMPLETADA` tiene una
  acción **"Imprimir"** para reabrir el mismo modal y reimprimir el
  ticket cuando haga falta (no queda guardado como PDF en ningún lado,
  se re-arma en el momento a partir de los datos de la venta).
- **Formato de impresora térmica chica**: `@page { size: 80mm auto;
  margin: 0 }` en `src/index.css` (para una de 58mm, cambiar ese valor).
- **Vista previa grande, impresión chica** — son dos escalas
  independientes. Cada tamaño de texto en el ticket tiene su contraparte
  `print:` (ej. `text-sm print:text-xs`) que lo achica solo al imprimir;
  en pantalla se ve cómodo para revisar antes de mandarlo a imprimir, y
  en el papel de 80mm sale con el tamaño real de un ticket. La fila de
  "Total" usa un fondo gris en pantalla para destacarla, pero **no** en
  impresión (`print:bg-transparent`) — un relleno de color en una
  térmica sale como un bloque negro sólido, así que ahí se destaca con
  un borde superior doble en su lugar.
- **Cómo se imprime solo el ticket y no la página de atrás**: el bloque
  imprimible tiene `id="imprimible"` (id genérico — lo comparten también
  las etiquetas de producto/variante y la hoja de etiquetas, ver
  `docs/06-proceso-alta-de-producto.md` §5/§5.1, ya que solo una pantalla
  imprime por vez), y una regla `@media print` en `src/index.css` oculta
  todo *lo demás* de la página (`visibility: hidden` en `body *`, visible
  solo ese id y sus hijos, con `position: absolute` para que arranque
  arriba de la hoja). Es más robusto que ir tapando cada elemento con
  `print:hidden` uno por uno (lo que se probó primero con el modal y no
  alcanzaba — el contenido de atrás del modal, la pantalla de Ventas o el
  Historial completos, también salía impreso porque nada los ocultaba a
  ellos). El modal en sí necesitó además `print:static`: estaba en
  `position: fixed`, y con eso de por medio el `position: absolute` del
  ticket se resolvía de forma poco confiable al imprimir (el PDF salía
  desproporcionado/grande) — en `print:static` el ticket se posiciona
  directo contra la página. Si en algún momento se agrega otro contenido
  imprimible en un modal, el patrón es el mismo: `position: static` en
  el modal + `id="imprimible"` en lo que sí tiene que salir.
- Es un **comprobante interno**, no fiscal — dice explícitamente "no
  válido como factura". La emisión de comprobantes con CAE (factura
  A/B/C real) es fase 2, atada a la integración con ARCA/AFIP del
  Documento 4, bastante más adelante que esto.

## 8. Historial de ventas (`/ventas/historial`)

Listado (`listarVentas`) con filtro por estado (incluye Pendientes) y,
según el estado de cada fila: **Anular** (Completadas), **Completar
pago** / **Cancelar** (Pendientes). Dos decisiones de UX puntuales:

- Las columnas quedaron **Ítems** justo al lado de **Total** (no en el
  orden en que aparecen en el tipo `Venta`) para poder leer cantidad y
  total de un vistazo, sin recorrer toda la fila.
- El detalle de una venta (qué productos, pagos, subtotal/descuentos) se
  abre en un **modal** (`DetalleVentaModal`, overlay fijo con `fixed
  inset-0`), no como una fila que se inserta en la tabla. Se probó esa
  alternativa primero y se descartó: insertar una fila empuja hacia abajo
  todas las filas siguientes cada vez que abrís un detalle, lo cual se
  sentía inestable en una lista larga. El modal no toca el layout de la
  tabla — se cierra con la ✕, clic afuera, o Escape.

## 9. Qué queda para más adelante (a propósito, fuera de alcance)

- Reportes (ventas por período, productos más vendidos) — Sprint 3, junto
  al ticket ya construido en la sección 7.
- Cambios y devoluciones (Documento 3 §3.1/§3.2) — Sprint 5.
- Promociones automáticas tipo 2x1 (Documento 3 §3.7) — Sprint 5.
- Vencimiento automático de pedidos pendientes (ver sección 6) — queda
  manual hasta que se defina la regla de negocio (días de gracia, aviso).
