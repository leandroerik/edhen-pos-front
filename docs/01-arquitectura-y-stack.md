# Sistema de Stock y Ventas — Documento 1: Arquitectura y Stack

## 1. Visión general

Sistema para un local de venta de ropa femenina que permite:
- Controlar stock por producto y variante (talle/color)
- Registrar ventas (punto de venta simple, tipo POS)
- Emitir comprobantes (internos primero, fiscales AFIP/ARCA después)
- Sincronizar el stock con Google Sheets, para que se pueda consultar desde el celular sin abrir la app
- Manejar casos especiales del rubro: cambios, devoluciones, promociones, cuenta corriente, cierre de caja

Requisitos no funcionales clave:
- **100% gratis** (sin licencias pagas, sin SaaS de pago)
- **Corre localmente** (en la PC del local, sin depender de internet para vender)
- **Performante** (respuesta instantánea en el mostrador, aunque sea 1-2 usuarios concurrentes)
- Internet solo se necesita para sincronizar con Sheets y para facturación electrónica (todo lo demás funciona offline)

## 2. Stack recomendado (elegido en base a que ya sabés Java + algo de React)

| Capa | Tecnología | Por qué |
|---|---|---|
| Backend | **Java 21 + Spring Boot 3** | Ya lo conocés, es gratis, muy performante, ecosistema maduro |
| Base de datos | **PostgreSQL 16** (via Docker) | Gratis, robusta, soporta bien concurrencia, fácil de respaldar |
| ORM | **Spring Data JPA + Hibernate** | Estándar de facto en Spring |
| Frontend | **React 18 + Vite + TypeScript** | Rápido de desarrollar, vos ya tenés base |
| Estilos UI | **TailwindCSS** (+ opcional shadcn/ui) | Gratis, rápido de armar pantallas prolijas |
| Autenticación | **Spring Security + JWT** | Simple, alcanza para 2-3 roles (admin/cajero) |
| PDF (tickets/facturas) | **OpenPDF** (fork libre de iText, LGPL) | Genera comprobantes en PDF sin costo |
| Sync Google Sheets | **Google Sheets API v4** (Service Account) | Cuota gratuita más que suficiente para un local |
| Facturación fiscal (fase 2) | **WSFEv1 de ARCA (ex AFIP)** vía SOAP | Es el servicio oficial y gratuito para pedir CAE |
| Empaquetado | **Spring Boot ejecuta el JAR y sirve el build de React como estático** | Un solo proceso, un solo `java -jar app.jar`, corre en `localhost:8080` |
| Contenedores (opcional) | **Docker Compose** para Postgres | Instalación en 1 comando, no ensucia el sistema operativo |

### Decisión final: repos separados (edhen-pos-front / edhen-pos-back)
En vez de un solo JAR, el proyecto se organiza en dos repositorios independientes:

- **edhen-pos-back**: Spring Boot como API REST pura (sin servir frontend). Corre en un puerto propio (ej. `8080`)
- **edhen-pos-front**: React + Vite, corre en su propio proceso (ej. `5173` en desarrollo). En producción se compila a estáticos y se sirve con cualquier servidor liviano (nginx, o incluso `serve` de Node) apuntando al backend por variable de entorno

Implicancias a tener en cuenta:

| Tema | Cómo se resuelve |
|---|---|
| CORS | El backend habilita explícitamente el origen del frontend (`http://localhost:5173` en dev) vía `@CrossOrigin` o una `WebMvcConfigurer` global |
| URL del backend en el frontend | Variable de entorno `VITE_API_URL`, nunca hardcodeada |
| Correr todo junto en desarrollo | Dos terminales (o dos tabs en VS Code): una con `./mvnw spring-boot:run` en el back, otra con `npm run dev` en el front |
| Acceso desde el celu de la vendedora en el local | El front tiene que apuntar a la IP local de la PC (`http://192.168.x.x:8080`) en `VITE_API_URL`, y el backend debe permitir ese origen en CORS |
| Contrato de API | El Documento 3 (funcionalidades) es la fuente de verdad de los endpoints — mantenerlo actualizado en ambos repos evita desincronización |

Se pierde la simplicidad de "un solo ejecutable", pero se gana: los dos equipos/partes evolucionan a ritmos distintos, el frontend se puede desplegar aparte (ej. Vercel/Netlify gratis si en el futuro lo necesitás fuera del local), y el backend queda limpio como API reusable (por ejemplo, el día de mañana una app mobile podría consumir la misma API).

## 3. Arquitectura en capas (backend)

```
┌─────────────────────────────────────────┐
│  Frontend (React) — sirve como estático  │
└───────────────────┬───────────────────────┘
                     │ REST/JSON
┌────────────────────▼──────────────────────┐
│  Controller (Spring @RestController)       │
│  - ProductoController, VentaController...  │
├─────────────────────────────────────────────┤
│  Service (lógica de negocio)                │
│  - VentaService, StockService,              │
│    SheetsSyncService, FacturacionService     │
├─────────────────────────────────────────────┤
│  Repository (Spring Data JPA)                │
├─────────────────────────────────────────────┤
│  PostgreSQL                                  │
└───────────────────────────────────────────────┘
        │                         │
        ▼                         ▼
 Google Sheets API          ARCA/AFIP WSFEv1
 (sync de stock)            (fase 2, facturación)
```

Patrón sugerido: **capas clásicas de Spring** (Controller → Service → Repository), nada de sobre-ingeniería (no hace falta microservicios ni hexagonal para esto). Un monolito bien organizado por paquetes:

```
com.tulocal.stock
 ├── producto
 │    ├── Producto.java (entidad)
 │    ├── VarianteProducto.java
 │    ├── ProductoRepository.java
 │    ├── ProductoService.java
 │    └── ProductoController.java
 ├── stock
 ├── venta
 ├── cliente
 ├── facturacion
 ├── sync
 └── config
```

## 4. Requisitos de infraestructura (todo gratis)

1. **Java 21 (JDK)** — gratis (Eclipse Temurin / Adoptium)
2. **Docker Desktop** — gratis para uso individual/pequeñas empresas (o instalar Postgres directo si preferís no usar Docker)
3. **Node.js LTS** — para compilar el frontend
4. **Cuenta de Google Cloud** — gratis, solo para crear una Service Account que use la API de Sheets (no se paga nada dentro de la cuota gratuita, que es generosísima para un local)
5. **Cuenta en ARCA (ex AFIP)** con Clave Fiscal — necesaria más adelante para la fase de facturación fiscal (esto ya lo debe tener el local si está inscripto)

## 5. Performance: por qué esto alcanza y sobra

Un local de ropa no tiene un volumen de datos ni de concurrencia que justifique nada más pesado:
- Postgres local maneja sin esfuerzo decenas de miles de productos/variantes y ventas
- Spring Boot responde en milisegundos para este volumen
- El cuello de botella real, si existe, va a ser la sincronización con Sheets (que es asincrónica, no bloquea la venta) y el pedido de CAE a ARCA (también asincrónico o al cierre de la venta)

**Regla de oro que vamos a aplicar:** la venta se registra siempre en la base local al instante. La sincronización con Sheets y la facturación fiscal se hacen "en segundo plano" o con reintentos, para que un problema de internet nunca frene una venta en el mostrador.

## 6. Próximo documento

En el **Documento 2 (modelo de datos)** vemos las entidades, relaciones y el diccionario de datos completo, pensado específicamente para indumbentaria (talles, colores, variantes).
