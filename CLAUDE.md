@AGENTS.md

# Roodada

Guía de compra de bicicletas: una guía de preguntas (`/guia`) que recomienda bicis de la base de Supabase, y un comparador (`/comparador`, `/comparativa`). MVP: solo guiamos; las salidas a tienda pasan por `/ir/[slug]` para poder afiliar en fase 2.

- Arquitectura de la información: `docs/architecture/` (exportada de Office). Las rutas reales del MVP y cómo decide el recomendador: `docs/RECOMENDADOR.md`. Si cambias rutas, actualiza también la arquitectura en Office.
- Datos: Supabase `recomendador_bicicletas` (tablas `variants`, `variant_sizes`, `variant_components`, vista `variant_listing`). La web solo lee, con anon key y RLS.
- Recomendador: `src/lib/recommender/`, funciones puras con tests (`npm test`). Un dato ausente puntúa neutro y baja la confianza; nunca se inventa.
- Análisis: `npm run analysis` (rol de solo lectura, `ANALYSIS_DATABASE_URL`) genera `docs/data/ANALISIS-bruto.md`.
- Modo prueba: con `ROODADA_MODO_PRUEBA=1` (variable de Vercel) la web no se indexa (cabecera `X-Robots-Tag`, meta robots y `robots.txt`). Quitarla el día del lanzamiento.
- Verificación: `npm run typecheck`, `npm test`, `npm run build`. No abrir el navegador para verificar: Iván revisa lo visual en las previews de Vercel.
- Dominio (24-11-2026): **https://roodada.com** en Vercel (DNS en IONOS: A @ → 216.198.79.1, CNAME www → Vercel). `www.roodada.com` redirige con 308 a `roodada.com`. `NEXT_PUBLIC_SITE_URL=https://roodada.com`. El modo prueba sigue activo hasta el lanzamiento.
- Gestor de paquetes: npm.
- Next.js 16 con Cache Components: los datos se cargan con `'use cache'` + `cacheLife` (`src/lib/catalog/load.ts`); `params`/`searchParams` son promesas y lo que depende de ellos va dentro de `<Suspense>`.
- Carga de datos (21-11-2026), cada página pide solo lo que usa: `getBike`/`getBikes` (ficha, `/ir`, comparativa) traen sus bicis sueltas y calculan la nota con `getCohortStats` (6 columnas de todas las bicis); `getCatalog({ sizes: false })` para el comparador; `getCatalog()` con tallas solo para recomendar (guía, contador, resultados, "Por qué es para ti") y la portada; `getSlugs` para sitemap y fichas del build. `buildBike` y `buildCatalog` dan la misma bici (prueba `buildBike.test.ts`). De `specs` se piden solo `SPEC_KEYS` (junto a `mapSpecs`): si lees un campo nuevo, añádelo ahí.
- Tailwind usa la escala del sistema de diseño: `--spacing` es 8 px, así que `p-1` = 8 px y `w-20` = 160 px.

## Sistema de diseño

Este proyecto usa el sistema de diseño de Roodada (carpeta `design-system/`, generada desde Office).
Del sistema se usan **solo colores y tipografías** (tokens `--ds-*` o utilidades del tema: `bg-bg`, `bg-surface`, `text-h2`…). No inventes colores ni tamaños de letra, y no edites los ficheros de `design-system/` a mano.

La composición es propia (decisión de Iván, 14-10-2026): retícula suiza (`.grid-swiss` 4/8/12 columnas, `.wrap`), filetes de 1 px, etiquetas `.eyebrow` en mayúsculas y botones `.btn` rectos, todo en `src/app/globals.css`. No se usan los componentes de `design-system/react` salvo `Icon`.

Skill `ui-ux-pro-max` (`.agents/skills/`, decisión de Iván, 14-10-2026): úsala solo para reglas de UX, accesibilidad, interacción y rendimiento. **No** apliques sus paletas, tipografías ni estilos (colores y letra salen solo del sistema de Office) y **nunca** uses `--persist`: escribiría en `design-system/`, que es el export de Office.

Correcciones de tokens (decisión de Iván, 14-10-2026): el bloque `:root` al principio de `globals.css` sobrescribe la escala tipográfica (el export la deja congelada); desde el 23-11-2026 la escala es un 15 % más pequeña (decisión de Iván: se veía demasiado saturado), con suelo de 12 px en etiquetas y 13 px en texto pequeño, el tracking de los titulares, el tamaño de etiqueta, `text-muted` y el grosor de borde. Si se corrigen en Office y se reexporta, se borra ese bloque. El foco es un doble anillo (`:focus-visible`, `.focus-inset` para casillas pegadas, `.on-dark` sobre el vídeo). Referencias: catálogo en casillas lisas con una casilla de color que rompe la rejilla; ficha como etiqueta de producto (marco + filas etiqueta/valor). Casillas de bici en blanco sobre `bg`. Cada color, un solo significado: `accent` lo activo y la navegación; `choice` (coral, siempre con texto oscuro) lo tuyo: lo que eliges o lo que más te encaja; `surface` (amarillo) lo editorial.

