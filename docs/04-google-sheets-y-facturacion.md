# Sistema de Stock y Ventas — Documento 4: Google Sheets y Facturación

## PARTE A — Sincronización con Google Sheets

### 1. Objetivo
Que la dueña/vendedoras puedan consultar el stock actual desde el celular (Google Sheets abre rápido, no requiere instalar nada) sin tener que entrar al sistema. **El sistema local es siempre la fuente de verdad**; Sheets es un espejo de solo lectura (al menos en la primera versión).

### 2. Cómo se arma (paso a paso)

1. **Crear un proyecto en Google Cloud Console** (gratis): [console.cloud.google.com](https://console.cloud.google.com)
2. Habilitar la **Google Sheets API** para ese proyecto
3. Crear una **Service Account** (cuenta de servicio) — es un "usuario robot" que la app va a usar para escribir en el Sheet
4. Generar una **clave JSON** de esa Service Account y descargarla (este archivo va a vivir en el backend, nunca se sube a git)
5. Crear el Google Sheet manualmente (con las columnas que quieras: Producto, Talle, Color, SKU, Cantidad, Precio)
6. **Compartir ese Sheet** con el email de la Service Account (algo como `sheets-sync@tu-proyecto.iam.gserviceaccount.com`), dándole permiso de Editor
7. Guardar el `spreadsheet_id` (se ve en la URL del Sheet) en la tabla `ConfiguracionSync`

### 3. Cuota gratuita
La API de Sheets tiene un límite de **300 requests por minuto por proyecto** y **60 por minuto por usuario** en el tier gratuito — para un local esto sobra por muchísimo margen, incluso sincronizando después de cada venta.

### 4. Cuándo se sincroniza
Dos disparadores, para que nunca se desactualice:

- **Trigger inmediato**: cada vez que se completa una venta o se hace un ajuste de stock, se dispara una sincronización asincrónica de esa/s variante/s puntuales (no hace falta reescribir todo el sheet)
- **Trigger de respaldo**: un `@Scheduled` cada 15-30 minutos que sincroniza todo el stock completo, por si algún evento puntual falló (ej: sin internet en ese momento)
- **Botón manual**: "Sincronizar ahora" en el panel de admin, para forzarlo cuando se quiera

### 5. Diseño técnico en Spring Boot

```java
@Service
public class SheetsSyncService {

    private final Sheets sheetsClient; // configurado con la Service Account

    @Async
    public void sincronizarVariante(VarianteProducto variante) {
        // actualiza la fila correspondiente en el Sheet (por SKU)
    }

    @Scheduled(fixedRate = 900_000) // cada 15 min
    public void sincronizacionCompleta() {
        // reescribe todo el rango de stock
    }
}
```

Puntos clave de diseño:
- Usar `@Async` para que la sync **nunca bloquee** la respuesta al usuario que está vendiendo
- Loguear errores en `ConfiguracionSync.ultimo_error` y reintentar en el próximo ciclo programado — nunca hacer fallar una venta porque Sheets no respondió
- Mapear cada `VarianteProducto.sku` a una fila fija del Sheet (buscar por SKU y actualizar esa fila, no reescribir todo el rango en cada venta, así es más rápido)

### 6. Librería a usar
`com.google.apis:google-api-services-sheets` + `com.google.auth:google-auth-library-oauth2-http` (ambas gratuitas, se agregan como dependencia Maven/Gradle).

### 7. Evolución futura (opcional)
Si en algún momento querés que Sheets sea editable y la app "escuche" cambios manuales (por ejemplo la dueña corrige una cantidad a mano), se puede agregar sincronización bidireccional comparando `ultima_actualizacion`. **No lo recomiendo para la v1** — agrega complejidad y riesgo de conflictos (dos fuentes de verdad). Mejor: Sheets de solo lectura, y todo cambio real se hace en la app.

---

## PARTE B — Facturación: de interna a fiscal (ARCA/AFIP)

### 1. Fase 1 — Comprobante interno (arrancamos por acá)

No tiene validez fiscal, es solo para control interno y para dárselo al cliente como respaldo de la compra:

- Numeración propia (ej: `TICKET-00001`)
- Se genera en PDF con **OpenPDF** al completar la venta
- Incluye: fecha, ítems, cantidades, precios, forma de pago, total, y una leyenda tipo "Comprobante no válido como factura"
- Esto te permite tener **todo el sistema de ventas funcionando ya**, sin bloquear el proyecto por el trámite de habilitación fiscal

### 2. Fase 2 — Facturación electrónica real

Cuando quieras dar el salto a factura legal con CAE, esto es lo que se necesita (organizativo primero, técnico después):

**Requisitos organizativos (esto lo hace la dueña del local, no el sistema):**
1. Estar inscripta en AFIP/ARCA (Monotributo o Responsable Inscripto)
2. Generar un **Certificado Digital** desde el sitio de ARCA (gratis) — es un archivo `.crt`/`.key` que identifica al comercio ante el web service
3. Dar de alta el servicio **"Facturación Electrónica" (WSFE)** en el "Administrador de Relaciones de Clave Fiscal"

**Requisitos técnicos (esto lo hacemos en el sistema):**
1. **WSAA** (Web Service de Autenticación y Autorización): con el certificado, se pide un "ticket de acceso" (token + firma) que dura 12 horas
2. **WSFEv1** (Web Service de Facturación): con ese ticket, se envía la venta (tipo de comprobante, monto, CUIT del cliente si corresponde, etc.) y ARCA devuelve un **CAE** (Código de Autorización Electrónico) — eso es lo que hace que la factura sea legalmente válida
3. Ambos son servicios **SOAP** — en Java se consumen con `JAX-WS` (viene en el JDK vía librerías externas en versiones nuevas) o con un cliente SOAP como `Apache CXF` (gratis)
4. ARCA tiene un **ambiente de homologación** (testing, gratis, sin validez real) donde podés probar todo el flujo antes de pasar a producción

**Flujo resumido de una venta con factura fiscal:**
```
Venta completada
   → FacturacionService pide ticket WSAA (si no tiene uno vigente)
   → arma el request WSFEv1 con los datos de la venta
   → ARCA responde con CAE + fecha de vencimiento del CAE
   → se guarda en Comprobante (cae, cae_vencimiento)
   → se genera el PDF de la factura con esos datos (formato oficial: A, B o C según corresponda)
```

**Recomendación de implementación:** armar el `FacturacionService` con una interfaz (`ComprobanteProvider`) que hoy tiene una implementación `ComprobanteInternoProvider` (fase 1) y mañana se agrega `ComprobanteArcaProvider` (fase 2), sin tocar el resto del sistema. Así el proyecto no se frena esperando el trámite fiscal.

```java
public interface ComprobanteProvider {
    Comprobante emitir(Venta venta);
}

@Service
@ConditionalOnProperty(name = "facturacion.modo", havingValue = "interno", matchIfMissing = true)
public class ComprobanteInternoProvider implements ComprobanteProvider { ... }

@Service
@ConditionalOnProperty(name = "facturacion.modo", havingValue = "arca")
public class ComprobanteArcaProvider implements ComprobanteProvider { ... }
```

Con esto, pasar de fase 1 a fase 2 es cambiar una propiedad en `application.properties` (`facturacion.modo=arca`), no reescribir el sistema.

### 3. Alternativa si en el futuro no querés lidiar con SOAP directo
Existen wrappers open source de la comunidad (no oficiales de ARCA) que simplifican el consumo de WSFEv1 en distintos lenguajes. Los evaluamos llegado el momento — para la v1 del proyecto no hace falta, nos enfocamos en tener el sistema de ventas y stock funcionando primero.

## 4. Próximo documento

En el **Documento 5**, el plan de implementación paso a paso (sprints), para que sepas por dónde arrancar a codear conmigo.
