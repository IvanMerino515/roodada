# Cómo decide Roodada

Documento vivo. Si cambias la lógica de `src/lib/recommender/`, actualízalo. Origen de cada decisión: `docs/data/ANALISIS.md`.

## Rutas del MVP

| IA de Office | Ruta | Render |
|---|---|---|
| Roodada Inicio | `/` | estático (cifras del catálogo en caché) |
| Formulario | `/guia` | estático + `/api/contador` para el contador en vivo |
| Guía conversacional (prueba) | `/guia/chat` | estático, sin indexar; la conversación va en el navegador + `/api/contador` y `/api/recomendar` |
| Catálogo personalizado | `/guia/resultados?nivel=…&electrica=…&presupuesto=…&uso=…&altura=…[&entrepierna=…][&prioridades=…]` | dinámico, sin indexar |
| Comparador | `/comparador?categoria=…&marca=…&orden=…&pagina=…` | dinámico |
| Comparativa | `/comparativa?bicis=slug1,slug2` (2–4) | dinámico, sin indexar |
| Ficha de bici | `/bici/[slug]` (desde la guía, con las respuestas: añade «Por qué es para ti») | estática, las 1.636 en el build; la explicación se rellena aparte |
| — | `/ir/[slug]` | redirección 302 a la tienda (fase 2: afiliación) |
| — | `/sitemap.xml`, `/robots.txt` | |

## Datos

`getCatalog()` (`src/lib/catalog/load.ts`) carga `variant_listing` + `variant_sizes` + `score_formulas` una vez, con caché de horas (`cacheTag("catalogo")`), y `buildCatalog()` calcula percentiles por cohorte (categoría + eléctrica o no) y la nota calidad-precio. Todo lo demás (guía, comparador, comparativa) trabaja sobre esa copia en memoria. `getBikeDetail(id)` trae solo para la ficha la geometría, los componentes, las fotos y la oferta.

Fotos: se sirven desde la web de cada marca a través del optimizador de imágenes de Next (WebP/AVIF, caché de 31 días). Si una marca empieza a bloquearlas, se copian a Supabase Storage (`media.storage_path`).

## Nota calidad-precio (0–10)

`src/lib/recommender/quality.ts`. Usa los pesos de `score_formulas` en Supabase (v1: componentes 0,30 · precio 0,25 · cuadro 0,20 · peso 0,15 · posventa 0,10), así que se pueden cambiar sin desplegar.

- **Componentes:** gama del grupo 1–5 (`tiers.ts`) más extras por cambio electrónico y frenos hidráulicos. En eléctricas, la media con el percentil de batería.
- **Precio:** lo barata que es frente a su cohorte.
- **Cuadro:** carbono/titanio 1 · aluminio 0,5 · acero 0,4.
- **Peso:** lo ligera que es frente a su cohorte.
- **Posventa:** aún sin datos. No cuenta, y su peso se reparte entre los demás.
- Un dato ausente vale 0,5 y baja la cobertura, que se muestra en la ficha.
- En infantil no se muestra: gama y material no reflejan la calidad de una bici infantil.

## Preguntas (`questions.ts`)

Orden: **tipo de Roodador → ¿eléctrica? → presupuesto (solo la bici) → uso → altura → prioridades**.

| Roodador | Usos | Entrepierna | Prioridades |
|---|---|---|---|
| Novato, curioso | amplios: carretera, montaña, gravel, ciudad, paseo, infantil | no | no se preguntan |
| Avanzado, experto | detallados: carretera rápida / cómoda, montaña suave / técnica… | opcional | hasta 2 |

En infantil no se aplica el filtro de eléctrica ni se preguntan prioridades.

## Guía conversacional (`/guia/chat`, prueba)

Chat con el asistente «Radio» que sustituirá a las preguntas cerradas de `/guia` si la prueba convence. Todo en el navegador, sin IA ni backend: `src/lib/chat/` (funciones puras con tests).