## Movimiento

Movimiento suave, no a saltos (decisión de Iván, 21-11-2026): `--ds-ease` se sobrescribe en el bloque de correcciones de `globals.css` con `cubic-bezier(0.2, 0.7, 0.2, 1)`; el export de Office trae `steps(4)`. Duraciones del sistema: 120, 200 y 320 ms. Las microinteracciones están al final de `globals.css` y todas se apagan con `prefers-reduced-motion`. Piezas: `NavProgress` (barra arriba al navegar), `LinkPending` (casilla pulsada, con `useLinkStatus`), `Skeletons` (huecos con la forma real y entrada del contenido con `ViewTransition`), `GuideMotion` (contador animado, check y embudo "Buscando tus bicis" con las cifras de `/api/contador`). La foto de la casilla "viaja" a la ficha con `ViewTransition name="foto-<id>"`; un nombre no puede repetirse en la misma página.

## Registro de actividad y afiliación

- Eventos de uso anónimos (23-11-2026): `src/lib/actividad/` (lista `EVENTOS`, validación, tramos de presupuesto y altura) → `POST /api/evento` → función `registrar_evento` de `supabase/sql/002_eventos.sql`. **Si añades un evento, añádelo en `EVENTOS` y en la lista de la función SQL.** Sin cookies ni almacenamiento: la visita es un número en memoria. `ActivityTracker` (layout) apunta páginas vistas y salidas a tienda; `TrackEvent` apunta un evento desde una página de servidor (con `key` para que se repita al cambiar de bici o de búsqueda). En desarrollo no se envía nada. Vistas para el panel: `v_eventos_dia`, `v_embudo_guia`, `v_bicis_actividad` (lectura con `roodada_lectura`).
- Afiliación: `/ir/[slug]` redirige a `offers.affiliate_url` si existe; si no, a la página de la tienda. Los botones de compra llevan `rel="sponsored nofollow noopener"` y la ficha muestra `AFFILIATE_NOTICE` (`src/lib/legal.ts`) solo cuando la oferta tiene enlace de afiliado. Textos legales pendientes de revisión por un abogado.

## Legal y cookies (25-11-2026)

- Titulares: Iván y Edgar, corresponsables (`TITULARES` y `CONTACTO` = info@roodada.com en `src/lib/legal.ts`). Páginas: `/aviso-legal` (con condiciones de uso), `/privacidad`, `/cookies` (lista de lo que se guarda) y `/transparencia` (cómo ordenamos y nos financiamos: si cambian la lógica del recomendador o los pesos, revisarla). Pendiente de revisión por un abogado.
- Aviso de cookies: `src/components/Consentimiento.tsx` + `src/lib/consentimiento.ts`. Aparece si hay ID de GA4: `G-ZR7CP7S1B2` en `src/lib/consentimiento.ts`, solo en compilaciones de producción (no en `next dev`). Aceptar y Rechazar iguales en la primera capa, sin capa que tape la página; «Preferencias de cookies» en el pie lo reabre. La decisión se guarda 12 meses (`roodada_consentimiento`). **Si se añade un servicio con cookies (píxel de Meta, vídeo incrustado…), añadirlo a `/cookies` y subir `VERSION` para volver a preguntar.**
- GA4 solo se carga tras aceptar, sin Google Signals ni anuncios, cookies de 13 meses y direcciones **sin parámetros** (llevan altura y presupuesto): las páginas vistas se mandan a mano en cada cambio de ruta. En GA4 hay que desactivar «Cambios de página basados en eventos del historial del navegador» y poner la retención en 2 meses.

## Seguridad (auditoría del 25-11-2026)

