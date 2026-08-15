# Documento 11: Página de inicio (dashboard)

`InicioPage` (`src/features/inicio/InicioPage.tsx`) es la pantalla que se
ve al entrar a la app (`/`, antes redirigía directo a `/productos`). Reúne
lo que hace falta ver antes de arrancar el día: accesos directos a las
acciones más frecuentes, y una foto de qué necesita atención hoy.

## Accesos rápidos

Grilla fija de atajos a las pantallas de alta más usadas: Nueva venta,
Agregar producto, Nuevo cliente, Preparar envío, Ver stock. Son links
simples (`react-router-dom`), no hay lógica — solo evitan navegar por el
Sidebar para lo que se hace todos los días.

El logo del Sidebar (`src/shared/layout/Sidebar.tsx`) también es un
acceso rápido: es un `Link` a `/`, así que tocarlo desde cualquier
pantalla vuelve a Inicio — patrón estándar (header/logo = volver al
inicio).

## Panorama de hoy

`PanoramaHoy` (`src/features/inicio/components/`) es la figura "hero"
del dashboard — lo primero y más grande que se lee, porque plantea
directamente "¿cómo viene el día en plata?":

- **Facturado hoy**, en grande (36–48px según viewport). Al lado, una
  píldora de variación **vs. ayer** (▲/▼ + porcentaje, o "Igual que
  ayer", o "Ayer no hubo ventas" si `totalAyer` es 0 — dividir por cero
  daría un porcentaje sin sentido, así que ahí se corta a texto en vez
  de mostrar un número engañoso).
- Cantidad de ventas del día y **ticket promedio** (`totalHoy /
  cantidadHoy`).
- **Medio de pago principal**: el que más facturó hoy + su % del total
  pagado hoy (`medioPagoPrincipal` en `InicioPage.tsx`, agregando
  `venta.pagos` de las ventas de hoy por `medioPago`). `null` si todavía
  no se cobró nada — no se fuerza un "principal" sin datos.

**Ocultar** (ícono de ojo, al lado del número — mismo lenguaje visual
que el "mostrar contraseña" de una billetera virtual, no un botón de
texto aparte): tapa el total facturado y el ticket promedio, para el
caso de tener el mostrador con gente delante y no querer que se vea la
cifra en pantalla. La píldora de variación (%) y el medio de pago
principal quedan visibles a propósito — no revelan el monto en sí. Sin
librería de íconos en el proyecto, el ojo (abierto/tachado) es SVG en
línea dentro de `PanoramaHoy.tsx` (`IconoOjo`/`IconoOjoTachado`),
pintado con `currentColor` para heredar color por clases de Tailwind
como cualquier texto. La preferencia se guarda en `localStorage`
(`edhen-pos:ocultarFacturado`), no en estado de sesión: es "así quiero
que arranque siempre", no "por ahora".

El tapado es `MontoOcultable` (mismo archivo): muestra `"••••••"`, pero
el número vive en una caja `inline-block` con **`min-width` fijo en
`ch`** (unidad relativa al ancho de un carácter, escala sola con el
tamaño de letra heredado del padre — sirve igual para el número grande
que para el ticket promedio, cada uso pasa su propio `anchoCh`). Mostrar
los puntos o el monto real ocupa la misma caja, así que no corre el
ícono del ojo ni la píldora de al lado al togglear. `anchoCh` se pasa
generoso a propósito (10 para el total, 8 para el ticket promedio): si
alguna vez la cifra real es más ancha que eso, la caja crece igual (es
un mínimo, no un techo) — no se recorta nada, en el peor caso vuelve a
moverse un poco para números fuera de lo común, en vez de fallar.
`aria-hidden` + `sr-only` ("Monto oculto") hacen que un lector de
pantalla no lea la cifra en voz alta cuando está tapada.

Todo sale del mismo fetch de 7 días que ya usan Tendencia y Productos
más vendidos (`listarVentas({ desde: <hace 7 días>, estado:
'COMPLETADA' })`) — "ayer" es simplemente el bucket de `totalPorDia` un
día antes de hoy, no una llamada aparte.

**Por qué "vs. ayer" y no "vs. promedio"**: es la comparación más chica
y más accionable para un local físico — "¿hoy vendí más o menos que
ayer?" es la pregunta real, no un promedio abstracto de la semana.

Es intencionalmente **facturación bruta, no ganancia** — ver "Qué no
es" más abajo.

## Tres números de atención

Debajo del Panorama, una fila de tres accesos con contador (no cuatro:
"Ventas de hoy" quedó absorbido por el Panorama de arriba, mostrarlo dos
veces era redundante):

- **Pedidos pendientes**: `listarVentas({ estado: 'PENDIENTE' })`.length —
  ver `docs/07-proceso-de-venta.md` §6.
- **Stock bajo mínimo**: `listarStock({ bajoMinimo: true })`.length — la
  misma regla `stock < stockMinimo` que ya se usa en `/stock`.
- **Envíos pendientes**: `listarEnvios()` filtrado a lo que no está
  `ENTREGADO` ni `CANCELADO`.

Los tres son clickeables y llevan directo a la vista ya filtrada — no a
la lista general — para que resolver lo pendiente sea un clic, no
"entrar y volver a filtrar":

- Pedidos pendientes → `/ventas/historial?estado=PENDIENTE`
- Stock bajo mínimo → `/stock?bajoMinimo=1`
- Envíos pendientes → `/envios` (sin filtro: `EnviosPage` no tiene un
  filtro "no entregado" agrupado, solo por estado individual)

