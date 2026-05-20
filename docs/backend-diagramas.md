# Diagramas de Clases — Backend Edhen POS

Referencia para el diseño del backend Spring Boot + PostgreSQL.
Tecnologías: Java 17, Spring Boot 3, JPA/Hibernate, PostgreSQL.

---

## Grupo 1 — Catálogo

Entidades para gestionar el catálogo de productos, variantes, atributos y ofertas.

```mermaid
classDiagram

  class Categoria {
    +Long id
    +String nombre
    +String icono
    +String color
    +Integer posicion
    +Boolean activa
    +BigDecimal tasaIva
    +Categoria padre
    +List~Categoria~ hijos
    +List~Producto~ productos
  }

  class Atributo {
    +Long id
    +String nombre
    +TipoAtributo tipo
    +Boolean activo
    +List~ValorAtributo~ valores
  }

  class ValorAtributo {
    +Long id
    +Atributo atributo
    +String valor
    +Integer posicion
  }

  class Producto {
    +Long id
    +String nombre
    +String descripcion
    +String codigoBarras
    +Categoria categoria
    +BigDecimal precioBase
    +BigDecimal precioVenta
    +Boolean activo
    +Boolean tieneVariantes
    +String imagenUrl
    +List~Variante~ variantes
    +List~Oferta~ ofertas
  }

  class Variante {
    +Long id
    +Producto producto
    +String sku
    +String codigoBarras
    +BigDecimal precioExtra
    +Integer stock
    +Boolean activa
    +List~VarianteAtributo~ atributos
  }

  class VarianteAtributo {
    +Long id
    +Variante variante
    +ValorAtributo valorAtributo
  }

  class Oferta {
    +Long id
    +Producto producto
    +String nombre
    +TipoDescuento tipoDescuento
    +BigDecimal valor
    +LocalDate fechaInicio
    +LocalDate fechaFin
    +Boolean activa
  }

  class TipoAtributo {
    <<enumeration>>
    COLOR
    TALLE
    MATERIAL
    GENERO
    OTRO
  }

  class TipoDescuento {
    <<enumeration>>
    PORCENTAJE
    MONTO_FIJO
  }

  Categoria "1" --> "0..*" Categoria : hijos
  Categoria "1" --> "0..*" Producto : productos
  Producto "1" --> "0..*" Variante : variantes
  Producto "1" --> "0..*" Oferta : ofertas
  Atributo "1" --> "1..*" ValorAtributo : valores
  Variante "1" --> "0..*" VarianteAtributo : atributos
  VarianteAtributo "0..*" --> "1" ValorAtributo
  Atributo --> TipoAtributo
  Oferta --> TipoDescuento
```

---

## Grupo 2 — Personas

Usuarios del sistema (admin/vendedor) y clientes del negocio.

```mermaid
classDiagram

  class Usuario {
    +Long id
    +String nombre
    +String apellido
    +String email
    +String passwordHash
    +RolUsuario rol
    +Boolean activo
    +LocalDateTime creadoEn
    +LocalDateTime ultimoAcceso
  }

  class Cliente {
    +Long id
    +String nombre
    +String apellido
    +String telefono
    +String email
    +TipoCliente tipo
    +TipoPersona tipoPersona
    +String cuit
    +Boolean activo
    +LocalDate fechaNacimiento
    +LocalDateTime creadoEn
    +List~DireccionCliente~ direcciones
  }

  class DireccionCliente {
    +Long id
    +Cliente cliente
    +String calle
    +String numero
    +String piso
    +String depto
    +String codigoPostal
    +String ciudad
    +String provincia
    +Boolean esPrincipal
  }

  class RolUsuario {
    <<enumeration>>
    ADMIN
    VENDEDOR
  }

  class TipoCliente {
    <<enumeration>>
    MINORISTA
    MAYORISTA
    VIP
  }

  class TipoPersona {
    <<enumeration>>
    FISICA
    JURIDICA
  }

  Usuario --> RolUsuario
  Cliente --> TipoCliente
  Cliente --> TipoPersona
  Cliente "1" --> "0..*" DireccionCliente : direcciones
```

---

## Grupo 3 — Caja y Ventas

Gestión de turnos de caja, movimientos y ventas en tienda.

