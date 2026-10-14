# Sistema de diseño · Roodada

> Generado con Office (Digital Dementia) el 14 de octubre de 2026. **No edites estos ficheros a mano**: el sistema se mantiene en Office y se vuelve a exportar.

## Instalación

```css
/* CSS principal del proyecto (Tailwind 4) */
@import "tailwindcss";
@import "./design-system/tokens/tokens.css";
@import "./design-system/tokens/theme.css";
@import "./design-system/components/components.css";
```

Sin Tailwind: importa solo `tokens.css` y `components.css`.
Fuentes (Google Fonts): **poppins**. Cárgalas en el `<head>` o con `@fontsource`.
Componentes React: `design-system/react` (`import { Button, Field, Input } from '…/design-system/react'`).

## Reglas (obligatorias al construir interfaz)

1. **Nunca valores a mano.** Colores, tamaños de letra, interlineados, radios, sombras, duraciones y anchos salen de los tokens: `var(--ds-…)` en CSS o las utilidades del tema en Tailwind (`bg-surface`, `text-text-muted`, `text-h2`, `rounded-md`, `shadow-md`…). La paleta por defecto de Tailwind está desactivada a propósito.
2. **Color por rol, no por tono.** Usa los roles (`bg`, `surface`, `text`, `accent`…), no los primitivos (`--ds-roodada-principal-500`), salvo ilustraciones o casos justificados. Así el modo oscuro funciona solo.
3. **El acento es escaso:** acción principal, enlaces y estados activos. **Un solo botón `primary` por vista**; el resto, `secondary` o `ghost`.
4. **Jerarquía tipográfica:** un único `h1` por página; no saltes niveles; `display` solo en portadas o héroes. Usa `Heading level` para la semántica y `size` si el estilo debe ser distinto.
5. **Espaciado en múltiplos de 8 px** (`--ds-space-*`). Entre secciones, `--ds-section` (componente `Section`). Contenido dentro de `Container`.
6. **Componentes antes que estilos sueltos:** si existe un componente básico (botón, campo, tarjeta, etiqueta), úsalo; si hace falta una variante nueva, créala a partir de los mismos tokens.
7. **Accesibilidad:** objetivos táctiles de 44 px mínimo, foco visible (`--ds-focus`), cada campo con `label`, errores con `aria-invalid` (prop `invalid`), contraste AA como mínimo (tabla abajo). Respeta `prefers-reduced-motion` (los tokens de duración ya lo hacen).
8. **Modo oscuro:** automático según el sistema; para forzarlo, `data-theme="light" | "dark"` en `<html>`.

## Color

| Rol | Uso | Claro | Oscuro |
|---|---|---|---|
| `bg` | Fondo de página | roodada-texto2 · #EEE7E9 | neutral-950 · #FF00FF |
| `surface` | Tarjetas, campos, paneles | roodada-terciario · #FFC35C | neutral-900 · #FF00FF |
| `surface-alt` | Zonas destacadas, hover | roodada-terciario · #FFC35C | neutral-800 · #FF00FF |
| `text` | Texto principal | roodada-textos · #373435 | neutral-50 · #FF00FF |
| `text-muted` | Ayudas, metadatos | roodada-texto2 · #EEE7E9 | neutral-400 · #FF00FF |
| `border` | Bordes y divisores | roodada-textos · #373435 | neutral-800 · #FF00FF |
| `accent` | Acción principal, enlaces | roodada-textos · #373435 | color-1 · #FF00FF |
| `on-accent` | Texto encima del acento | white · #FFFFFF | neutral-950 · #FF00FF |
| `success` | Confirmaciones | roodada-secundario · #00D8BC | verde-400 · #FF00FF |
| `warning` | Advertencias | roodada-principal · #FF716A | ambar-400 · #FF00FF |
| `danger` | Errores y acciones destructivas | roodada-principal-700 · #942A29 | rojo-400 · #FF00FF |
| `focus` | Anillo de foco del teclado | roodada-textos · #373435 | color-1-300 · #FF00FF |

**Contraste comprobado**

