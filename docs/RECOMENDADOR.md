# Cómo decide Roodada

Documento vivo. Si cambias la lógica de `src/lib/recommender/`, actualízalo. Origen de cada decisión: `docs/data/ANALISIS.md`.

## Rutas del MVP

| IA de Office | Ruta | Render |
|---|---|---|
| Roodada Inicio | `/` | estático (cifras del catálogo en caché) |
| Formulario | `/guia` | estático + `/api/contador` para el contador en vivo |
| Catálogo personalizado | `/guia/resultados?uso=…&electrica=…&presupuesto=…&altura=…&nivel=…&prioridades=…` | dinámico, sin indexar |
| Comparador | `/comparador?categoria=…&marca=…&orden=…&pagina=…` | dinámico |
| Comparativa | `/comparativa?bicis=slug1,slug2` (2–4) | dinámico, sin indexar |
| Ficha de bici | `/bici/[slug]` (`?altura=` desde la guía) | estática, las 1.636 en el build |
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

## Recomendador

1. **Filtros duros** (`filters.ts`): uso → categoría + disciplinas (`questions.ts`), eléctrica, presupuesto + 10 %, en stock y talla que encaje.
2. **Talla** (`sizing.ts`): oficial · estimada · entre dos tallas (solape o hueco ≤ 3 cm). Si no hay talla, la bici queda fuera.
3. **Puntuación** (`score.ts`, pesos en `weights.ts`): `100 · (0,25 talla + 0,20 calidad-precio + 0,55 prioridades)`, × 0,85 si supera el presupuesto.
   - Las prioridades elegidas pesan 1. El nivel añade implícitas de peso 0,5: quien empieza, comodidad; quien compite, componentes y postura deportiva. Sin prioridades: componentes + comodidad.
   - Comodidad = percentil de stack/reach de su talla frente a las demás candidatas.
4. **Orden y variedad** (`index.ts`): por puntuación, con como mucho 2 variantes por modelo y 24 resultados.
5. **Explicación** (`explain.ts`): la talla siempre primero, luego lo que más destaca de lo pedido, y avisos de datos que faltan o de sobreprecio.

Pruebas: `npm test` usa una muestra real del catálogo (`__tests__/fixtures/catalogo.json`; regenerar con `npx tsx --env-file=.env.local scripts/analysis/fixture.mts`).
