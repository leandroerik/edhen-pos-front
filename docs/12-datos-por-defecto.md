# Documento 12: Datos Semilla y Configuración por Defecto (EDHEN)

Este documento especifica la información base y los datos de prueba oficiales precargados en el sistema para la tienda de indumentaria **EDHEN**.

---

## 1. Vendedores del Local y Canales de Venta

### Vendedores Oficiales:
| Vendedor | Rol / Canal Habitual |
|---|---|
| **Celeste** | Venta mostrador local físico / Atención al cliente |
| **Norma** | Venta mostrador local físico / Caja |
| **Erik** | Ventas mayoristas / Tienda Web y logística |
| **Noelia** | Atención pedidos WhatsApp / Showrooms |
| **Mostrador (Anónimo)** | Operaciones rápidas sin vendedor asignado |

### Canales de Venta:
- **`LOCAL_FISICO`**: Cobro inmediato en el mostrador del local comercial.
- **`WHATSAPP`**: Pedidos acordados por chat con reserva de stock y seña.
- **`WEB`**: Compras online con despacho y seguimiento de envíos.
- **`TELEFONO`** / **`MARKETPLACE`**: Canales complementarios.

---

## 2. Tipos de Clientes

| Tipo de Cliente | Descripción | Ejemplo Semilla |
|---|---|---|
| **`MINORISTA`** | Compradores individuales de mostrador o compras web. | **Valentina Gómez** (Palermo, CABA)<br>**Lucía Méndez** (La Plata)<br>**Camila Fernández** (Recoleta) |
| **`MAYORISTA`** | Clientes con compras en cantidad / curva de talles para reventa en provincias. | **Sofía Benítez** (Showroom Córdoba Capital - CUIT/DNI registrado) |
| **`CONSUMIDOR FINAL`** | Venta express de paso sin registro de datos personales. | Cliente genérico / Mostrador |

---

## 3. Catálogo de Indumentaria y Telas Principales

### A. Remeras y Tops de Morley (`Remeras y Tops de Morley`)
- **Remera Morley Ribb Escote V**: $14.500 (Morley elastizado manga corta, suave al tacto y corte entallado).
- **Musculosa Morley Básica Bretel Ancho**: $12.500 (Morley canalé acanalado elastizado).
- **Vestido Morley Midi con Abertura**: $24.500 (Vestido largo midi al cuerpo).

### B. Pantalones y Sweaters de Dralón (`Pantalones de Dralón` / `Sweaters y Abrigos`)
- **Pantalón Dralón Palazzo Premium**: $28.500 (Tejido dralón suave con caída pesada y elástico en cintura).
- **Pantalón Dralón Wide Leg con Pinzas**: $29.900 (Dralón de invierno abrigado con pinzas frontales).
- **Sweater Dralón Escote Redondo Oversize**: $32.000 (Tejido dralón punto fino y mangas amplias).

---

## 4. Curva de Talles Oficial

### Talles Superiores / Letras (`ROPA_SUPERIOR` / `UNICO`):
- `S` (Orden 1)
- `M` (Orden 2)
- `L` (Orden 3)
- `XL` (Orden 4)
- `XXL` (Orden 5)
- `Único` (Orden 6)

### Talles Inferiores / Numéricos (`ROPA_INFERIOR`):
- `38` (Orden 1)
- `39` (Orden 2)
- `40` (Orden 3)
- `41` (Orden 4)
- `42` (Orden 5)
- `43` (Orden 6)
- `44` (Orden 7)
- `45` (Orden 8)

---

## 5. Paleta de Colores Básicos y Tendencia

| Color | Código Hex | Uso Típico |
|---|---|---|
| **Negro** | `#111827` | Básico infaltable en todas las prendas |
| **Blanco** | `#F9FAFB` | Musculosas, remeras y tops |
| **Azul Marino** | `#1E3A8A` | Pantalones wide leg y sweaters |
| **Celeste** | `#93C5FD` | Remeras morley y camisas |
| **Bordó** | `#800020` | Vestidos midi y remeras |
| **Beige** | `#D4B996` | Remeras de morley y sweaters |
| **Camel** | `#C19A6B` | Sweaters de dralón y palazzos |
| **Arena** | `#E2D5C3` | Pantalones y musculosas |
| **Terracota** | `#C25941` | Remeras y vestidos de temporada |
| **Chocolate** | `#5B3A29` | Palazzos y remeras morley |
| **Dulce de Leche** | `#9A6B43` | Sweaters y musculosas |
| **Verde Oliva** | `#556B2F` | Pantalones palazzo y joggers |
| **Gris Melange** | `#9CA3AF` | Pantalones wide leg y remeras |
| **Rosa Pastel** | `#F4C2C2` | Sweaters oversize y tops |
| **Lila** | `#A78BFA` | Remeras y tops de verano |

---

## 6. Operaciones y Motivos de Movimientos de Stock

Toda alteración en el inventario registra su respectivo motivo (con soporte de motivos opcionales inteligentes):

1. **Reposición de Stock (+)**:
   - *Reposición de taller / confección*
   - *Ingreso de proveedor*
   - *Devolución a stock*
   - *Ajuste positivo por recuento físico*

2. **Ropa Fallada / Merma (−)**:
   - *Falla de confección / costura*
   - *Tela fallada / agujero de tejeduría*
   - *Mancha / desteñido*
   - *Rotura / enganche en local*
   - *Pérdida / faltante*

3. **Ventas y Reservas**:
   - *Venta mostrador* (descuento físico)
   - *Reserva de pedido online / WhatsApp* (reserva de stock)
