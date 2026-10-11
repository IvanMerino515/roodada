@AGENTS.md

# Roodada

Guía de compra de bicicletas: una guía de preguntas (`/guia`) que recomienda bicis de la base de Supabase, y un comparador (`/comparador`, `/comparativa`). MVP: solo guiamos; las salidas a tienda pasan por `/ir/[id]` para poder afiliar en fase 2.

- Arquitectura de la información: `docs/architecture/` (exportada de Office). Las rutas reales del MVP están en la tabla de `docs/RECOMENDADOR.md` cuando exista; si cambias rutas, actualiza también la arquitectura en Office.
- Datos: Supabase `recomendador_bicicletas` (tablas `variants`, `variant_sizes`, `variant_components`, vista `variant_listing`). La web solo lee, con anon key y RLS.
- Recomendador: `src/lib/recommender/`, funciones puras con tests (`npm test`). Un dato ausente puntúa neutro y baja la confianza; nunca se inventa.
- Análisis: `npm run analysis` (rol de solo lectura, `ANALYSIS_DATABASE_URL`) genera `docs/data/ANALISIS-bruto.md`.
- Verificación: `npm run typecheck`, `npm test`, `npm run build`. No abrir el navegador para verificar: Iván revisa lo visual en las previews de Vercel.
- Gestor de paquetes: npm.