- `extract.ts` lee el texto libre (minúsculas, sin tildes, números en letra) y saca los datos. Solo apunta lo que la persona dice; un número suelto solo cuenta si se acaba de preguntar por ese dato.
- `engine.ts` decide la respuesta: apunta, da un consejo parcial si un dato nuevo lo permite (`advice.ts`, uno por turno) y pregunta lo que falta, como mucho 3 datos por turno y con ejemplos que no obligan.
- Primero el perfil (novato, curioso, avanzado, pro). Datos mínimos por perfil, cada uno suma un grupo: novato = uso, presupuesto, eléctrica, duración de las salidas y altura; curioso + material del cuadro y tipo de cambio; avanzado + uso concreto, desarrollos y peso; pro + campo libre con sugerencias. Infantil: solo uso, presupuesto y altura del niño.
- «No sé» en eléctrica, material, cambio, desarrollos o peso vale como respuesta (queda abierto). En uso, presupuesto, altura o duración se le ayuda con ejemplos y no se cierra sin el dato.
- Con todo, resume el perfil en una frase y pide confirmación. Luego pide a `/api/recomendar` las bicis reales (el mismo `recommend()` de `/guia/resultados`, con las respuestas traducidas por `toAnswers`), en el mismo orden: la que más encaja primero.
- «Por qué te encaja» (`why.ts`): une lo que contó (presupuesto, altura, salidas, material, cambio, peso, uso, necesidades) con los datos publicados de cada bici; si la ficha no trae algo que pidió, lo dice. Añade un pro y los contras del recomendador sin repetir tema. Las demás bicis se presentan por lo que destacan (la más barata, la más ligera, la mejor montada…).
- Aparte, plegado: qué buscar en otras tiendas (tipo de bici, gamas, ruedas y pesos orientativos de `advice.ts`, no datos de una bici concreta), qué confirmar y un consejo.
- Sin IA: reglas sobre el texto. Si se conecta un modelo, iría en el servidor (clave fuera del navegador) y solo para entender el texto y redactar; las bicis y sus datos seguirían saliendo de `recommend()`.
- Conversaciones de ejemplo de los cuatro perfiles en `demos.ts` (botones «Probar con un ejemplo»).

## Recomendador

1. **Filtros duros** (`filters.ts`): uso → categoría + disciplinas, eléctrica, presupuesto + 10 %, en stock y talla que encaje.
2. **Talla** (`sizing.ts`): oficial · estimada · entre dos tallas (solape, o hueco entre dos tallas de la tabla: BH deja huecos de hasta 16 cm). Por encima o por debajo de toda la tabla, solo a ≤ 3 cm; si no, la bici queda fuera. Con entrepierna: holgura = entrepierna − standover (64 % de las tallas lo publican). Entre dos tallas, si la elegida deja menos de 2 cm y la otra no, se cambia; si no pasa por encima del tubo, la talla puntúa la mitad.
3. **Puntuación** (`score.ts`, pesos en `weights.ts`): `100 · (0,25 talla + 0,20 calidad-precio + 0,55 prioridades)`, × 0,85 si supera el presupuesto.
   - Prioridades según el Roodador (`LEVEL_PRIORITIES`). Si no elige (novato y curioso nunca eligen), cuentan las de base con peso 1; las implícitas suman con peso 0,5.
     - Novato: comodidad + ahorro (implícita).
     - Curioso: comodidad y componentes.
     - Avanzado: componentes y ligereza.
     - Experto: componentes y ligereza + postura deportiva (implícita).
   - Comodidad = percentil de stack/reach de su talla frente a las demás candidatas.
4. **De 3 a 5** (`index.ts`): por puntuación, una versión por modelo. Pasada la 3.ª, solo las que no se quedan a más de 10 puntos de la 1.ª (`RESULTS`).
5. **Pros y contras** (`explain.ts`), comparando las recomendadas entre sí:
   - A favor: la talla primero y luego en qué es la mejor del grupo (precio, calidad-precio, grupo, peso, postura, batería, cubiertas, equipamiento) o lo que destaca de lo pedido.
   - En contra: sobreprecio, holgura, entre tallas o talla estimada, frenos, equipamiento que falta, datos no publicados y en qué es la peor del grupo (solo con 3 o más).
   - Explicación larga (`story`) para la ficha: talla, lo que pediste con cifras, frente a las demás, calidad-precio y encaje.
6. **Compra**: botón a la web oficial de la marca (`/ir/[slug]`). Hoy cada bici tiene una sola oferta, la oficial; cuando haya tiendas se ofrecerán desde ahí.

Pruebas: `npm test` usa una muestra real del catálogo (`__tests__/fixtures/catalogo.json`; regenerar con `npx tsx --env-file=.env.local scripts/analysis/fixture.mts`).
