# Análisis de datos · Roodada

> 11 de octubre de 2026 · Supabase `recomendador_bicicletas` · datos brutos en `ANALISIS-bruto.md` (`npm run analysis`) y cruces en `scripts/analysis/cruces.mts`.
> Objetivo: decidir qué preguntas hace la guía y cómo puntúa el recomendador. **Pendiente de revisión con Iván.**

## 1. Qué hay

| | |
|---|---|
| Bicis (variantes) | **1.636**, todas publicadas y sin descatalogar · 307 modelos (≈5 variantes por modelo) |
| Marcas con bicis | **11**: BH 325 · Trek 317 · Specialized 219 · Orbea 167 · Cannondale 149 · Canyon 140 · Merida 100 · Bianchi 94 · Van Rysel 62 · Rockrider 56 · Electra 7 (la tabla `brands` tiene 711 marcas, pero solo estas 11 tienen catálogo) |
| Categorías | MTB 631 · carretera 363 · urbana 359 · gravel 216 · infantil 67 |
| Eléctricas | **637 (39 %)**; en urbana son el 75 % y en MTB el 45 % |
| Ofertas | 1 por bici, todas de la **web oficial de la marca** (9 tiendas); 4 sin stock; `affiliate_url` vacío |
| Fotos | 6.353 fotos (todas las bicis) + 183 imágenes de geometría; **100 % enlazadas en caliente** a la web de la marca |

Ya hay infraestructura pensada para el producto que conviene reutilizar:
- `variant_listing` (vista materializada): todo lo que necesita una tarjeta (foto, precio, marca, specs, `search_vector` para búsqueda). Será la fuente del comparador y del recomendador.
- `filter_definitions`: **21 filtros ya definidos** (precio, uso, eléctrica, material, grupo, frenos, rueda, suspensión, recorridos, batería…), es decir, los filtros del comparador.
- `outbound_clicks` encaja con `/ir/[id]`, y `offers.affiliate_url` / `stores.affiliate_network` dejan preparada la fase 2.
- `score_formulas` v1 ("nota calidad-precio": componentes 0,30 · precio 0,25 · cuadro 0,20 · peso 0,15 · posventa 0,10) existe, pero **sin calcular** (`variant_scores` vacía).
- `recommendations`, `assistant_sessions` y `profiles` existen y están vacías (usuarios y asistente: fuera del MVP).
- RLS bien montada: lectura pública para `anon` en todo el catálogo. La web puede leer directamente con la publishable key.

## 2. Cobertura de los campos que importan para recomendar

| Dato | Cobertura | Lectura |
|---|---|---|
| Uso (`specs.discipline`) | **100 %** | 16 valores limpios; base del filtro principal |
| Eléctrica, precio, categoría | 100 % | filtros duros fiables |
| Frenos, transmisión, suspensión | 99 % | |
| Grupo (`groupset`) | 97 % | 50 valores; se agrupan en gamas (ver §4). Faltan sobre todo en infantil |
| Altura del ciclista por talla | **99 %**, pero **34 % estimada** | Specialized, Bianchi, Merida y Van Rysel son casi todo estimado |
| Rueda | 90 % | |
| Material | 90 % | carbono 790 · aluminio 681 · acero 4 |
| Stack/reach | 85 % | huecos en Cannondale (57 %) y nada en Rockrider ni Van Rysel |
| Tubeless | 58 % | solo se marca cuando es `true`: un hueco puede significar "no" |
| Peso | **47 %** | con nota de cómo se pesó en solo el 9 % (con o sin pedales, batería…) |
| Batería | 95 % de las eléctricas | |
| Paso de rueda máximo | 29 % | |

**Conclusión:** el uso, el precio, la talla y la gama de componentes son sólidos y pueden decidir. El peso y el paso de rueda solo pueden **sumar cuando existen**; si faltan, la bici no puede salir penalizada.

## 3. Precio: lo que hay en cada presupuesto

