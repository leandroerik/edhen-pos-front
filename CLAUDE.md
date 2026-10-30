# CLAUDE.md — Guía Técnica para edhen-pos-front

Frontend SPA del sistema de punto de venta (edhen POS) para tienda de indumentaria.
Repo hermano: `edhen-pos-back` (API REST Spring Boot).

---

## 🚀 Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Levantar servidor de desarrollo (puerto 5173)
npm run dev

# Chequeo estricto de tipos TypeScript
npx tsc --noEmit

# Linting
npx eslint src/

# Compilación para producción
npm run build
```

---

## 🛠️ Stack Tecnológico

- **React 19** + **TypeScript** + **Vite 8**
- **TailwindCSS v4** para estilos utilitarios
- **React Router 7** para ruteo
- **Axios** para cliente HTTP con interceptores
- **Lucide Icons** para iconografía

---

## 🏛️ Convenciones de Arquitectura

1. **Organización por Feature (`src/features/<dominio>`)**:
   - `inicio/`: Dashboard principal y métricas rápidas.
   - `productos/`: Catálogo, formulario de creación con variantes, detalle y cola de impresión de etiquetas.
   - `ventas/`: Terminal POS con carrito dividido en 3 zonas fijas e historial de ventas.
   - `stock/`: Vista agrupada y plana de inventario con modal de ajuste.
   - `clientes/`: Listado y formulario de clientes mayoristas/minoristas y domicilios.
   - `envios/`: Panel logístico y detalle de despachos.
   - `reportes/`: Visualización de métricas y gráficos de ventas.
   - `configuracion/`: Gestión de Backups, Importación CSV y Datos de la tienda.

2. **Capa API Centralizada (`src/api/<dominio>.api.ts`)**:
   - Todo llamado HTTP se realiza mediante funciones exportadas en la capa API.
   - Nunca utilizar `axios`/`fetch` directamente dentro de un componente o hook.
   - La URL base se obtiene de `import.meta.env.VITE_API_URL` (por defecto `http://localhost:8080`).

3. **Tipos e Interfaces (`src/types/`)**:
   - Modelos compartidos (`Producto`, `Venta`, `Cliente`, `Variante`, etc.) reflejan exactamente los contratos del backend.

4. **Componentes Compartidos (`src/shared/`)**:
   - Componentes transversales (`Modal`, `ConfirmModal`, `EmptyState`, `ErrorBoundary`, `MainLayout`, `Sidebar`, `Button`, `Input`) residen en `src/shared/`.
   - Prohibido importar componentes de un feature desde otro feature directamente.
