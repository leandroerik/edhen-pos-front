# Documento 9: Módulo de Clientes (frontend)

Explica el ABM de Clientes en `edhen-pos-front` (`src/features/clientes/`)
y cómo quedó conectado al POS, reemplazando el selector stub
Mayorista/Minorista que se había dejado en Ventas a propósito hasta que
este módulo existiera (ver `docs/07-proceso-de-venta.md`, sección 2 —
ahora superada por este documento).

> Estado actual: mock en memoria (`src/api/clientes.api.ts`), replica el
> contrato `GET/POST /api/clientes` del Documento 3. ABM completo (alta,
> edición, baja/reactivación) aunque el contrato original solo esboza
> GET/POST — mismo criterio que se usó en Productos: se extiende el
> contrato con lo que hace falta para un ABM real, sin inventar nada que
> contradiga el modelo de datos.

## 1. Tipo de cliente

`TipoCliente` (`src/types/cliente.ts`) quedó en **tres** valores:
`MAYORISTA`, `MINORISTA`, `OTRO`. El Documento 2 no tiene este campo en la
entidad `Cliente` — es un dato de negocio que surgió al construir el POS
(ver memoria de proyecto). Se agregó `OTRO` desde el arranque para no
tener que migrar el enum apenas aparezca un caso que no sea ni mayorista
ni minorista.

Sigue siendo **solo informativo**: no aplica precio diferencial
automático. Si un cliente mayorista tiene un precio distinto, se sigue
cargando a mano en el campo "Precio" de cada línea del carrito, igual que
antes.

## 2. Direcciones (Cliente 1─N Direccion)

Un cliente puede tener varias direcciones (`src/types/direccion.ts`,
CRUD en `clientes.api.ts`: `listarDirecciones`, `crearDireccion`,
`editarDireccion`, `eliminarDireccion`), con una marcada como
**principal** — al marcar una nueva como principal, automáticamente se
desmarca cualquier otra del mismo cliente (`desprincipalizarOtras`).

Se agregó **antes** de que existiera el módulo de Envíos, a pedido
explícito: la idea era que cuando un cliente da su dirección (para un
pedido puntual, por WhatsApp, etc.) quede cargada de una vez, en vez de
perderla y tener que volver a pedirla. La sección "Direcciones" vive
dentro de `ClienteFormPage.tsx`, pero **solo en modo edición** — no en el
alta: hay que guardar el cliente primero, igual que las variantes de un
producto solo se pueden gestionar completo una vez que el producto
existe.

El módulo de Envíos en sí (seguimiento, transportista, estado) ya se
construyó — ver `docs/10-proceso-envios.md`. Estas direcciones son
justamente las que usa `/envios/nuevo` para elegir dónde entregar.

## 3. Qué más queda fuera (a propósito)

- **Cuenta corriente**: `saldo_cuenta_corriente`, `GET
  /api/clientes/{id}/cuenta-corriente`, `POST
  /api/clientes/{id}/pagos` — el Documento 5 (plan de sprints) la ubica
  explícitamente en el Sprint 5 ("Casos especiales"), es una feature más
  grande (ledger de movimientos, no solo un ABM). Por eso
  `CUENTA_CORRIENTE` sigue sin aparecer en el selector de medios de pago
  del POS aunque el tipo `MedioPago` ya la soporte — no hay saldo a quién
  cargarle todavía.

## 4. Conexión con el POS

`VentasPage.tsx` reemplazó el selector "Tipo de cliente" (Mayorista /
Minorista, hardcodeado) por un buscador real: mismo patrón de debounce +
dropdown que ya se usaba para buscar productos, pero contra
`buscarClientesParaVenta` (nombre, apellido, teléfono o DNI). La venta
sigue pudiendo hacerse sin cliente — "venta mostrador" — tal como lo
permite el Documento 2.

`Venta.cliente` (`src/types/venta.ts`) es un **snapshot** opcional (`{id,
nombre, apellido, tipo}`), no una referencia viva al cliente — mismo
criterio que ya se usaba para `VentaDetalle.producto`/`variante`: si el
cliente cambia de tipo o de nombre después, el historial de esa venta
sigue mostrando el dato tal como era al momento de cobrar.
