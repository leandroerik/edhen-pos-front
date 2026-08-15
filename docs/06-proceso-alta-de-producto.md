# Documento 6: Proceso de alta de un producto (frontend)

Este documento explica cómo funciona hoy el alta/edición de un producto en
`edhen-pos-front` (`src/features/productos/`), qué decisiones de diseño se
tomaron y por qué. Complementa al Documento 2 (modelo de datos) y al
Documento 3 (contrato de API) — acá se explica el *proceso*, no el esquema.

> Estado actual: todo esto corre contra mocks en memoria
> (`src/api/productos.api.ts`, `src/api/catalogos.api.ts`) que replican
> exactamente la firma de la futura API REST descripta en el Documento 3.
> Cuando el backend exista, solo cambia el cuerpo de esas funciones (pasan a
> llamar a `apiClient`) — ni los componentes ni el resto del flujo se tocan.

## 1. Flujo paso a paso

1. **Elegir categoría.** Se selecciona de un catálogo existente
   (`categorias`, cargado con `useCatalogos()`). Las categorías no tienen
   opción "otro" por ahora — son pocas y cambian poco, se dan de alta a mano
   en el catálogo si hace falta una nueva.
2. **Cargar los datos del producto**: nombre, descripción, precio base,
   URL de imagen. El código de barras del producto ya no se tipea acá —
   ver sección 4.
3. **Cargar variantes** (talle + color): cada variante es la combinación
   concreta que se vende y se escanea en el mostrador. Un producto puede
   tener 1 o más variantes; sin variantes, el producto no tiene stock
   vendible. Para cargar varias de una, ver el **generador de variantes**
   (sección 2.1) — cargar fila por fila con "+ Agregar variante" sigue
   disponible para ajustes puntuales.
4. Al guardar, se crea (o edita) el producto y, en el mismo paso, se crean
   o editan todas las variantes cargadas en el formulario.

## 2. Catálogos normalizados de color y talle — y la opción "Otro"