```mermaid
classDiagram

  class Caja {
    +Long id
    +Usuario vendedor
    +LocalDateTime apertura
    +LocalDateTime cierre
    +BigDecimal montoInicial
    +BigDecimal montoFinal
    +BigDecimal montoContado
    +BigDecimal diferencia
    +EstadoCaja estado
    +String observaciones
    +List~MovimientoCaja~ movimientos
    +List~Venta~ ventas
  }

  class MovimientoCaja {
    +Long id
    +Caja caja
    +TipoMovimiento tipo
    +BigDecimal monto
    +String motivo
    +LocalDateTime fecha
    +Usuario registradoPor
  }

  class Venta {
    +Long id
    +Caja caja
    +Cliente cliente
    +Usuario vendedor
    +LocalDateTime fecha
    +EstadoVenta estado
    +CanalVenta canal
    +FormaPago formaPago
    +BigDecimal subtotal
    +BigDecimal descuento
    +BigDecimal total
    +String observaciones
    +List~ItemVenta~ items
  }

  class ItemVenta {
    +Long id
    +Venta venta
    +Variante variante
    +Integer cantidad
    +BigDecimal precioUnitario
    +BigDecimal descuento
    +BigDecimal subtotal
  }

  class EstadoCaja {
    <<enumeration>>
    ABIERTA
    CERRADA
  }

  class TipoMovimiento {
    <<enumeration>>
    INGRESO
    EGRESO
    AJUSTE
  }

  class EstadoVenta {
    <<enumeration>>
    PENDIENTE
    COMPLETADA
    ANULADA
    CON_DEVOLUCION
  }

  class FormaPago {
    <<enumeration>>
    EFECTIVO
    DEBITO
    CREDITO
    TRANSFERENCIA
    QR
    MIXTO
  }

  class CanalVenta {
    <<enumeration>>
    TIENDA
    ONLINE
    TELEFONO
    WHATSAPP
  }

  Caja --> EstadoCaja
  Caja --> Usuario
  Caja "1" --> "0..*" MovimientoCaja : movimientos
  Caja "1" --> "0..*" Venta : ventas
  MovimientoCaja --> TipoMovimiento
  Venta --> EstadoVenta
  Venta --> FormaPago
  Venta --> CanalVenta
  Venta --> Cliente
  Venta --> Usuario
  Venta "1" --> "1..*" ItemVenta : items
  ItemVenta --> Variante
```

---

## Grupo 4 — Devoluciones

Registro de devoluciones y fallas de productos.

```mermaid
classDiagram

  class Devolucion {
    +Long id
    +Venta ventaOriginal
    +Cliente cliente
    +Usuario procesadoPor
    +LocalDateTime fecha
    +TipoDevolucion tipo
    +MotivoDevolucion motivo
    +String descripcion
    +MetodoDevolucion metodoResolucion
    +BigDecimal montoDevuelto
    +List~ItemDevolucion~ items
  }

  class ItemDevolucion {
    +Long id
    +Devolucion devolucion
    +Variante variante
    +Integer cantidad
    +BigDecimal montoUnitario
    +String observacion
  }

  class TipoDevolucion {
    <<enumeration>>
    DEVOLUCION
    FALLA
    CAMBIO
  }

  class MotivoDevolucion {
    <<enumeration>>
    TALLE_INCORRECTO
    DEFECTO_FABRICACION
    CAMBIO_DECISION
    PRODUCTO_DANADO
    OTRO
  }

  class MetodoDevolucion {
    <<enumeration>>
    EFECTIVO
    CREDITO_TIENDA
    TRANSFERENCIA
    CAMBIO_PRODUCTO
  }

  Devolucion --> TipoDevolucion
  Devolucion --> MotivoDevolucion
  Devolucion --> MetodoDevolucion
  Devolucion --> Venta
  Devolucion --> Cliente
  Devolucion --> Usuario
  Devolucion "1" --> "1..*" ItemDevolucion : items
  ItemDevolucion --> Variante
```

---

## Grupo 5 — Pedidos Online

Pedidos recibidos por TiendaNube, WhatsApp u otros canales digitales.