Para soportar esto, `VentasHistorialPage` y `StockPage` ahora leen su
filtro inicial de la URL (`useSearchParams`, una sola vez al montar, no
sincronizan la URL de vuelta al cambiar el filtro a mano) — mismo patrón
en los dos casos, así que si se agrega otro acceso rápido con filtro a
otra pantalla, es el mismo cambio de una línea.

## Tendencia (gráfico de ventas de los últimos 7 días)

`VentasUltimosDiasChart` (`src/features/inicio/components/`): barra por
día, últimos 7 días incluyendo hoy, total vendido (solo ventas
`COMPLETADA`, un pedido pendiente todavía no es una venta cobrada). Un
solo color gris — es una única serie, así que no hace falta leyenda ni
un acento de color nuevo, se mantiene la paleta sobria del resto de la
app. Sin eje ni grilla: con solo 7 barras, el número exacto de cada día
está siempre a un pase de mouse o un `Tab` (foco de teclado dispara el
mismo tooltip que el hover).

El total de la semana se muestra arriba, al lado del título — no hace
falta sumar barras a ojo para tener el número grande del período. La
barra de **"Hoy"** se destaca en gris oscuro (el resto en gris claro,
mismo criterio de *emphasis* que el ranking de abajo) con su valor
mostrado **siempre**, no solo al pasar el mouse — es el dato del día,
el más consultado, así que no debería requerir un gesto extra para
leerlo. El resto de los días siguen necesitando hover/foco para el
valor exacto, que es aceptable: son historial, no la pregunta del
momento. El eje X muestra "Hoy" en la última columna en vez de la
abreviatura del día, para no tener que calcular qué día es.

**Tamaño**: barra de 24px de ancho (el tope del mark spec para que
siga leyéndose como barra fina, no un bloque) y 120px de alto — se
agrandó a pedido explícito, se veía chico al lado de las otras
tarjetas del dashboard. El ancho de la barra no se movió del tope; lo
que se agrandó fue el alto del gráfico y el tamaño de letra de
etiquetas/tooltip (`text-xs`/`text-sm` en vez de `text-[10px]`/`text-xs`).

Los buckets por día usan **fecha local, no UTC** (`claveDiaLocal` en
`InicioPage.tsx`) — comparar `fechaVenta` (que se guarda en UTC) contra
un límite calculado en UTC podía correr el corte de "hoy" unas horas
respecto de lo que el cajero espera. La cantidad/total de "Ventas de
hoy" (sección anterior) sale del mismo fetch de 7 días, filtrado a la
clave de hoy — no es una llamada aparte.

## Productos más vendidos (últimos 7 días)

`ProductosMasVendidos` (`src/features/inicio/components/`): top 5,
agregando `venta.detalles` de ese mismo fetch de 7 días por
`producto.id` (cantidad vendida + monto). Se ordena por **cantidad**,
no por monto — para decidir qué reponer importa más "cuántas unidades
se fueron" que "cuánto facturó" (un producto caro que se vende poco no
debería tapar a uno barato que se agota seguido). Barra horizontal de
un solo color, mismo criterio de paleta que el gráfico de tendencia.

El primer puesto se destaca (fondo, texto y barra más oscuros; el resto
en gris más claro) — es **emphasis**, no una paleta categórica nueva:
un solo punto de interés remarcado, el resto como contexto. A propósito
**no** se gradúa el color puesto por puesto (2do más oscuro que 3ro,
etc.) — el largo de la barra ya muestra la magnitud; degradar el color
además codificaría lo mismo dos veces sin sumar información.

Cada fila muestra, además de cantidad y monto, un **% vendido** —
`cantidad / (cantidad + stockActual)`. `stockActual` es la suma del
`stock` de **todas las variantes activas de ese producto** (no de una
variante puntual), calculado en `InicioPage.tsx` a partir de
`listarStock()` completo (sin filtro), agrupado por `producto.id`. Es
una tasa de rotación a nivel **modelo**: "de todo lo que hubo de este
producto (lo vendido + lo que queda en el local, sumando todos los
talles/colores), ¿qué porción ya se vendió?" — no "% de este talle en
particular" ni "% de participación dentro del ranking" (que es lo que
mostraba antes; se reemplazó porque no respondía la pregunta real). Si
no queda nada en stock, da 100% — se vendió todo lo que había, señal de
"reponer ya". El total en pesos se ve arriba junto al título (mismo
tratamiento que el gráfico de Tendencia), y cada fila es un `Link` a
`/productos/:id` — ver algo llamativo acá y poder ir directo a esa
ficha (para reponer stock o revisar el precio) es el objetivo de
tenerlo en Inicio, no solo mirarlo.

## Qué no es

No reemplaza los reportes con **selector de período custom**
(`docs/05-plan-de-implementacion.md`, Sprint 3) — esta pantalla es una
foto fija de "los últimos 7 días / hoy", sin forma de elegir otro rango
desde la UI. Si en algún momento hace falta comparar, por ejemplo, "este
mes contra el anterior", eso es una pantalla de Reportes aparte, no una
extensión de Inicio.

**Ganancias, no ingresos**: todo lo que esta pantalla muestra en pesos
(Panorama de hoy, Tendencia, montos del ranking) es **facturación
bruta**, no ganancia neta. El modelo de datos actual
(`docs/02-modelo-de-datos.md`) no tiene un costo por variante —
`ProductoVariante` solo tiene `precio` de venta — así que no hay con qué
calcular margen todavía. Mostrar un número llamado "ganancias" sin esa
base sería directamente engañoso para una decisión de negocio real.
Agregarlo requiere primero sumar un campo de costo al producto/variante
(alta, edición, y probablemente permisos — no es algo que todo el
personal debería ver).
