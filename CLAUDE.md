# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at localhost:3000 (proxies API to localhost:8080)
npm run build    # Production build
npm test         # Jest + React Testing Library (watch mode)
npm test -- --watchAll=false          # Single run (CI)
npm test -- --testPathPattern=<file>  # Run one test file
```

No dedicated lint script — ESLint runs implicitly through `react-scripts`.

---

## Stack & Key Libraries

- **React 18**, React Router v6, Bootstrap 5 + CSS Modules (Tailwind installed but barely used — prefer Bootstrap)
- **Icons:** FontAwesome Free 7 via class strings (`fa fa-*`). No icon components.
- **Notifications:** `react-hot-toast` — use `toast` from `react-hot-toast`, never `react-toastify`
- **PDF / Barcodes:** `jspdf` + `html2canvas` for tickets; `react-barcode` for EAN-13
- **Backend (pending):** Spring Boot at `localhost:8080`. Everything is currently mocked — no real API calls.

---

## Auth & Roles

`src/context/AuthContext.js` — hardcoded default user, no real login. Two roles:
- `admin` — full access
- `vendedor` — only Ventas (tienda, historial), Devoluciones, Mi Perfil

`useAuth()` exposes: `user`, `isAuthenticated`, `isAdmin`, `isVendedor`, `canAccess(resource)`, `permissions`.

---

## Routing & Route Protection

All routes in `src/App.js` use:

```jsx
<ProtectedRoute allowedRoles={['admin']}>
  <MyPage />
</ProtectedRoute>
```

Unauthorized users are redirected to `/ventas/tienda`.

**Adding a route requires two changes:**
1. A `<Route>` entry in `App.js`
2. An entry in `src/shared/components/Navbar/menuConfig.js` (`MENU_ITEMS`) — the sidebar is auto-generated from this array, filtered by role.

---

## Module Structure

Each module under `src/modules/` is self-contained:

```
src/modules/{name}/
├── index.jsx               # Barrel export
├── {Name}.jsx              # Root component
├── components/             # Module-specific components
├── pages/                  # Sub-pages matched by App.js routes
├── hooks/                  # Custom hooks (e.g., useProducts)
├── services/               # Module-owned service (e.g., cajasService.js)
└── utils/                  # Constants & config (e.g., ventasConfig.js)
```

Avoid cross-module imports. Shared UI goes in `src/shared/components/`.

**Modules:**

| Module | Description |
|---|---|
| `dashboard/` | Stats cards, hourly/weekly sales chart, activity feed |
| `catalogo/{categorias,productos,atributos,ofertas}/` | Catalog CRUD with variant + barcode support |
| `ventas/{tienda,historial,internet,devoluciones}/` | Sales TPV, history, returns |
| `ventaOnline/` | Online order lifecycle + shipping workflow |
| `cajas/` | Cash register open/close, movements, arqueo |
| `clientes/` | Customer CRUD with address management |
| `vendedores/` | Salesperson CRUD |
| `configuracion/` | Settings: empresa, impuestos, pagos, integraciones, Google Sheets, parámetros, backup |
| `informes/` | Reports — all pages are stubs (`<EnDesarrollo />`) |

---

## Service Pattern

All services expose a uniform async interface:

```js
export const myService = {
  listar: async () => { ... },
  obtener: async (id) => { ... },
  crear: async (payload) => { ... },
  actualizar: async (id, payload) => { ... },
  eliminar: async (id) => { ... },
};
```

**Mock layer:** data lives in `src/services/mocks/index.js` as module-level arrays. Mutations survive navigation but reset on page reload. Services add 300–800ms artificial delays.

**Central re-exports:** `src/services/api.js` re-exports all domain services.

**Module-specific services** (e.g. `src/modules/cajas/services/cajasService.js`) are separate from the central mock registry.

**`localStorage` keys in use:**

| Key | Owner |
|---|---|
| `user` | AuthContext |
| `tiendaNubeConfig` | adminService |
| `googleSheetsConfig` | googleSheetsService |
| `googleSheetsSyncLog` | googleSheetsService |
| `edhenParametros` | Parametros config page |

---

## TPV (Point of Sale)

`src/shared/components/TPV/TPVBase.jsx` is the core POS, reused for in-store and online via `isOnline` prop:

- **`isOnline=false`:** renders cart sidebar, prints tickets, calls `cajasService.registrarMovimiento()`
- **`isOnline=true`:** renders shipping form + online order sidebar, calls `onProcessSale` callback

Cart persists to `localStorage` via `TPVUtils.js`. Variant cart item IDs: `"productoId|varianteId"` (e.g. `"1|Blanco-S"`).

---

## Product & Variant Data Model

```js
{
  id: 1,
  nombre: 'Remera de Algodón',
  sku: 'RMA-001',
  precioVenta: 299.00,
  stock: 35,                         // total across all variants
  tieneVariantes: true,
  atributosAplicables: ['Color', 'Talla'],
  valoresSeleccionados: { Color: ['Blanco', 'Negro'], Talla: ['S', 'M', 'L'] },
  variantes: [
    { id: 'Blanco-S', Color: 'Blanco', Talla: 'S', stock: 5 },
  ],
  codigoBarras: 'REMERA001'           // EAN-13
}
```

---

## Dashboard

`src/modules/dashboard/utils/dashboardConfig.js` — single source for all mock data (stats, chart, activities, alerts, quick-actions, categories). `usePanelStats` hook exposes `salesData` (weekly) and `todaySalesData` (hourly). `SalesChart` has an internal "Hoy / Semana" tab toggle.

---

## Styling Conventions

- Bootstrap 5 utilities + CSS Modules for component-scoped styles (`.module.css` next to the component).
- **Card headers:** `h6 fw-bold`, no `bg-light` (global CSS in `Dashboard.module.css` already sets card-header to `#ffffff`).
- **Colors:** Bootstrap semantic classes (`text-success`, `bg-primary`, etc.) — avoid hardcoded hex in JSX.
- **Hover lift:** a global rule in `Dashboard.module.css` applies `translateY(-2px)` to all `.card:hover`. Don't duplicate this per component.
- **QuickActions layout:** CSS Grid directly on card-body (6 equal columns desktop, 3×2 tablet). No Bootstrap columns inside.
- `:global()` in `.module.css` for overriding Bootstrap globals.

---

## Key Integrations (All Mocked)

| Integration | Service | Notes |
|---|---|---|
| Tienda Nube | `tiendaNubeService.js` | Real API structure; currently mocked |
| Google Sheets | `googleSheetsService.js` | Spreadsheet ID + per-entity tab config; sync mocked |
| Admin / Backup | `adminService.js` | DB export/import, empresa config, TN credentials |

Google Sheets flow: frontend collects Spreadsheet ID → backend (Spring Boot) authenticates via Service Account. Frontend never holds credentials.

---

## Not Yet Implemented

- Real backend (Spring Boot) — all services are mocked
- Real authentication — user is hardcoded in AuthContext
- All `/informes/*` pages — render `<EnDesarrollo />`
- `/configuracion/importar/devoluciones` and `/configuracion/importar/clientes`
- Módulo Envíos (OCA, Andreani) — routes exist as stubs
- Google Sheets auto-sync scheduling (backend required)
