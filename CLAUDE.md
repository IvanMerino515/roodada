@AGENTS.md

# Roodada

Guía de compra de bicicletas: una guía de preguntas (`/guia`) que recomienda bicis de la base de Supabase, y un comparador (`/comparador`, `/comparativa`). MVP: solo guiamos; las salidas a tienda pasan por `/ir/[slug]` para poder afiliar en fase 2.

- Arquitectura de la información: `docs/architecture/` (exportada de Office). Las rutas reales del MVP y cómo decide el recomendador: `docs/RECOMENDADOR.md`. Si cambias rutas, actualiza también la arquitectura en Office.
- Datos: Supabase `recomendador_bicicletas` (tablas `variants`, `variant_sizes`, `variant_components`, vista `variant_listing`). La web solo lee, con anon key y RLS.
- Recomendador: `src/lib/recommender/`, funciones puras con tests (`npm test`). Un dato ausente puntúa neutro y baja la confianza; nunca se inventa.
- Análisis: `npm run analysis` (rol de solo lectura, `ANALYSIS_DATABASE_URL`) genera `docs/data/ANALISIS-bruto.md`.
- Modo prueba: con `ROODADA_MODO_PRUEBA=1` (variable de Vercel) la web no se indexa (cabecera `X-Robots-Tag`, meta robots y `robots.txt`). Quitarla el día del lanzamiento.
- Verificación: `npm run typecheck`, `npm test`, `npm run build`. No abrir el navegador para verificar: Iván revisa lo visual en las previews de Vercel.
- Gestor de paquetes: npm.
- Next.js 16 con Cache Components: los datos se cargan con `'use cache'` + `cacheLife` (`src/lib/catalog/load.ts`); `params`/`searchParams` son promesas y lo que depende de ellos va dentro de `<Suspense>`.
- Tailwind usa la escala del sistema de diseño: `--spacing` es 8 px, así que `p-1` = 8 px y `w-20` = 160 px.

## Sistema de diseño

Este proyecto usa el sistema de diseño de Roodada (carpeta `design-system/`, generada desde Office).
Del sistema se usan **solo colores y tipografías** (tokens `--ds-*` o utilidades del tema: `bg-bg`, `bg-surface`, `text-h2`…). No inventes colores ni tamaños de letra, y no edites los ficheros de `design-system/` a mano.

La composición es propia (decisión de Iván, 14-10-2026): retícula suiza (`.grid-swiss` 4/8/12 columnas, `.wrap`), filetes de 1 px, etiquetas `.eyebrow` en mayúsculas y botones `.btn` rectos, todo en `src/app/globals.css`. No se usan los componentes de `design-system/react` salvo `Icon`.

Skill `ui-ux-pro-max` (`.agents/skills/`, decisión de Iván, 14-10-2026): úsala solo para reglas de UX, accesibilidad, interacción y rendimiento. **No** apliques sus paletas, tipografías ni estilos (colores y letra salen solo del sistema de Office) y **nunca** uses `--persist`: escribiría en `design-system/`, que es el export de Office.

Correcciones de tokens (decisión de Iván, 14-10-2026): el bloque `:root` al principio de `globals.css` sobrescribe la escala tipográfica (el export la deja congelada), el tracking de los titulares, el tamaño de etiqueta, `text-muted` y el grosor de borde. Si se corrigen en Office y se reexporta, se borra ese bloque. El foco es un doble anillo (`:focus-visible`, `.focus-inset` para casillas pegadas, `.on-dark` sobre el vídeo). Referencias: catálogo en casillas lisas con una casilla de color que rompe la rejilla; ficha como etiqueta de producto (marco + filas etiqueta/valor). Casillas de bici en blanco sobre `bg`. Cada color, un solo significado: `accent` lo activo y la navegación; `choice` (coral, siempre con texto oscuro) lo tuyo: lo que eliges o lo que más te encaja; `surface` (amarillo) lo editorial.