El Documento 2 es explícito: los catálogos de color y talle están
normalizados a propósito ("es mejor que texto libre, sobre todo para
filtros y reportes por talle/color"). Guardar el color como texto suelto en
cada variante rompe esa idea: "Rosa" en una variante y "Rosita" en otra
quedarían como cosas distintas para cualquier filtro o reporte.

Por eso la opción **"+ Otro color…" / "+ Otra talla…"** del formulario no
guarda texto libre en la variante: da de alta una fila nueva en el
catálogo compartido (`src/api/catalogos.api.ts`, funciones `crearColor` /
`crearTalla`) y recién ahí arma la variante con ese color/talla ya
"catalogado". Si el nombre ya existe (comparación case-insensitive), se
reutiliza la fila existente en vez de duplicarla. A partir de ese momento
el color/talle nuevo aparece en el desplegable para cualquier otro
producto.

- **Color nuevo**: pide nombre + un selector de color (`<input
  type="color">`) para el código hex, usado para el swatch que se ve en el
  listado de productos.
- **Talla nueva**: pide nombre + `tipo` (`ROPA_SUPERIOR`, `ROPA_INFERIOR`,
  `CALZADO`, `UNICO`, igual que en el Documento 2). El campo `orden`
  (para que "S < M < L" no se ordene alfabéticamente) se calcula solo:
  siguiente al máximo orden ya usado dentro de ese mismo tipo.

## 2.1. Generador de variantes (talle × color)

`GeneradorVariantes` (`src/features/productos/components/`), arriba de la
tabla de variantes. Pensado para el caso real de un producto de ropa con
varios talles y varios colores por talle — cargar eso fila por fila
("+ Agregar variante" 15 veces para 3 talles × 5 colores) era el punto
más tedioso del alta, y encima ni todos los talles tienen los mismos
colores disponibles.

El flujo:

1. **Tocar un talle** (chip) para desplegar su selector de colores — de
   `tallas`, el catálogo real, no una lista fija S–XXL: un producto de
   Pantalones usa talles numéricos, por ejemplo, y el generador tiene que
   servir para cualquier categoría. Los chips vienen **ordenados por uso
   real en todo el catálogo** (`contarUsoCatalogo`,
   `src/api/productos.api.ts`, aplicado en `useCatalogos`), los más
   usados primero — para no tener que buscar "Negro" entre veinte colores
   que casi no se usan.
2. Por **cada talle elegido**, aparece su propia fila de chips de color —
   a propósito por separado y no un único selector compartido por todos
   los talles, porque el color disponible puede variar de un talle a
   otro (pedido explícito: "eso es lo más difícil de administrar").
3. **Cada color que se toca genera la variante al instante** — sin un
   botón "Confirmar" aparte: mismo draft "vacío" que agregar una fila a
   mano (SKU sugerido, stock en 0, código de barras automático), con el
   talle/color ya fijados. El chip queda marcado "✓" y no se puede volver
   a tocar — evita duplicar la misma combinación.
4. **"Copiar colores de `<talle anterior>`"**, al lado del nombre de cada
   talle (salvo el primero elegido): repite exactamente el mismo conjunto
   de colores ya cargado en el talle anterior. Pensado para el caso más
   común — la mayoría de los talles de un producto vienen en los mismos
   colores — sin tener que volver a tocar cada chip de color una vez por
   talle.
5. **"+ Otra talla…" / "+ Otro color…"**, al lado de los chips
   correspondientes: da de alta en el catálogo compartido (mismo criterio
   de "Otro" que la tabla manual, sección 2 — nunca texto suelto) sin
   salir del generador. Un color nuevo cargado desde acá genera de una la
   variante para el talle en el que se lo agregó. Después de crear
   cualquiera de los dos, se dispara `onCatalogoActualizado` →
   `useCatalogos().recargar()`, así el nuevo color/talla ya aparece como
   chip elegible para el resto de los talles sin recargar la página.

**Colores acotados a los primeros 3** (`COLORES_VISIBLES_INICIAL`,
`GeneradorVariantes.tsx`) por talle, para no llenar la pantalla cuando
el catálogo de colores es largo — como vienen ordenados por uso, esos 3
son los que más se repiten en la tienda, no los primeros que se dieron
de alta. Un color ya cargado para ese talle se sigue mostrando aunque no
esté entre los 3 (el "✓" nunca queda escondido). El resto del catálogo
va a **"Otros colores (N) ▾"** al lado de los chips — a propósito **no**
es un `<select>` nativo: es un botón que despliega una lista propia
(mismo patrón visual que el dropdown de resultados de búsqueda del POS,
`VentasPage.tsx`), con el swatch de color al lado de cada nombre —
pedido explícito ("que sea como una lista menú, no expandir"), y de paso
permite mostrar el color en vez de solo el texto plano que un `<option>`
no puede llevar. Se cierra solo al elegir un color o al hacer clic
afuera (`data-talla-menu`, mismo criterio en todo el componente: un solo
menú abierto a la vez). Aplica también cuando el producto tiene un solo
talle (`ÚNICO`, ej. accesorios) — el generador funciona igual con un
solo talle expandido.

**Total en vivo** debajo de la tabla: cantidad de variantes + suma del
stock cargado en cada una ("prendas en total") — pedido explícito para
poder cruzar contra lo que efectivamente llegó (ej. un envío del
proveedor) a medida que se van tipeando las cantidades, sin tener que
sumar a mano.

**La tabla queda ordenada por talle** (`orden` del catálogo de tallas,
no por orden de carga — `VariantesEditor.tsx`, `ordenDeTalla`), pedido
explícito para "mantener el orden": si se vuelve a agregar un color al
talle "S" después de ya haber cargado el "M" y el "L", esa fila nueva
aparece agrupada junto al resto de "S", no al final de la tabla. El
orden se recalcula en cada render (`Array.prototype.sort`, estable), así
que dentro de un mismo talle las filas quedan en el orden en que se
cargaron.

**Auto-scroll a la fila nueva** (no al final de la tabla): como el
orden ya no es "última fila = más reciente", el auto-scroll apunta
puntualmente a la fila recién creada por su `localId`
(`filaRefs`/`localIdsNuevosRef` en `VariantesEditor.tsx`), la centra en
pantalla, y listo — se dispara al agregar una variante (a mano, desde
el generador, o copiando el talle anterior), nunca al editar un campo
de una fila existente.

## 3. SKU: 100% automático, no editable

**Cambio de criterio** (mismo espíritu que el código de barras, sección
4): el SKU dejó de ser un campo que se tipea o se corrige a mano. Se
calcula siempre (`src/features/productos/lib/sku.ts`, `sugerirSku`) a
partir de nombre del producto + color + talla:

```
sugerirSku("Remera básica algodón", "Negro", "S") → "REM-BAS-NEG-S"
```

Toma las primeras 2 palabras del nombre del producto + el color + la
talla, cada una abreviada a 3 letras, sin tildes ni símbolos, en
mayúsculas, separadas por guión.

**El id de la variante va de sufijo** (`generarSku`, `productos.api.ts`):
`"REM-BAS-NEG-S-14"`. Como el id es un contador global único
(`nextVarianteId`), el SKU final queda único por construcción — no hace
falta validarlo contra el resto del catálogo (a diferencia de una
versión anterior de este documento, que sí tenía una validación de
unicidad porque el SKU se podía tipear a mano y podía chocar).

En la tabla de variantes se ve como **texto chico, gris, no un
input** — mismo tratamiento que el código de barras. Mientras la fila
todavía no se guardó no hay id real todavía, así que se muestra la base
sola con "…" al final (ej. `"REM-BAS-NEG-S…"`) como aviso de que el SKU
definitivo se termina de armar al guardar. Si después se cambia el color
o el talla de una variante ya guardada, el SKU se recalcula con esos
datos nuevos (mismo id, mismo sufijo) — nunca queda con el nombre
"viejo".

La columna de SKU tiene un ancho mínimo propio (`min-w-[9rem]`) y no
envuelve el texto (`whitespace-nowrap`) — con el sufijo del id el SKU
quedó más largo que antes, así que ya no comparte el ancho ajustado al
contenido del resto de las columnas; si hace falta, la tabla scrollea
horizontal (`overflow-x-auto` en el contenedor) antes que recortar el
SKU.

**Orden de columnas**: Talla primero, después Color (antes era al
revés) — pedido explícito, quedó más natural leer la fila así.

## 4. Código de barras: 100% automático, ya no se tipea en el alta

**Cambio de criterio** (feedback directo del uso real): para esta tienda
ninguna prenda llega con su propio código de barras individual de
fábrica, así que pedir el campo en el formulario era ruido — un campo
vacío que nunca se completaba. El código de barras dejó de ser algo que
se carga a mano al dar de alta; se genera solo, en dos niveles:

- **Por variante** (talle+color exacto — lo que se escanea en el
  mostrador para una prenda puntual): `generarCodigoBarrasInterno`
  (`src/features/productos/lib/codigoBarras.ts`), prefijo `20` + id de
  variante (10 dígitos) + dígito verificador EAN-13. En la tabla de
  variantes, mientras se está creando el producto no hay ni campo que
  llenar (dice "auto"); una vez guardada, se ve como texto informativo
  gris — no un input editable.
- **Por producto** (código "genérico" — junta todas las variantes de
  ese modelo, para el flujo de escaneo del POS que pide elegir
  talle/color cuando no se identificó una variante puntual, ver
  `docs/07-proceso-de-venta.md` §1): `generarCodigoBarrasProducto`
  (mismo archivo), prefijo `21` + id de producto + dígito verificador.
  Se genera al crear el producto (`crearProducto`,
  `src/api/productos.api.ts`) y se muestra como texto chico debajo del
  título en modo edición (`ProductoFormPage.tsx`) — tampoco es un campo
  del formulario.

Los dos prefijos (`20` variante / `21` producto) están dentro del rango
`20`–`29` que **GS1 reserva oficialmente para uso interno / no
comercial** — la práctica estándar en retail para generar códigos
propios sin arriesgarse a chocar con un código real de otro producto en
el mundo, y como cada uno usa un prefijo distinto, tampoco pueden
chocar entre sí. El dígito verificador usa el algoritmo estándar de
EAN-13 (suma ponderada 1-3-1-3... de los 12 dígitos, dígito = `(10 -
suma mod 10) mod 10`), así que ambos son EAN-13 válidos de punta a
punta: se pueden imprimir en una etiqueta y los lee cualquier lector de
código de barras común.

**Por qué es único e irrepetible.** El código se arma a partir del `id`
interno (de la variante o del producto, según el nivel) — una primary
key que la base garantiza única por definición. Como el código es una
función directa de ese `id`, dos variantes (o dos productos) nunca
pueden terminar con el mismo código autogenerado.

**Al editar, el código no se vuelve a pedir ni se pierde.**
`editarProducto`/`editarVariante` conservan el código ya asignado si el
formulario no manda uno nuevo — antes de este cambio, guardar una
edición sin ese campo (algo que iba a pasar siempre, ya que ni se
muestra) lo pisaba con `undefined` y lo borraba.

**Si algún día hace falta un código real de fábrica**, la capacidad
sigue existiendo en la API (`crearVariante`/`crearProducto` aceptan
`codigoBarras` opcional en su input) — lo que se sacó es el campo del
formulario, no la funcionalidad. Si vuelve a hacer falta, es agregar de
nuevo el input.

**La tabla de variantes del formulario ya ni siquiera muestra la
columna** — al ser 100% automático y no interactivo, mostrarlo ahí era
puro ruido visual sin ninguna acción posible (pedido explícito: "sacalo").
Sigue visible en `ProductoDetallePage.tsx` (la vista de solo lectura,
sección 5), que es donde tiene sentido consultarlo — para escanear o
copiar el código real ya asignado, no mientras se está cargando.

## 5. Ver detalle e imprimir la etiqueta

Desde el listado (`/productos`), el link **"Ver"** de cada fila lleva a
`/productos/:id` (`ProductoDetallePage.tsx`): muestra los datos del
producto y sus variantes — la vista de solo lectura (bah, ya no tan de
solo lectura, ver más abajo) que faltaba, separada del formulario de
edición.

El resumen de arriba también incluye **Colores** y **Talles** en uso —
no son un campo propio del producto, se derivan de sus variantes activas
(nombres únicos + cantidad, ej. "Negro, Blanco, Rojo (3)") — puramente
informativo, para ver de un vistazo qué tan variado está cargado un
producto sin tener que contar filas de la tabla de variantes.

### Variantes agrupadas por color, plegable

La tabla plana de variantes se reemplazó por una sección **por color**
(pedido explícito: "ver las variantes tipo desplegable"), plegada por
defecto. El encabezado de cada color muestra de un vistazo, sin
desplegar — swatch, nombre, cantidad de talles, stock total, y dos
avisos si aplican ("bajo mínimo", "con inactivas") — así no hace falta
abrir cada uno para saber si necesita atención. Adentro, cada talle
tiene SKU, código de barras, precio, stock (rojo si está bajo el
mínimo), y las acciones: toggle Activa/Inactiva, Imprimir, y "+ Cola".
El encabezado del color también tiene su propio **"+ Cola (todas)"**,
que agrega de una todos los talles activos de ese color a la cola de
etiquetas.

Se descartó a propósito una alternativa que se había considerado —
chips de filtro por color/talla sobre una tabla plana — porque agrupar
por color ya resuelve el mismo problema (encontrar rápido una
combinación en un producto con muchas variantes) sin sumar un mecanismo
aparte; con la tabla ya organizada por color, filtrar por color
específicamente dejó de hacer falta.

**Toggle rápido de Activa/Inactiva** sin ir al formulario de edición
completo: llama a `editarVariante` con los datos actuales de la
variante y solo pisa `activo`, y actualiza el estado local al
confirmar. Una variante **inactiva se ve atenuada** (texto gris en vez
del color de texto normal) en toda su fila — se decidió mostrarla
atenuada en vez de ocultarla directamente, para no dar la sensación de
que "desapareció" del producto; simplemente se sabe que no se vende.

**"+ Cola" refleja el estado actual**, no es un botón que solo dispara
una acción a ciegas: si esa variante (o el código genérico del
producto) ya está en la cola de etiquetas, el botón cambia a "✓ En cola
(N)" — pedido explícito, para no agregar el mismo código dos veces sin
darse cuenta. Sigue siendo clickeable para sumar más si realmente se
quieren varias copias; la diferencia es que ahora se **ve** que ya
había algo cargado antes de tocarlo de nuevo.

Desde ahí, cada variante tiene un link **"Imprimir"** que lleva a
`/productos/:id/variantes/:varianteId/etiqueta`
(`EtiquetaVariantePage.tsx`). Esa pantalla arma una etiqueta mínima —
**nombre del producto + el código de barras dibujado como barras reales**
(no el número suelto) — y un botón "Imprimir etiqueta" que dispara
`window.print()`. El sidebar/navbar y los botones de la pantalla se
ocultan al imprimir (clase `print:hidden` de Tailwind), y el bloque con
la etiqueta en sí lleva `id="imprimible"`, así que en el papel solo sale
la etiqueta.

El código **genérico del producto** (sección 4) tiene su propia etiqueta
para imprimir, mismo patrón: `/productos/:id/etiqueta`
(`EtiquetaProductoPage.tsx`), con un link "Imprimir" al lado del campo
"Código de barras (producto)" en el detalle, y otro en el formulario de
edición (al lado del texto informativo del código genérico) — dos
lugares distintos desde donde se puede llegar a imprimirlo, porque no
había ninguno.

El dibujo del código de barras lo genera `jsbarcode` (MIT, sin costo) a
partir del valor guardado en la variante — es el mismo componente
(`src/features/productos/components/CodigoBarras.tsx`) el que se usaría
más adelante si se agrega impresión en el propio POS al momento de recibir
mercadería.

**Bug corregido: la etiqueta imprimía en blanco.** `src/index.css` tiene
una regla `@media print` que oculta todo `body *` salvo un id específico
(pensada originalmente solo para el ticket de venta, ver
`docs/07-proceso-de-venta.md` §7). `EtiquetaVariantePage.tsx` y
`EtiquetaProductoPage.tsx` no tenían ese id en su bloque imprimible, así
que al imprimir quedaban completamente vacías — todo el contenido de la
página, etiqueta incluida, caía bajo la regla que lo oculta. El id se
renombró de `ticket-imprimible` a **`imprimible`** (genérico, ya no es
solo del ticket) y ahora lo llevan las cuatro pantallas que imprimen algo
en esta app (ticket, etiqueta de variante, etiqueta de producto, hoja de
etiquetas — ver más abajo). El ancho fijo (antes 80mm a nivel de la regla
compartida) se sacó de ahí: cada pantalla pone el suyo en su propio
wrapper, porque el ticket y la hoja A4 necesitan anchos distintos.

## 5.1. Cola de etiquetas — imprimir varias en una hoja A4

Imprimir una etiqueta a la vez en la térmica no sirve cuando hay que
etiquetar una entrega grande. `ColaEtiquetasProvider`
(`src/features/productos/context/`) mantiene una cola global de
etiquetas pendientes de imprimir — accesible desde cualquier pantalla
vía Context (envuelve toda la app en `App.tsx`) y persistida en
`localStorage` (`edhen-pos:colaEtiquetas`), para que sobreviva una
recarga mientras se arma la tanda.

- **Agregar a la cola**: desde `ProductoDetallePage.tsx`, un botón
  **"+ Cola"** al lado de cada "Imprimir" — tanto en cada fila de
  variante como en el código genérico del producto. Agregar el mismo
  ítem de nuevo suma cantidad en vez de duplicar la fila.
- **`/etiquetas`** (`EtiquetasColaPage.tsx`, link "Etiquetas" en el
  Sidebar con contador): lista lo que hay en la cola, con `− n +` por
  ítem, "Quitar", y "Vaciar" para arrancar de cero. El botón **"Imprimir
  hoja"** arma una grilla de 3 columnas (una celda por etiqueta —
  repetida tantas veces como diga la cantidad de ese ítem) con
  `id="imprimible"`, así que solo eso sale impreso.
