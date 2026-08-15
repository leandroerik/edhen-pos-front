# edhen-pos-front

Frontend del sistema de punto de venta para tienda de ropa (edhen POS).
Repo hermano: edhen-pos-back (API REST separada, no está en este repo).

## Contexto del proyecto
Este frontend consume la API documentada en edhen-pos-back. El contrato de
endpoints está descripto en docs/03-funcionalidades-y-casos-especiales.md
(copiar esa carpeta docs/ a este repo también, o referenciarla como submódulo).

## Stack
- React 18 + Vite + TypeScript
- TailwindCSS para estilos
- react-router-dom para ruteo
- axios para llamadas HTTP

## Convenciones
- Organización por FEATURE (src/features/<dominio>), no por tipo de archivo
- Todo llamado HTTP pasa por src/api/<dominio>.api.ts, nunca fetch/axios
  directo dentro de un componente
- La URL del backend siempre sale de import.meta.env.VITE_API_URL, nunca
  hardcodeada
- Tipos compartidos (Producto, Venta, VarianteProducto, etc.) van en
  src/types/, reflejando exactamente las entidades del backend
- Componentes de un solo feature no se importan desde otro feature
  directamente — si hace falta compartir, se sube a src/shared/

## Estado actual
Ver plan de sprints. Sprint actual: Sprint 0 (setup + layout base).

## Backend
Corre en http://localhost:8080 en desarrollo (Spring Boot, repo aparte).
Asegurarse de que el backend tenga CORS habilitado para
http://localhost:5173 antes de probar integraciones.
