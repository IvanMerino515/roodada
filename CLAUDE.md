@AGENTS.md

# Roodada

Guía de compra de bicicletas: una guía de preguntas (`/guia`) que recomienda bicis de la base de Supabase, y un comparador (`/comparador`, `/comparativa`). MVP: solo guiamos; las salidas a tienda pasan por `/ir/[slug]` para poder afiliar en fase 2.

- Arquitectura de la información: `docs/architecture/` (exportada de Office). Las rutas reales del MVP y cómo decide el recomendador: `docs/RECOMENDADOR.md`. Si cambias rutas, actualiza también la arquitectura en Office.
- Datos: Supabase `recomendador_bicicletas` (tablas `variants`, `variant_sizes`, `variant_components`, vista `variant_listing`). La web solo lee, con anon key y RLS.
- Recomendador: `src/lib/recommender/`, funciones puras con tests (`npm test`). Un dato ausente puntúa neutro y baja la confianza; nunca se inventa.
- Análisis: `npm run analysis` (rol de solo lectura, `ANALYSIS_DATABASE_URL`) genera `docs/data/ANALISIS-bruto.md`.
- Verificación: `npm run typecheck`, `npm test`, `npm run build`. No abrir el navegador para verificar: Iván revisa lo visual en las previews de Vercel.
- Gestor de paquetes: npm.
- Next.js 16 con Cache Components: los datos se cargan con `'use cache'` + `cacheLife` (`src/lib/catalog/load.ts`); `params`/`searchParams` son promesas y lo que depende de ellos va dentro de `<Suspense>`.
- Tailwind usa la escala del sistema de diseño: `--spacing` es 8 px, así que `p-1` = 8 px y `w-20` = 160 px.

## Sistema de diseño

Este proyecto usa el sistema de diseño de Roodada (carpeta `design-system/`, generada desde Office).
Para cualquier trabajo de interfaz sigue `design-system/DESIGN.md`: usa los componentes de `design-system/react` y los tokens `--ds-*` o las utilidades del tema de Tailwind. No inventes colores, tamaños, radios ni sombras, y no edites los ficheros de `design-system/` a mano.