- Informe y plan: doc «Roodada · Auditoría de seguridad antes del lanzamiento» (https://claude.ai/artifact/ENptJoVJ9kCQL94GmDru8o).
- Fotos: la lista de webs permitidas está en `src/lib/fotosPermitidas.ts` (la usan el optimizador y la CSP). En dominios compartidos (Shopify, Google Cloud, Storyblok, BigCommerce, Widen, ffycdn) solo la ruta de la marca. **Al añadir una marca: `npx tsx --env-file=.env.local scripts/comprobar-fotos.mts`** dice qué falta. Las fotos de cascos (POC, Sweet, MET, Kask, vault.widen.net) no estaban permitidas antes ni ahora.
- Cabeceras en `next.config.ts`: CSP en modo **Report-Only** (avisos en los logs de Vercel como «csp:», vía `/api/csp`), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS con subdominios, sin X-Powered-By. Si añades un servicio externo, añade su dominio a la CSP. Pasar a `Content-Security-Policy` tras una semana sin avisos propios.
- `roodada-d4fa.vercel.app` redirige con 308 a roodada.com; las previews no.
- `/api/evento` solo acepta peticiones con Origin propio o `Sec-Fetch-Site: same-origin`.
- `supabase/sql/004_seguridad.sql`: quita a la clave pública las funciones de disparador, vistas del panel con `security_invoker` y, por defecto, las funciones nuevas no se abren a anon (hay que dar `grant execute` a mano a las que use la web).
- GitHub Actions (`.github/workflows/comprobar.yml`): typegen + typecheck, lint, tests y npm audit en cada pull request y subida a main. Dependabot semanal.

## Páginas de entrada (SEO)

- `/bicis` y `/bicis/<tipo>[/<subtipo>]` (también `/bicis/electricas[/<tipo>]`), `/marcas` y `/marcas/<marca>` (24-11-2026). Qué páginas existen y sus textos: `src/lib/landings.ts`; mínimo `MIN_BICIS` (5) bicis a la venta por página. Las marcas con menos de 5 tienen página pero `noindex`. Vista común: `LandingView` (resumen con cifras, mejores por calidad-precio, enlaces, preguntas con FAQPage, ItemList y migas en JSON-LD).
- Más páginas (25-11-2026): por precio `/bicis/<tipo>/menos-de-<€>` (clase `precio`, topes `TOPES_PRECIO`; solo si aportan: ≥5 bicis, menos que la madre y más que el tope anterior) y por marca y tipo `/marcas/<marca>/<tipo>` (`marcaTipoLandings`: ≥5 y no todas las de la marca). Cada `Landing` tiene `clase`; el menú y el índice solo muestran tipos y subtipos.
- Ficha: migas Bicis → tipo → marca, alternativas (`getAlternatives`: mismo tipo y eléctrica, ±25 % de precio, una por modelo) y preguntas (`src/lib/fichaPreguntas.ts`). Títulos, descripciones y JSON-LD en `src/lib/seo.ts`.
- Con Cache Components no se puede usar `dynamicParams`: una dirección inexistente devuelve 200 con la página de no encontrada (`noindex`).

## Protección frente al scraping (24-11-2026)

- Decisión de Iván: que buscadores e IA nos lean, citen y conozcan (también los bots de entrenamiento de OpenAI, Anthropic, Google, Apple), y frenar a quien quiera copiar el catálogo. `robots.txt` (`src/app/robots.ts`): todo abierto salvo extractores de datos (Bytespider, Diffbot…).
- Cortafuegos de Vercel (panel): límite por IP en las páginas y Bot Protection en modo desafío. La regla «AI Bots» NO se pone en bloquear.
- La base solo se consulta desde el servidor: variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`, sin `NEXT_PUBLIC_` (el código acepta aún los nombres antiguos mientras se cambian en Vercel).
- Aviso legal: uso de contenidos y derecho sui generis sobre la base de datos (LPI arts. 133–137), pendiente de revisión del abogado.
- Calculadora de talla `/talla-bicicleta` (24-11-2026): `src/lib/talla.ts` agrupa los ~260 nombres de talla en letras, centímetros, pulgadas u otra, y calcula con `fitSize` la talla en cada bici; `/api/talla` devuelve solo cifras agregadas (sin catálogo) y se guarda un día en la red de Vercel. La página lleva tablas por altura y preguntas calculadas con los datos.
- Menú principal (24-11-2026): `MainNav` con «Bicis» y «Marcas» (paneles a todo el ancho en escritorio, menú a pantalla completa con desplegables en móvil), Guía, Comparador y Tu talla. Datos de `buildMenu` (`landings.ts`), cargados en el layout desde la caché del catálogo. La cabecera tiene fondo en todas las páginas, también en la portada (decisión de Iván): la intro mide `100svh - 64px`.
- Redes (24-11-2026): la primera `pagina_vista` de cada visita guarda `utm_source/medium/campaign/content` (`utmDe`, limpias); evento `talla_calculada` en la calculadora; vista `v_visitas_origen` en `supabase/sql/003_origen_y_talla.sql` (hay que ejecutarlo en Supabase). Página de la bio `/enlaces` (`noindex`): fijos y `DESTACADOS` de la semana en `src/lib/enlaces.ts`.

