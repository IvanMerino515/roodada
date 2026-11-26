# Roodada · Documentación técnica

Cómo está hecha Roodada: piezas, datos, servidor y decisiones. Para el día a día (publicar, revisar, qué hacer si algo falla) ver [OPERACIONES.md](OPERACIONES.md).

Actualizado el 26-11-2026. Si cambias algo de lo que se describe aquí, actualiza este documento en el mismo commit.

## Índice

1. [Qué es y cómo encaja todo](#1-qué-es-y-cómo-encaja-todo)
2. [Tecnologías](#2-tecnologías)
3. [Estructura del código](#3-estructura-del-código)
4. [Páginas y rutas](#4-páginas-y-rutas)
5. [Datos (Supabase)](#5-datos-supabase)
6. [Cómo se cargan y se guardan en caché los datos](#6-cómo-se-cargan-y-se-guardan-en-caché-los-datos)
7. [Recomendador y nota calidad-precio](#7-recomendador-y-nota-calidad-precio)
8. [Servidor (VPS) y Cloudflare](#8-servidor-vps-y-cloudflare)
9. [Variables de entorno](#9-variables-de-entorno)
10. [Medición: registro propio, GA4 y cookies](#10-medición-registro-propio-ga4-y-cookies)
11. [Afiliación](#11-afiliación)
12. [SEO, robots e IndexNow](#12-seo-robots-e-indexnow)
13. [Seguridad](#13-seguridad)
14. [Sistema de diseño](#14-sistema-de-diseño)
15. [Pruebas y comprobaciones automáticas](#15-pruebas-y-comprobaciones-automáticas)
16. [Cuentas y accesos](#16-cuentas-y-accesos)
17. [Documentos relacionados](#17-documentos-relacionados)

---

## 1. Qué es y cómo encaja todo

Roodada es una guía para elegir bicicleta: una guía de preguntas que recomienda bicis (`/guia`), un comparador (`/comparador`, `/comparativa`), fichas de cada bici, páginas de entrada por tipo, precio y marca, y una calculadora de talla. Las salidas a tienda pasan por `/ir/<bici>` para medir clics y, cuando lo haya, usar el enlace de afiliado.

```
Visitante
   │  https://roodada.com
   ▼
Cloudflare (DNS, certificado, caché de fotos, protección)
   │
   ▼
VPS 217.76.133.242 · Nginx (HTTPS, límites por IP)
   │  127.0.0.1:3100
   ▼
Next.js (servicio «roodada», usuario «roodada», /srv/roodada/app)
   │  solo lectura con clave pública + 2 funciones de escritura
   ▼
Supabase · proyecto recomendador_bicicletas (Irlanda)
   ▲
   │  carga y actualiza el catálogo (scripts de Edgar)
Edgar
```

- **Edgar** extrae los datos de cada marca y los carga en Supabase.
- **La web** solo lee el catálogo. Escribe únicamente dos cosas anónimas a través de funciones: los clics de salida (`registrar_clic`) y los eventos de uso (`registrar_evento`).
- **Correo**: info@roodada.com en IONOS (no pasa por el VPS ni por Cloudflare, solo sus registros DNS están en Cloudflare).

## 2. Tecnologías

| Pieza | Qué se usa |
| --- | --- |
| Web | Next.js 16 (App Router, Cache Components, Turbopack), React 19, TypeScript |
| Estilos | Tailwind CSS 4 con los tokens del sistema de diseño de Office |
| Datos | Supabase (Postgres) con `@supabase/supabase-js`; validación con `zod` |
| Pruebas | Vitest |
| Servidor | VPS de IONOS (Ubuntu, 6 CPU, 8 GB), Node 22, Nginx 1.24, systemd |
| Delante | Cloudflare plan Free |
| Certificado | Let's Encrypt (certbot, renovación automática) |
| Medición | Registro propio en Supabase + Google Analytics 4 (solo con consentimiento) |
| Gestor de paquetes | npm |

Ojo: Next 16 cambia bastantes cosas respecto a versiones anteriores. Antes de tocar algo de Next, mira la guía que viene con el paquete en `node_modules/next/dist/docs/`.

## 3. Estructura del código

```
src/
  app/                  Páginas y rutas (una carpeta por dirección)
    api/                Rutas de API (contador, talla, evento, csp, indexnow)
    ir/[slug]/          Salida a tienda (redirección)
    layout.tsx          Cabecera, pie, aviso de cookies y medición
    globals.css         Composición propia: retícula, botones, movimiento
  components/           Piezas de interfaz (tarjetas, tablas, guía, menú…)
  lib/
    catalog/            Carga del catálogo desde Supabase y construcción de cada bici
    recommender/        Recomendador y nota calidad-precio (funciones puras con pruebas)
    actividad/          Registro anónimo de eventos (lista de eventos, validación)
    supabase/server.ts  Cliente de Supabase (solo servidor) y lectura por páginas
    landings.ts         Qué páginas de entrada existen y sus textos
    seo.ts              Títulos, descripciones y datos estructurados (JSON-LD)
    consentimiento.ts   Aviso de cookies: categorías, ID de GA4 y de Skimlinks
    fotosPermitidas.ts  Webs desde las que se pueden mostrar fotos
    legal.ts            Titulares, correo de contacto y aviso de afiliación
    indexnow.ts         Clave y envíos de IndexNow
    site.ts             ¿Se puede indexar esta web? (producción sí, previews no)
design-system/          Exportado desde Office. NO se edita a mano
docs/                   Esta documentación, arquitectura y análisis de datos
public/                 Imágenes, vídeo de la intro, clave de IndexNow, security.txt
scripts/
  vps/                  Publicar y gestionar el servidor (ver OPERACIONES.md)
  analysis/             Análisis de datos (npm run analysis)
  comprobar-fotos.mts   ¿Falta alguna web de fotos en la lista permitida?
  comprobar-catalogo.mts
supabase/sql/           SQL que se ejecuta a mano en Supabase (numerado)
.github/                Comprobaciones automáticas y Dependabot
CLAUDE.md               Notas para Claude Code (decisiones y avisos al día)
```

## 4. Páginas y rutas

| Dirección | Qué es | Se indexa |
| --- | --- | --- |
| `/` | Portada: intro, caminos, mejores por calidad-precio y rebajas | Sí |
| `/guia` | Guía de preguntas (Recomendador) | Sí |
| `/guia/resultados?…` | Resultados con las respuestas en la dirección | No |
| `/comparador?categoria=…&marca=…&orden=…` | Catálogo con filtros | Sí |
| `/comparativa?bicis=a,b,c` | Comparativa de 2 a 4 bicis | No |
| `/bici/<slug>` | Ficha de bici (~4.300) | Sí |
| `/bicis`, `/bicis/<tipo>[/<subtipo>]` | Páginas por tipo (también eléctricas) | Sí |
| `/bicis/<tipo>/menos-de-<€>` | Páginas por precio (42) | Sí |
| `/marcas`, `/marcas/<marca>`, `/marcas/<marca>/<tipo>` | Páginas por marca y por marca y tipo | Sí (marcas con ≥5 bicis) |
| `/talla-bicicleta` | Calculadora de talla | Sí |
| `/enlaces` | Página para la biografía de Instagram | No |
| `/aviso-legal`, `/privacidad`, `/cookies`, `/transparencia` | Textos legales | Sí |
| `/ir/<slug>` | Salida a la tienda (302) | No |
| `/api/contador` | Cuántas bicis quedan en la guía | — |
| `/api/talla` | Calculadora de talla (cifras agregadas) | — |
| `/api/evento` | Recibe eventos de uso | — |
| `/api/csp` | Recibe avisos de la política de seguridad | — |
| `/api/indexnow` | Aviso diario a IndexNow (protegido) | — |
| `/sitemap.xml`, `/robots.txt` | Generados por Next | — |

Detalle de páginas de entrada: `src/lib/landings.ts`. Arquitectura de la información: `docs/architecture/`.

## 5. Datos (Supabase)

Proyecto `recomendador_bicicletas` (ref. `urrnkwrwatcifypdwfwc`), región Irlanda, plan gratuito.

**Lo que lee la web:**

| Tabla o vista | Para qué |
| --- | --- |
| `variant_listing` (vista materializada) | Una fila por bici con lo necesario para listar y puntuar |
| `variants` | Datos de cada bici (especificaciones en `specs`) |
| `variant_sizes` | Tallas, alturas recomendadas y geometría |
| `variant_components` | Componentes de la ficha |
| `media` | Fotos (`source_url`, enlazadas desde la web de cada marca) |
| `offers` | Precio, stock y enlace de cada oferta (`affiliate_url` cuando haya afiliación) |
| `score_formulas` | Pesos de la nota calidad-precio (se cambian sin publicar) |

**Lo que escribe la web** (solo a través de funciones, con la clave pública):

| Función | Tabla | SQL |
| --- | --- | --- |
| `registrar_clic` | `outbound_clicks` | `supabase/sql/001_registrar_clic.sql` |
| `registrar_evento` | `eventos` | `supabase/sql/002_eventos.sql`, `003_origen_y_talla.sql` |

**Vistas para paneles** (Looker Studio / Power BI con el rol `roodada_lectura`): `v_eventos_dia`, `v_embudo_guia`, `v_bicis_actividad`, `v_visitas_origen`.

**SQL pendiente de ejecutar:** `supabase/sql/004_seguridad.sql` (quita permisos que la clave pública no necesita). Ver la auditoría de seguridad.

**Reglas:**
- RLS activo en todas las tablas. La clave pública solo puede leer el catálogo.
- Si añades un evento, añádelo en `EVENTOS` (`src/lib/actividad/eventos.ts`) **y** en la lista de la función SQL.
- Si la web lee un campo nuevo de `specs`, añádelo a `SPEC_KEYS` (junto a `mapSpecs` en `src/lib/catalog/build.ts`).
- Si entra una disciplina nueva en la base, hay que añadirla en `types`, `format` y `questions` o fallará la compilación.

## 6. Cómo se cargan y se guardan en caché los datos

Todo está en `src/lib/catalog/load.ts`. Cada página pide solo lo que usa:

| Función | Qué trae | Quién la usa |
| --- | --- | --- |
| `getCatalog()` | Catálogo entero con tallas | Guía, resultados, contador, portada |
| `getCatalog({ sizes: false })` | Catálogo sin tallas | Comparador, menú, sitemap, IndexNow |
| `getBike` / `getBikes` | Una o varias bicis sueltas | Ficha, `/ir`, comparativa |
| `getBikeDetail` | Fotos, geometría, componentes, oferta | Ficha |
| `getAlternatives` | Bicis parecidas | Ficha |
| `getCohortStats` | Datos para la nota calidad-precio | Ficha |
| `getSlugs` | Todas las direcciones de fichas | Sitemap, compilación |

- Cada una lleva `'use cache'` con `cacheLife("days")`: se recalcula como mucho **una vez al día** (Edgar actualiza precios a diario). Antes era cada hora y los rastreadores hacían que el servidor regenerara las 4.500 fichas sin parar.
- La caché vive en la memoria del proceso (`cacheMaxMemorySize` 256 MB en `next.config.ts`). Al publicar una versión nueva se vacía y se vuelve a llenar con las visitas.
- Al compilar se generan las páginas de entrada y las 100 primeras fichas (`FICHAS_EN_BUILD`); el resto se genera en la primera visita.
- La lectura por páginas (`selectAll` en `src/lib/supabase/server.ts`) pide de 1.000 en 1.000, 3 a la vez, y reintenta 4 veces con pausas de 1,5 a 12 s si Supabase corta una consulta.
- La compilación usa 2 procesos (`experimental.cpus`) para no saturar Supabase.

## 7. Recomendador y nota calidad-precio

Explicado en detalle en [RECOMENDADOR.md](RECOMENDADOR.md). Resumen:

- Código en `src/lib/recommender/`: funciones puras con pruebas.
- Filtros duros (uso, eléctrica, presupuesto +10 %, stock, talla) → puntuación (talla 25 %, calidad-precio 20 %, prioridades 55 %) → de 3 a 5 resultados con pros y contras.
- Nota calidad-precio 0–10 con los pesos de `score_formulas`.
- Un dato ausente puntúa neutro y baja la confianza: **nunca se inventa**.
- La página pública `/transparencia` explica esto: si cambias la lógica o los pesos, revísala.

## 8. Servidor (VPS) y Cloudflare

Desde el 26-11-2026 la web está en el VPS de digitaldementia.es (antes en Vercel, que pausaba la cuenta por exceso de uso del plan gratuito).

**VPS** (`217.76.133.242`, compartido con digitaldementia.es y Office):

| Qué | Dónde |
| --- | --- |
| Código subido | `/srv/roodada/src` |
| Versión publicada | `/srv/roodada/app` (la anterior en `app.old`) |
| Caché de fotos y páginas | `/srv/roodada/cache` (sobrevive a las publicaciones) |
| Variables | `/srv/roodada/.env` (solo lectura para el usuario `roodada`) |
| Servicio | `systemd` → `roodada.service`, usuario `roodada`, puerto 3100, memoria máx. 1,5 GB |
| Nginx | `/etc/nginx/sites-available/roodada` (HTTPS añadido por certbot) |
| IP real tras Cloudflare | `/etc/nginx/conf.d/cloudflare-realip.conf` |
| Aviso diario a IndexNow | `/etc/cron.d/roodada-indexnow` (07:00 UTC) → log en `/srv/roodada/indexnow.log` |
| Certificado | `/etc/letsencrypt/live/roodada.com/` (certbot lo renueva solo) |
| Memoria de intercambio | `/swapfile` 4 GB (para compilar) |

- Next se compila en modo `standalone` (`output: "standalone"`): un `server.js` con lo justo, sin `node_modules` completos.
- Roodada corre con su propio usuario, sin permisos sobre las otras webs del VPS (`ProtectSystem=strict`, solo puede escribir en `/srv/roodada`).
- Nginx limita `/ir/` a 20 peticiones por minuto e IP y `/api/evento` a 60.
- Los ficheros de configuración están en `scripts/vps/` (`roodada.service`, `roodada.nginx`). Cambiar uno de ellos en el repositorio **no** lo cambia en el servidor: hay que aplicarlo (ver OPERACIONES.md).

**Cloudflare** (cuenta de info@roodada.com):

- Nameservers `bella.ns.cloudflare.com` y `elmo.ns.cloudflare.com` (el dominio sigue registrado en IONOS).
- `roodada.com` y `www`: proxy activado (nube naranja). Registros del correo en gris: MX, SPF, DKIM (`s1-ionos._domainkey`, `s2-ionos._domainkey`), `_dmarc`, `autodiscover`.
- SSL/TLS en **Full (strict)**: Cloudflare ↔ VPS también va cifrado con el certificado de Let's Encrypt.
- «Always Use HTTPS» desactivado (lo hace Nginx; así la renovación del certificado no tiene problemas).
- Regla de caché «Fotos optimizadas»: `/_next/image` se guarda en Cloudflare con la duración que indica el VPS (31 días). Las fotos se sirven solo en WebP para que la caché valga para todos los navegadores.
- Las páginas HTML no se guardan en Cloudflare (`DYNAMIC`): tienen partes que cambian en cada visita.
- Bot Fight Mode desactivado (bloqueaba previsualizaciones de redes sociales).

**Vercel**: desconectado de GitHub. El proyecto `roodada-d4fa` ya no sirve nada; se puede borrar. El código mantiene compatibilidad (si `VERCEL_ENV` existe, se comporta como antes), pero el despliegue real es el VPS.

## 9. Variables de entorno

| Variable | Dónde | Para qué |
| --- | --- | --- |
| `SUPABASE_URL` | `.env.local` y VPS | Dirección del proyecto de Supabase |
| `SUPABASE_ANON_KEY` | `.env.local` y VPS | Clave pública (`sb_publishable_…`). Nunca la secreta |
| `NEXT_PUBLIC_SITE_URL` | VPS (`https://roodada.com`) | Dirección canónica, sitemap, robots |
| `CRON_SECRET` | VPS | Contraseña del aviso diario a IndexNow |
| `PORT`, `HOSTNAME`, `NODE_ENV` | VPS | 3100, 127.0.0.1, production |
| `ANALYSIS_DATABASE_URL` | Solo `.env.local` | Rol `roodada_lectura` para análisis y paneles. **Nunca en el servidor** |
| `ROODADA_MODO_PRUEBA` | Solo local, opcional | `1` = no indexar (fuera de Vercel) |
| `NEXT_PUBLIC_GA_ID` | Opcional | Sustituye al ID de GA4 que va en el código |

- `.env.local` no se sube a git. Plantilla en `.env.example`.
- Las variables del VPS se crearon con `scripts/vps/setup.sh` a partir de `.env.local`. Para cambiar una: ver OPERACIONES.md.
- El código aún acepta los nombres antiguos `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no los uses en nada nuevo.

## 10. Medición: registro propio, GA4 y cookies

| Herramienta | Qué mide | ¿Pide consentimiento? |
| --- | --- | --- |
| Registro propio (`src/lib/actividad/`, `/api/evento`, tabla `eventos`) | Páginas vistas, recorrido de la guía, fichas, comparador, salidas a tienda, talla calculada, origen (dominio y UTM) | No: anónimo, sin cookies ni almacenamiento |
| Clics de salida (`/ir/` → `outbound_clicks`) | Qué oferta, desde qué página, a qué precio | No |
| Google Analytics 4 (`G-ZR7CP7S1B2`) | Visitas y recorridos | **Sí** (categoría Analítica) |
| Skimlinks (`313666X1802414`) | Atribución de compras de afiliación | **Sí** (categoría Afiliación) |

- Aviso de cookies: `src/components/Consentimiento.tsx` y `src/lib/consentimiento.ts`. Aceptar y Rechazar iguales, sin capa que tape la página, decisión guardada 12 meses, «Preferencias de cookies» en el pie.
- **Si se añade un servicio con cookies** (píxel de Meta, vídeo incrustado…): añadirlo a `/cookies` y `/privacidad`, a la CSP en `next.config.ts` y subir `VERSION` en `consentimiento.ts` para volver a preguntar a todos.
- GA4 recibe las direcciones **sin parámetros** (llevan altura y presupuesto). En el panel de GA4: «Cambios de página basados en eventos del historial» desactivado, retención 2 meses, Google Signals desactivado.
- El registro propio no apunta nada si el navegador pide no ser seguido (GPC o Do Not Track) ni en desarrollo.

## 11. Afiliación

- `/ir/<slug>` redirige a `offers.affiliate_url` si existe; si no, a la página de la tienda.
- Los bots (rastreadores, previsualizaciones de WhatsApp o redes, scripts; ver `esBot` en `src/lib/actividad/eventos.ts`) van siempre por el enlace normal, nunca por el de afiliado, y no cuentan como clic.
- Los botones de compra llevan `rel="sponsored nofollow noopener"` y la ficha muestra el aviso de comisión (`AFFILIATE_NOTICE` en `src/lib/legal.ts`) cuando el enlace es de afiliado.
- Redes: Skimlinks (script con consentimiento; cuando aprueben, la idea es envolver en `/ir/` las salidas sin enlace propio con `go.skimresources.com`), AvantLink (script de verificación temporal en la portada: **quitarlo cuando confirmen el alta**, junto con su mención en `/privacidad`).

## 12. SEO, robots e IndexNow

- Títulos, descripciones y JSON-LD (Product, BreadcrumbList, Organization, WebSite, FAQPage, ItemList): `src/lib/seo.ts`.
- Sitemap: `src/app/sitemap.ts` (~4.500 direcciones).
- `robots.txt` (`src/app/robots.ts`):
  - Abierto a buscadores y a la búsqueda con IA (Google, Bing, ChatGPT Search, Claude, Perplexity, Apple).
  - **Bloqueados** los bots de entrenamiento (GPTBot, ClaudeBot, CCBot, Meta, Amazon, Cohere…) y los extractores de datos.
  - `Crawl-delay: 2` (lo respetan Bing y Yandex; Google no).
  - Fuera: `/ir/`, `/api/`, `/guia/resultados`, `/comparativa`.
- Producción siempre indexable; previews nunca (`src/lib/site.ts`).
- IndexNow: cada día a las 07:00 UTC el cron del VPS llama a `/api/indexnow`, que avisa a Bing de las fichas nuevas o con precio cambiado en las últimas 26 h. Clave en `src/lib/indexnow.ts` y en `public/<clave>.txt` (si cambia una, cambiar la otra).
- Search Console y Bing Webmaster Tools dados de alta (verificación por DNS).

## 13. Seguridad

Auditoría completa y estado: doc «Roodada · Auditoría de seguridad antes del lanzamiento» (claude.ai/artifact/ENptJoVJ9kCQL94GmDru8o).

- **Cabeceras** (`next.config.ts`): CSP en modo **Report-Only** (avisos en los registros con «csp:», vía `/api/csp`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS con subdominios, sin `X-Powered-By`. Pendiente: pasar la CSP a aplicada tras una semana sin avisos propios.
- **Fotos**: solo de las webs de `src/lib/fotosPermitidas.ts`; en dominios compartidos (Shopify, Google Cloud…) solo la ruta de cada marca. Al añadir una marca: `npx tsx --env-file=.env.local scripts/comprobar-fotos.mts`.
- **Clave de Supabase** solo en el servidor (`server-only`), nunca en el navegador.
- **`/api/evento`** solo acepta peticiones de la propia web (Origin o `Sec-Fetch-Site`).
- **Límites por IP** en Nginx (`/ir/` y `/api/evento`).
- **`security.txt`** en `/.well-known/security.txt`: **caduca el 25-11-2027**, renovar la fecha `Expires`.
- Pendiente de vuestra parte: doble factor en todas las cuentas, cerrar el alta de usuarios en Supabase, ejecutar `004_seguridad.sql`, proteger `main` en GitHub.

## 14. Sistema de diseño

- Exportado desde Office en `design-system/`. **No se edita a mano**: se sobrescribe al reexportar.
- De él se usan **solo colores y tipografías** (`--ds-*`, utilidades como `bg-surface`, `text-h2`). La composición es propia (retícula suiza, filetes de 1 px, botones `.btn`) y está en `src/app/globals.css`.
- Correcciones sobre el export (escala tipográfica un 15 % menor, movimiento suave, foco): bloque `:root` al principio de `globals.css`.
- Colores con un solo significado: `accent` lo activo, `choice` (coral) lo tuyo, `surface` (amarillo) lo editorial.
- Más detalle: `CLAUDE.md` y `design-system/DESIGN.md`.

## 15. Pruebas y comprobaciones automáticas

```bash
npm run typecheck   # tipos (en una copia limpia, antes: npx next typegen)
npm run lint
npm test            # ~100 pruebas: recomendador, catálogo, SEO, talla, cookies, fotos, IndexNow…
npm run build       # compilación completa (carga Supabase: no abusar)
```

- **GitHub Actions** (`.github/workflows/comprobar.yml`): en cada pull request y en cada subida a `main` pasa tipos, lint, pruebas y `npm audit`. **No publica**: publicar es `scripts/vps/deploy.sh`.
- **Dependabot** (`.github/dependabot.yml`): propone actualizaciones menores cada semana; las versiones grandes se hacen a mano.

## 16. Cuentas y accesos

| Servicio | Para qué | Quién |
| --- | --- | --- |
| GitHub `IvanMerino515/roodada` (privado) | Código | Iván (dueño), Edgar |
| IONOS | Dominio (registro), correo, VPS | Iván |
| Cloudflare | DNS, proxy, caché | Iván (info@roodada.com) |
| Supabase | Base de datos | Iván, Edgar |
| Google Search Console / Analytics | SEO y medición | Iván |
| Bing Webmaster Tools | SEO | Iván |
| Meta Business Suite | Instagram y Facebook | Iván |
| Skimlinks, AvantLink, Awin… | Afiliación | Iván |
| VPS (SSH) | Publicar y mantener | Iván (clave `~/.ssh/digitaldementia_vps`) |

Activad el doble factor en todas. Las contraseñas y claves no van en este documento ni en el repositorio.

## 17. Documentos relacionados

- [OPERACIONES.md](OPERACIONES.md): publicar, revisar el servidor y qué hacer si algo falla.
- [RECOMENDADOR.md](RECOMENDADOR.md): cómo decide el recomendador.
- `docs/architecture/`: arquitectura de la información (exportada de Office).
- `docs/data/ANALISIS.md`: análisis de datos que fijó preguntas y pesos.
- `CLAUDE.md`: notas y decisiones al día para trabajar con Claude Code.
- Documentos de trabajo (claude.ai): auditoría de seguridad, monetización y afiliación, estrategia de tráfico, estrategia de redes, guía de contenidos de Instagram.