| Texto / fondo | Claro | Oscuro |
|---|---|---|
| text / bg | 10.1:1 AAA | 1.0:1 ✕ |
| text / surface | 7.7:1 AAA | 1.0:1 ✕ |
| text-muted / bg | 1.0:1 ✕ | 1.0:1 ✕ |
| text-muted / surface | 1.3:1 ✕ | 1.0:1 ✕ |
| on-accent / accent | 12.3:1 AAA | 1.0:1 ✕ |
| accent / bg | 10.1:1 AAA | 1.0:1 ✕ |
| danger / bg | 6.6:1 AA | 1.0:1 ✕ |

Primitivos (cada uno con escala 50–950 en `--ds-<nombre>-<paso>`): `roodada-principal` #FF716A, `roodada-textos` #373435, `roodada-secundario` #00D8BC, `roodada-terciario` #FFC35C, `roodada-texto2` #EEE7E9.

## Tipografía

Familias: display **poppins**, texto **poppins**, mono **poppins**. Escala modular 1.125 (escritorio) y 1.2 (móvil) sobre 18 px; los tamaños son fluidos entre 375 y 1440 px de ancho.

| Rol | Clase / utilidad | Familia | Móvil → escritorio | Peso | Interlineado | Tracking |
|---|---|---|---|---|---|---|
| display | `.ds-display` · `text-display` | display | 53.7 → 36.5 px | 800 | 0.95 | -0.075em |
| h1 | `.ds-h1` · `text-h1` | display | 44.8 → 32.4 px | 700 | 1.05 | -0.05em |
| h2 | `.ds-h2` · `text-h2` | display | 37.3 → 28.8 px | 600 | 1.1 | -0.05em |
| h3 | `.ds-h3` · `text-h3` | display | 25.9 → 22.8 px | 600 | 1.2 | -0.05em |
| h4 | `.ds-h4` · `text-h4` | display | 21.6 → 20.3 px | 600 | 1.3 | 0 |
| body | `.ds-body` · `text-body` | body | 18 → 18 px | 500 | 1.55 | 0 |
| small | `.ds-small` · `text-small` | body | 15 → 16 px | 500 | 1.45 | 0 |
| label | `.ds-label-text` · `text-label` | body | 15 → 16 px | 600 | 1.2 | 0.02em |
| mono | `.ds-mono` · `text-mono` | mono | 15 → 16 px | 400 | 1.5 | 0 |

## Espacio, forma y layout

- Unidad base **8 px**; escala `--ds-space-{1,2,3,4,5,6,8,10,12,16,20,24}` = n × 8 px.
- Radios: sm 0 px · md 0 px · lg 0 px · full. Borde 2 px. Sombras: suaves.
- Movimiento: 120 / 200 / 320 ms, easing `steps(4, end)`.

## Layout

**Retícula por dispositivo** (mobile first; `--ds-columns`, `--ds-gutter`, `--ds-margin` cambian solos):

| Dispositivo | Ancho | Columnas | Separación | Margen lateral |
|---|---|---|---|---|
| Móvil | base | 2 | 2 px | 8 px |
| Tablet | desde 768 px | 8 | 24 px | 32 px |
| Escritorio | desde 1024 px | 8 | 12 px | 12 px |
| Pantalla grande | desde 1440 px | 12 | 32 px | 64 px |

**Anchos de contenido:** estrecho 680 px (texto largo, formularios) · normal 1200 px · ancho 1440 px (galerías). `<Container size="narrow" | "wide" | "full">` o `max-w-narrow` / `max-w-content` / `max-w-wide` en Tailwind.

**Ritmo vertical:** secciones 48 / 96 / 144 px (`<Section size="sm" | "lg">`, en móvil al 60 %); entre elementos apilados 16 px (`<Stack>`, `<Cluster>`).

**Patrones de layout** (úsalos antes de crear rejillas nuevas):