```mermaid
classDiagram

  class PedidoOnline {
    +Long id
    +String numeroPedido
    +FuentePedido fuente
    +String idExterno
    +Cliente cliente
    +LocalDateTime fecha
    +EstadoPedido estado
    +DatosEnvio datosEnvio
    +FormaPago formaPago
    +BigDecimal subtotal
    +BigDecimal costoEnvio
    +BigDecimal descuento
    +BigDecimal total
    +String observaciones
    +List~ItemPedido~ items
    +List~TrazabilidadPedido~ trazabilidad
  }

  class DatosEnvio {
    <<Embeddable>>
    +String nombreDestinatario
    +String telefono
    +String calle
    +String numero
    +String piso
    +String depto
    +String codigoPostal
    +String ciudad
    +String provincia
    +String empresa
    +String nroTracking
  }

  class ItemPedido {
    +Long id
    +PedidoOnline pedido
    +Variante variante
    +Integer cantidad
    +BigDecimal precioUnitario
    +BigDecimal subtotal
  }

  class TrazabilidadPedido {
    +Long id
    +PedidoOnline pedido
    +EstadoPedido estadoAnterior
    +EstadoPedido estadoNuevo
    +LocalDateTime fecha
    +Usuario cambiadoPor
    +String nota
  }

  class EstadoPedido {
    <<enumeration>>
    NUEVO
    CONFIRMADO
    EN_PREPARACION
    LISTO_PARA_ENVIO
    ENVIADO
    ENTREGADO
    CANCELADO
    CON_PROBLEMA
  }

  class FuentePedido {
    <<enumeration>>
    TIENDANUBE
    WHATSAPP
    INSTAGRAM
    TELEFONO
    OTRO
  }

  PedidoOnline --> EstadoPedido
  PedidoOnline --> FuentePedido
  PedidoOnline --> FormaPago
  PedidoOnline --> Cliente
  PedidoOnline *-- DatosEnvio : embebido
  PedidoOnline "1" --> "1..*" ItemPedido : items
  PedidoOnline "1" --> "0..*" TrazabilidadPedido : trazabilidad
  ItemPedido --> Variante
  TrazabilidadPedido --> Usuario
```

---

## Mapa General de Relaciones

Vista de alto nivel de cómo se conectan los 5 grupos.

```mermaid
classDiagram

  class Catalogo {
    Categoria
    Producto
    Variante
    Atributo
    Oferta
  }

  class Personas {
    Usuario
    Cliente
  }

  class CajaYVentas {
    Caja
    Venta
    MovimientoCaja
    ItemVenta
  }

  class Devoluciones {
    Devolucion
    ItemDevolucion
  }

  class PedidosOnline {
    PedidoOnline
    ItemPedido
    TrazabilidadPedido
    DatosEnvio
  }

  Catalogo <-- CajaYVentas : ItemVenta.variante
  Catalogo <-- PedidosOnline : ItemPedido.variante
  Catalogo <-- Devoluciones : ItemDevolucion.variante
  Personas <-- CajaYVentas : Venta.cliente / Caja.vendedor
  Personas <-- PedidosOnline : PedidoOnline.cliente
  Personas <-- Devoluciones : Devolucion.cliente / procesadoPor
  CajaYVentas <-- Devoluciones : Devolucion.ventaOriginal
```

---

## Notas de Implementación

### Prioridad de desarrollo sugerida

1. **Enums** — sin dependencias, ir primero
2. **Catálogo** — Categoria → Atributo → ValorAtributo → Producto → Variante → Oferta
3. **Personas** — Usuario → Cliente → DireccionCliente
4. **Caja y Ventas** — Caja → MovimientoCaja → Venta → ItemVenta
5. **Devoluciones** — Devolucion → ItemDevolucion
6. **Pedidos Online** — PedidoOnline → ItemPedido → TrazabilidadPedido

### Convenciones Java/JPA

- Usar `BigDecimal` para todos los campos monetarios (nunca `double`)
- `DatosEnvio` va como `@Embeddable` dentro de `PedidoOnline` (misma tabla)
- Colecciones: `@OneToMany(mappedBy = ..., cascade = CascadeType.ALL, orphanRemoval = true)`
- Borrado lógico: campo `activo / Boolean` en Producto, Variante, Usuario, Cliente
- Timestamps: `LocalDateTime` con `@CreatedDate` / `@LastModifiedDate` de Spring Data
- Todos los `@ManyToOne` son `FetchType.LAZY` por defecto