- **Tamaño de página A4**, distinto del 80mm por defecto del resto de la
  app: `@page` no se puede condicionar por selector CSS (no hay forma de
  decir "esta regla solo si cierto elemento está en la página"), así que
  `EtiquetasColaPage` inyecta su propio `<style>` con `@page { size: A4 }`
  al montarse (`usePaginaA4`, mismo archivo) y lo saca al desmontarse —
  así no le pisa el tamaño de página al ticket ni a una etiqueta suelta
  cuando se navega a otra pantalla.

## 6. Stock: no se edita libre (recordatorio)

Ya documentado en el Documento 2 y aplicado en el formulario: el `stock`
de una variante existente se muestra de solo lectura ("se ajusta desde
Stock"). Solo se carga un valor inicial al dar de alta una variante nueva
(equivale a un ingreso inicial de inventario). Cualquier ajuste posterior
va a pasar por el módulo de Stock (`POST /api/stock/ajuste`, con motivo
obligatorio), todavía no construido.

**El campo arranca en `0` y se vacía solo al primer foco** — al hacer
clic o entrar con `Tab` al input de stock de una variante nueva, si
todavía dice `0` (el valor por defecto, no algo que se haya tipeado) se
borra para poder escribir directo la cantidad real, sin tener que
seleccionar y borrar el `0` a mano primero. Solo pasa esa primera vez:
si se vuelve a enfocar el campo después de haber cargado algo, no se
vuelve a vaciar.

**Stock mínimo sugerido = 10% del stock inicial.** Mientras no se edite
el campo a mano, el mínimo sigue en vivo al 10% de lo que se carga en
Stock (redondeado para arriba, piso de 1 si hay algo de stock —
`conStockMinimoSugerido` en `VariantesEditor.tsx`). Se distingue
visualmente (gris mientras es sugerido,
oscuro una vez editado a mano) y tiene el mismo botón ↺ para volver al
modo automático. Solo aplica a variantes nuevas — para una variante ya
existente el stock no es editable desde este formulario, así que no
hay de qué recalcular el mínimo.