| Patrón | Cuándo | Ejemplo |
|---|---|---|
| `Split` · `.ds-split` | Texto + imagen, dos bloques en paralelo (1:1); apilado en móvil. `reverse` invierte el orden | `<Split><div>…</div><img …/></Split>` |
| `Cards` · `.ds-cards` | Listados de tarjetas: 1 / 2 / 4 columnas | `<Cards>{items.map(…)}</Cards>` |
| `Prose` · `.ds-prose` | Texto largo: artículos, legales | `<Prose><h2>…</h2><p>…</p></Prose>` |
| `Hero` · `.ds-hero` | Cabecera de página (70% de alto, a la izquierda) | `<Hero><Heading level={1} size="display">…</Heading></Hero>` |

Para composiciones que no encajen en un patrón, usa `Grid` con `col-span-*` de Tailwind respetando las columnas de cada dispositivo.

## Líneas e iconografía

- Bordes 2 px (`--ds-border-width`) y fuertes 2 px (`--ds-border-strong`). Divisores continuos: `<hr class="ds-divider">` (o `ds-divider--strong`).
- Iconos de línea a 24 px con trazo 1.75, terminaciones redondeadas y uniones redondeadas. Usa `<Icon name="…" />` (hereda el color del texto) o los SVG de `design-system/icons/`. **No mezcles otros sets de iconos**: si falta uno, dibújalo con el mismo trazo o añádelo al sistema en Office.
- Disponibles: `search`, `menu`, `close`, `plus`, `minus`, `check`, `chevron-down`, `chevron-right`, `arrow-right`, `arrow-left`, `external`, `home`, `user`, `users`, `heart`, `star`, `cart`, `bag`, `ticket`, `calendar`, `clock`, `map-pin`, `mail`, `phone`, `share`, `download`, `upload`, `settings`, `bell`, `lock`, `eye`, `trash`, `edit`, `filter`, `info`, `warning`, `play`, `music`, `camera`, `image`.
- Base: [Lucide](https://lucide.dev) (licencia ISC) con el estilo de la marca.

## Componentes básicos

Implementados en `design-system/react` (React) y `components.css` (clases `ds-*`, sirven en cualquier HTML).

| Componente | Uso | Ejemplo |
|---|---|---|
| `Button` | Acciones. Variantes primary (una por vista), secondary, ghost, danger; tamaños sm, md, lg. Con `href` es un enlace | `<Button>Comprar</Button>` · `<Button variant="secondary" size="sm">Cancelar</Button>` |
| `TextLink` | Enlaces dentro de texto | `<TextLink href="/aviso">Aviso legal</TextLink>` |
| `Field` + `Input` / `Textarea` / `Select` | Formularios: siempre con etiqueta; `hint` de ayuda, `error` + `invalid` en errores | `<Field label="Email" htmlFor="e" error={err}><Input id="e" type="email" invalid={!!err} /></Field>` |
| `Checkbox` | Opciones sí/no | `<Checkbox label="Acepto las condiciones" />` |
| `Card` | Agrupar contenido relacionado | `<Card as="article">…</Card>` |
| `Badge` | Estados y categorías. Tonos neutral, accent, success, warning, danger | `<Badge tone="success">Publicado</Badge>` |
| `TabList` + `Tab` | Alternar vistas dentro de una página (la lógica la pones tú) | `<TabList><Tab selected>Resumen</Tab><Tab>Facturas</Tab></TabList>` |
| `Chip` | Filtros y selecciones; con `onRemove`, etiquetas que se pueden quitar | `<Chip selected onClick={…}>Activos</Chip>` · `<Chip onRemove={…}>Diseño</Chip>` |
| `Alert` | Mensajes del sistema. Tonos neutral, success, warning, danger | `<Alert tone="danger" title="Error">No se pudo guardar.</Alert>` |
| Layout (`Container`, `Section`, `Stack`…) | Ver la sección Layout | `<Section><Container>…</Container></Section>` |
| `Heading`, `Text` | Tipografía | `<Heading level={1} size="display">…</Heading>` · `<Text muted size="small">…</Text>` |

Estilo de botón: primario con el color de acento, radio none (0 px), familia mono, peso 600; hover: se invierte (fondo transparente).
Campos: estilo underline. Tarjetas: border, padding 24 px. Etiquetas: redondeadas.

**Lo que no está aquí** (cabeceras, pies, menús, modales, tablas…) se construye con estos tokens y componentes siguiendo las reglas de arriba.