| Tramo | Carretera | Gravel | MTB | Urbana | Infantil | de ellas, eléctricas |
|---|---|---|---|---|---|---|
| < 500 € | 0 | 0 | 4 | 1 | 35 | 0 |
| 500–1.000 | 4 | 2 | 47 | 45 | 24 | 4 |
| 1.000–1.500 | 8 | 8 | 24 | 28 | 5 | 3 |
| 1.500–2.500 | 37 | 42 | 55 | 58 | 3 | 53 |
| 2.500–4.000 | 69 | 64 | 116 | 132 | 0 | 190 |
| 4.000–6.000 | 81 | 49 | 174 | 83 | 0 | 218 |
| > 6.000 | 164 | 51 | 211 | 12 | 0 | 169 |

Mediana de precio: carretera 5.512 € · gravel 3.499 € · MTB 3.799 € (eléctrica 5.824 €) · urbana 1.090 € (eléctrica 3.499 €) · infantil 499 €.

**Implicación:** el catálogo está cargado hacia la gama media-alta. Quien busque una bici de carretera por menos de 1.500 € solo tendrá 12 opciones. La guía tiene que **decir cuántas bicis quedan** en cada paso y ofrecer ampliar el presupuesto cuando se quede corto, en lugar de devolver una lista vacía.

## 4. Gamas de grupo (para valorar componentes)

Propuesta de 5 gamas, contrastada con la mediana de precio de cada grupo:

| Gama | Carretera / gravel | MTB | Urbana / otros |
|---|---|---|---|
| 1 · Básica | Claris, Sora, microSHIFT Sword | Tourney, Altus, microSHIFT, SRAM SX | Tourney, Acera, Nexus |
| 2 · Entrada | Tiagra, CUES (2x) | CUES, Alivio, SRAM NX, Eagle (genérico), microSHIFT Advent | CUES, Alivio, Alfine, Enviolo |
| 3 · Media | 105, GRX, Apex, Campagnolo Ekar | Deore, SLX, SRAM Eagle 70 | Deore |
| 4 · Alta | Ultegra, Rival, Force | XT, GX, SRAM Eagle 90 | |
| 5 · Tope | Dura-Ace, Red, Campagnolo Record / Super Record | XTR, X0, XX, XX SL | |

Los grupos sin línea concreta ("Shimano", "SRAM") y los nulos quedan como dato ausente, que puntúa neutro. La tabla vivirá en `src/lib/recommender/tiers.ts`.

## 5. Tallas: la parte delicada

- 6.881 tallas; para cualquier altura entre 155 y 200 cm hay entre 800 y 1.450 bicis con una talla que la cubre. 150 cm es el extremo flojo (540).
- **494 saltos de más de 5 cm** entre una talla y la siguiente (alturas que ninguna talla cubre) y **890 solapes de 5 cm o más** (dos tallas válidas).
- **34 % de las alturas son estimadas** (`rider_height_source = estimado`).

Por eso el recomendador de talla tendrá tres resultados posibles, todos visibles para el usuario:
1. **Tu talla:** la altura cae en el rango oficial.
2. **Tu talla (estimada):** la altura cae en un rango estimado. Se muestra el aviso "la marca no publica tabla de tallas".
3. **Entre dos tallas:** hay solape o hueco. Se muestran las dos y, si hay stack/reach, se explica cuál es más cómoda (más stack) y cuál más deportiva.

## 6. Propuesta de preguntas (6, una por pantalla)

| # | Pregunta | Opciones → datos | Tipo |
|---|---|---|---|
| 1 | **¿Para qué la quieres?** | Carretera rápida → competición, aero · Carretera larga y cómoda → endurance · Caminos y gravel → gravel, ciclocross · Montaña suave → xc · Montaña técnica → trail, enduro, descenso · Ciudad y desplazamientos → urbana, cargo · Viajes y paseos → trekking · Para un niño → infantil | filtro duro |
| 2 | **¿Eléctrica?** | Sí · No · Me da igual. Solo se pregunta si hay eléctricas para ese uso | filtro duro |
| 3 | **¿Cuánto quieres gastar?** | Selector de rango con **contador en vivo** de bicis que quedan; tolerancia +10 % marcada como "un poco por encima" | filtro duro (+ suave) |
| 4 | **¿Cuánto mides?** (cm) | Debe existir una talla que te encaje (§5). En infantil, la altura del niño | filtro duro |
| 5 | **¿Cuánto montas?** | Empiezo · Salgo a menudo · Compito o entreno en serio. Ajusta la geometría preferida y la gama esperada | puntuación |
| 6 | **¿Qué es lo más importante para ti?** (elige hasta 2) | Comodidad · Ligereza · Mejores componentes · Gastar lo menos posible · Versatilidad · Autonomía (solo eléctricas) · Lista para ciudad (solo urbana) | puntuación |

Descartadas por ahora: la entrepierna (ningún cálculo la usa; el standover solo está en un 64 %), el material (se nota en el peso y la gama, y el usuario medio no sabe elegirlo) y la marca (es un filtro del comparador, no una pregunta de guía).

## 7. Propuesta de puntuación (0–100)

`puntuación = 25 · talla + 20 · valor + 55 · prioridades`, con los pesos en `weights.ts`. Cada componente vale de 0 a 1, y **un dato ausente vale 0,5 y resta confianza**.

| Componente | Cálculo |
|---|---|
| **Talla** | oficial 1 · estimada 0,8 · entre tallas 0,6 |
| **Valor** | gama de grupo frente al precio, comparada dentro de su categoría (y si es eléctrica). Responde a "a este precio, ¿lleva buenos componentes?" |
| **Comodidad** | relación stack/reach frente a las bicis de su mismo uso (más alta = más erguida). Si la persona empieza, cuenta aunque no la elija |
| **Ligereza** | percentil de peso dentro de su categoría y tipo (eléctrica o no) |
| **Componentes** | gama del grupo (1–5) + cambio electrónico, frenos hidráulicos |
| **Gastar menos** | cuánto margen deja respecto al presupuesto |
| **Versatilidad** | ancho de cubierta, paso de rueda máximo, tubeless |
| **Autonomía** | Wh de batería (95 % de cobertura) |
| **Lista para ciudad** | luces + guardabarros + portabultos + caballete (100 %) |
| **Nivel "compito"** | prima la disciplina de competición y aero y la gama 4–5 |

Reglas de presentación:
- **Máximo 2 variantes del mismo modelo** entre los primeros resultados. Con unas 5 variantes por modelo, si no se limita, la lista se llena de versiones casi iguales.
- Las bicis sin stock (4) no aparecen.
- Cada resultado lleva **2 o 3 razones** generadas de sus mejores componentes ("talla M oficial para 1,78 m", "Shimano 105 a 1.899 €: gama media por debajo de la mediana", "11,2 kg, de las más ligeras de su tipo") y los **avisos** de datos que faltan.

## 8. Riesgos y avisos de calidad

1. **Imágenes enlazadas en caliente** al 100 %: las marcas pueden bloquearlas o cambiarlas. Antes del lanzamiento conviene copiarlas a Supabase Storage (la columna `media.storage_path` ya existe).
2. **Nadie ha revisado las specs a mano** (`specs_reviewed_at` 0 %). Antes de publicar, hay que revisar una muestra por marca.
3. Frenos: "disco" (57) es ambiguo frente a hidráulico o mecánico.
4. El año de modelo solo está en el 47 %, así que no puede usarse para ordenar por "más nuevo".
5. Solo hay 11 marcas y el catálogo de entrada es escaso, sobre todo en carretera, gravel y por debajo de 1.000 €. El MVP es honesto si lo dice ("analizamos 1.636 bicis de 11 marcas").
6. El rol `roodada_lectura` tiene `bypassrls`: es solo para estos scripts y su clave solo está en `.env.local`. La web usará la publishable key.

## 9. Decisiones que necesito

1. ¿Te encajan las **6 preguntas** y sus opciones de §6?
2. ¿Te encajan los **pesos** (25 talla / 20 valor / 55 prioridades) como punto de partida?
3. `score_formulas` v1 ("nota calidad-precio") existe pero no está calculada. ¿La dejamos para más adelante y el MVP usa solo el recomendador, o quieres mostrar una nota general en las fichas?
4. Imágenes: ¿las copiamos a Storage antes de lanzar o arrancamos enlazando a las marcas?
