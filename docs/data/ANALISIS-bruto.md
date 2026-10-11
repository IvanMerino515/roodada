# Análisis bruto de la base · 2026-10-11

Esquema `public`. Generado por `scripts/analysis/run.ts`; no editar a mano.

## assistant_messages (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **session_id** (uuid) — —
- **role** (text) — — — 
- **content** (text) — — — 
- **tool_name** (text) — — — 
- **tool_payload** (jsonb) — —
- **created_at** (timestamp with time zone) — —

## assistant_sessions (tabla) · 0 filas

- **id** (uuid) — —
- **user_id** (uuid) — —
- **anonymous_id** (text) — — — 
- **started_at** (timestamp with time zone) — —
- **prompt_version** (text) — — — 
- **model** (text) — — — 
- **filters** (jsonb) — —
- **ai_disclosure_shown** (boolean) — — — 
- **completed** (boolean) — — — 

## brand_categories (tabla) · 1205 filas

- **brand_id** (bigint) — 100 % — min 1 · p25 180 · mediana 365 · p75 536 · máx 711
- **category_id** (bigint) — 100 % — min 1 · p25 5 · mediana 7 · p75 21 · máx 33

## brand_sources (tabla) · 821 filas

- **brand_id** (bigint) — 100 % — min 1 · p25 171 · mediana 343 · p75 523 · máx 711
- **source_id** (bigint) — 100 % — min 1 · p25 4 · mediana 36 · p75 36 · máx 36

## brands (tabla) · 711 filas

- **id** (bigint) — 100 % — min 1 · p25 178.5 · mediana 356 · p75 533.5 · máx 711
- **slug** (text) — 100 % — texto libre (>40 valores distintos)
- **name** (text) — 100 % — texto libre (>40 valores distintos)
- **hq_country_code** (character(2)) — 100 % — US (132) · CN (111) · DE (84) · IT (71) · GB (65) · ES (37) · TW (30) · FR (29) · NL (23) · CA (18) · CH (15) · BE (11) · JP (9) · SE (9) · AU (9) · CZ (8) · FI (5) · AT (5) · DK (5) · PL (4) · NO (3) · SK (3) · PT (2) · HU (2) · ZA (2) · IL (2) · TR (2) · GR (2) · TH (1) · EE (1) · AD (1) · SI (1) · IS (1) · NZ (1) · RO (1) · BR (1) · ID (1) · LV (1) · KR (1) · HK (1)
- **origin_block** (text) — 100 % — occidental (555) · china (112) · taiwan (31) · otros_asia (12) · mixto (1)
- **corporate_group_id** (bigint) — 16 % — min 1 · p25 4 · mediana 13.5 · p75 24.75 · máx 35
- **website** (text) — 0 % — 
- **status** (text) — 100 % — desconocido (564) · activa (132) · en_concurso (10) · retirada (3) · pausada (2)
- **status_note** (text) — 6 % — Verificar (21) · Quiebra filial NL (ago 2026) (5) · Retirada (2) · Insolvencia en autoadministración (ago 2026) (2) · Relanzada (2) · Pausada (1) · Vendida por Accell (2025) (1) · En reorganización judicial (Francia, 2026) (1) · Insolvencia (2026) (1) · Proceso propio tras quiebra de Accell (2026) (1) · Nuevo propietario 2026 (1) · Adquirida (dic 2025) (1) · Pausada (2026) (1) · Comprada tras quiebra (1) · Relanzada (2026) (1) · Nueva marca (2026) (1)
- **positioning** (text) — 53 % — Media (126) · Entrada (68) · Alta (64) · Premium (44) · Media-Alta (35) · Entrada-Media (34) · Entrada-Alta (3) · Entrada-Premium (2)
- **sales_channel** (text) — 53 % — Tiendas (234) · Directo (58) · Directo + tiendas (11) · Amazon (11) · Online (7) · Gran superficie (7) · Distribuidores (6) · Directo (DTC) (6) · Decathlon (5) · Directo + Amazon (5) · Halfords (4) · Online + distribuidores (3) · Tiendas + online (3) · Directo + distribuidores (2) · Directo (almacén en Europa) (1) · Tiendas + Amazon (1) · Tiendas + personalización (1) · Tiendas + distribuidores (1) · Directo (Bike-Discount) (1) · Online + OEM (1) · Evans Cycles (1) · Directo + tiendas propias (1) · Distribuidores + directo (1) · REI (1) · Directo (configurador) (1) · Directo (personalización) (1) · Directo (almacenes EE. UU./Alemania/Japón) (1) · Online + tiendas Xiaomi (1)
- **makes_ebikes** (boolean) — 100 % — false (486) · true (225)
- **mvp_priority** (character(1)) — 100 % — C (443) · B (148) · A (120)
- **verified** (boolean) — 100 % — false (410) · true (301)
- **notes** (text) — 35 % — texto libre (>40 valores distintos)
- **created_at** (timestamp with time zone) — 100 %
- **updated_at** (timestamp with time zone) — 100 %

## categories (tabla) · 34 filas

- **id** (bigint) — 100 % — min 1 · p25 9.25 · mediana 17.5 · p75 25.75 · máx 34
- **parent_id** (bigint) — 91 % — min 1 · p25 2 · mediana 2 · p75 3 · máx 3
- **slug** (text) — 100 % — accesorio-guantes (1) · bici (1) · componente-tijas (1) · componente-transmision (1) · componente-motores (1) · componente (1) · componente-frenos (1) · bici-urbana (1) · accesorio (1) · componente-suspension (1) · componente-pedales (1) · componente-ruedas (1) · accesorio-portabicis (1) · componente-cadenas (1) · componente-neumaticos (1) · bici-gravel (1) · componente-sillines (1) · componente-bielas-pedalier (1) · accesorio-bolsas (1) · bici-infantil (1) · accesorio-luces (1) · bici-carretera (1) · accesorio-candados (1) · accesorio-herramientas (1) · bici-mtb (1) · accesorio-gafas (1) · componente-electronica (1) · accesorio-cascos (1) · accesorio-ropa (1) · accesorio-rodillos (1) · accesorio-protecciones (1) · accesorio-zapatillas (1) · componente-cockpit (1) · accesorio-bidones (1)
- **name_es** (text) — 100 % — Motores eBike (1) · Electrónica (GPS, potenciómetro, sensores) (1) · Tijas (incl. telescópicas) (1) · Ruedas / llantas / bujes (1) · Urbana y trekking (1) · Bielas / pedalier (1) · Manillar / potencia / cinta (1) · Carretera (1) · Cascos (1) · Gravel (1) · Cadenas (1) · Zapatillas (1) · Gafas (1) · Herramientas / bombas / lubricantes (1) · Bicis (1) · Componentes (1) · Bolsas / bikepacking / mochilas (1) · Transmisión / grupos (1) · Accesorios (1) · Infantil (1) · Sillines (1) · Protecciones (1) · Rodillos (1) · Candados (1) · Luces / radar (1) · Guantes (1) · Neumáticos / tubeless (1) · Ropa (maillot, culotte, chaquetas) (1) · Pedales (1) · Portabicis / sillas / remolques (1) · MTB (1) · Bidones / portabidones (1) · Frenos / discos / pastillas (1) · Suspensión (1)
- **kind** (text) — 100 % — componente (14) · accesorio (14) · bici (6)
- **sort_order** (smallint) — 100 % — min 0 · p25 7.25 · mediana 15.5 · p75 23.75 · máx 32
- **created_at** (timestamp with time zone) — 100 %

## category_spec_schemas (tabla) · 2 filas

- **category_id** (bigint) — 100 % — min 1 · p25 6 · mediana 11 · p75 16 · máx 21
- **json_schema** (jsonb) — 100 %
- `json_schema.$schema` — 100 % — http://json-schema.org/draft-07/schema# (2)
- `json_schema.additionalProperties` — 100 % — false (1) · true (1)
- `json_schema.description` — 50 % — Mismo criterio para todas las marcas. Unidades: mm, grados, Wh, Nm, kg. null = la marca no lo publica. (1)
- `json_schema.properties` — objeto, 100 %
- `json_schema.properties.assist_speed_kmh` — objeto, 50 %
- `json_schema.properties.assist_speed_kmh.maximum` — 50 % — min 46 · p25 46 · mediana 46 · p75 46 · máx 46
- `json_schema.properties.assist_speed_kmh.minimum` — 50 % — min 20 · p25 20 · mediana 20 · p75 20 · máx 20
- `json_schema.properties.assist_speed_kmh.type` — 50 % — array
- `json_schema.properties.axle_front` — objeto, 50 %
- `json_schema.properties.axle_front.pattern` — 50 % — ^([0-9]{2}x[0-9]{3}|cierre_rapido)$ (1)
- `json_schema.properties.axle_front.type` — 50 % — array
- `json_schema.properties.axle_rear` — objeto, 50 %
- `json_schema.properties.axle_rear.pattern` — 50 % — ^([0-9]{2}x[0-9]{3}|cierre_rapido)$ (1)
- `json_schema.properties.axle_rear.type` — 50 % — array
- `json_schema.properties.battery_wh` — objeto, 50 %
- `json_schema.properties.battery_wh.maximum` — 50 % — min 2000 · p25 2000 · mediana 2000 · p75 2000 · máx 2000
- `json_schema.properties.battery_wh.minimum` — 50 % — min 100 · p25 100 · mediana 100 · p75 100 · máx 100
- `json_schema.properties.battery_wh.type` — 50 % — array
- `json_schema.properties.brakes` — objeto, 50 %
- `json_schema.properties.brakes.enum` — 50 % — array
- `json_schema.properties.cassette_range` — objeto, 50 %
- `json_schema.properties.cassette_range.pattern` — 50 % — ^[0-9]{1,2}-[0-9]{2}$ (1)
- `json_schema.properties.cassette_range.type` — 50 % — array
- `json_schema.properties.certifications` — objeto, 50 %
- `json_schema.properties.certifications.items` — 50 % — object
- `json_schema.properties.certifications.type` — 50 % — array (1)
- `json_schema.properties.chainrings` — objeto, 50 %
- `json_schema.properties.chainrings.pattern` — 50 % — ^[0-9]{2}(/[0-9]{2}){0,2}$ (1)
- `json_schema.properties.chainrings.type` — 50 % — array
- `json_schema.properties.discipline` — objeto, 50 %
- `json_schema.properties.discipline.enum` — 50 % — array
- `json_schema.properties.drivetrain` — objeto, 50 %
- `json_schema.properties.drivetrain.enum` — 50 % — array
- `json_schema.properties.dropper_post` — objeto, 50 %
- `json_schema.properties.dropper_post.type` — 50 % — boolean (1)
- `json_schema.properties.fenders` — objeto, 50 %
- `json_schema.properties.fenders.type` — 50 % — boolean (1)
- `json_schema.properties.groupset` — objeto, 50 %
- `json_schema.properties.groupset.type` — 50 % — array
- `json_schema.properties.groupset_brand` — objeto, 50 %
- `json_schema.properties.groupset_brand.type` — 50 % — array
- `json_schema.properties.has_light` — objeto, 50 %
- `json_schema.properties.has_light.type` — 50 % — boolean (1)
- `json_schema.properties.kickstand` — objeto, 50 %
- `json_schema.properties.kickstand.type` — 50 % — boolean (1)
- `json_schema.properties.lights` — objeto, 50 %
- `json_schema.properties.lights.type` — 50 % — boolean (1)
- `json_schema.properties.max_system_weight_kg` — objeto, 50 %
- `json_schema.properties.max_system_weight_kg.maximum` — 50 % — min 300 · p25 300 · mediana 300 · p75 300 · máx 300
- `json_schema.properties.max_system_weight_kg.minimum` — 50 % — min 50 · p25 50 · mediana 50 · p75 50 · máx 50
- `json_schema.properties.max_system_weight_kg.type` — 50 % — array
- `json_schema.properties.max_tyre_width_mm` — objeto, 50 %
- `json_schema.properties.max_tyre_width_mm.maximum` — 50 % — min 130 · p25 130 · mediana 130 · p75 130 · máx 130
- `json_schema.properties.max_tyre_width_mm.minimum` — 50 % — min 15 · p25 15 · mediana 15 · p75 15 · máx 15
- `json_schema.properties.max_tyre_width_mm.type` — 50 % — array
- `json_schema.properties.motor` — objeto, 50 %
- `json_schema.properties.motor.additionalProperties` — 50 % — false (1)
- `json_schema.properties.motor.properties` — 50 % — object
- `json_schema.properties.motor.type` — 50 % — array
- `json_schema.properties.pedals_included` — objeto, 50 %
- `json_schema.properties.pedals_included.type` — 50 % — boolean (1)
- `json_schema.properties.power_meter` — objeto, 50 %
- `json_schema.properties.power_meter.type` — 50 % — boolean (1)
- `json_schema.properties.rack` — objeto, 50 %
- `json_schema.properties.rack.type` — 50 % — boolean (1)
- `json_schema.properties.range_extender` — objeto, 50 %
- `json_schema.properties.range_extender.type` — 50 % — boolean (1)
- `json_schema.properties.rotational_protection` — objeto, 50 %
- `json_schema.properties.rotational_protection.type` — 50 % — string (1)
- `json_schema.properties.rotor_front_mm` — objeto, 50 %
- `json_schema.properties.rotor_front_mm.maximum` — 50 % — min 230 · p25 230 · mediana 230 · p75 230 · máx 230
- `json_schema.properties.rotor_front_mm.minimum` — 50 % — min 120 · p25 120 · mediana 120 · p75 120 · máx 120
- `json_schema.properties.rotor_front_mm.type` — 50 % — array
- `json_schema.properties.rotor_rear_mm` — objeto, 50 %
- `json_schema.properties.rotor_rear_mm.maximum` — 50 % — min 230 · p25 230 · mediana 230 · p75 230 · máx 230
- `json_schema.properties.rotor_rear_mm.minimum` — 50 % — min 120 · p25 120 · mediana 120 · p75 120 · máx 120
- `json_schema.properties.rotor_rear_mm.type` — 50 % — array
- `json_schema.properties.seatpost_diameter_mm` — objeto, 50 %
- `json_schema.properties.seatpost_diameter_mm.maximum` — 50 % — min 36 · p25 36 · mediana 36 · p75 36 · máx 36
- `json_schema.properties.seatpost_diameter_mm.minimum` — 50 % — min 25 · p25 25 · mediana 25 · p75 25 · máx 25
- `json_schema.properties.seatpost_diameter_mm.type` — 50 % — array
- `json_schema.properties.shifting` — objeto, 50 %
- `json_schema.properties.shifting.enum` — 50 % — array
- `json_schema.properties.sizes_cm` — objeto, 50 %
- `json_schema.properties.sizes_cm.items` — 50 % — object
- `json_schema.properties.sizes_cm.type` — 50 % — array (1)
- `json_schema.properties.speeds` — objeto, 50 %
- `json_schema.properties.speeds.maximum` — 50 % — min 14 · p25 14 · mediana 14 · p75 14 · máx 14
- `json_schema.properties.speeds.minimum` — 50 % — min 1 · p25 1 · mediana 1 · p75 1 · máx 1
- `json_schema.properties.speeds.type` — 50 % — array
- `json_schema.properties.suspension` — objeto, 50 %
- `json_schema.properties.suspension.enum` — 50 % — array
- `json_schema.properties.suspension_front_mm` — objeto, 50 %
- `json_schema.properties.suspension_front_mm.maximum` — 50 % — min 250 · p25 250 · mediana 250 · p75 250 · máx 250
- `json_schema.properties.suspension_front_mm.minimum` — 50 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- `json_schema.properties.suspension_front_mm.type` — 50 % — array
- `json_schema.properties.suspension_rear_mm` — objeto, 50 %
- `json_schema.properties.suspension_rear_mm.maximum` — 50 % — min 250 · p25 250 · mediana 250 · p75 250 · máx 250
- `json_schema.properties.suspension_rear_mm.minimum` — 50 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- `json_schema.properties.suspension_rear_mm.type` — 50 % — array
- `json_schema.properties.tubeless_ready` — objeto, 50 %
- `json_schema.properties.tubeless_ready.type` — 50 % — array
- `json_schema.properties.tyre_width_mm` — objeto, 50 %
- `json_schema.properties.tyre_width_mm.maximum` — 50 % — min 130 · p25 130 · mediana 130 · p75 130 · máx 130
- `json_schema.properties.tyre_width_mm.minimum` — 50 % — min 15 · p25 15 · mediana 15 · p75 15 · máx 15
- `json_schema.properties.tyre_width_mm.type` — 50 % — array
- `json_schema.properties.tyre_width_rear_mm` — objeto, 50 %
- `json_schema.properties.tyre_width_rear_mm.maximum` — 50 % — min 130 · p25 130 · mediana 130 · p75 130 · máx 130
- `json_schema.properties.tyre_width_rear_mm.minimum` — 50 % — min 15 · p25 15 · mediana 15 · p75 15 · máx 15
- `json_schema.properties.tyre_width_rear_mm.type` — 50 % — array
- `json_schema.properties.weight_note` — objeto, 50 %
- `json_schema.properties.weight_note.type` — 50 % — array
- `json_schema.properties.wheel_size` — objeto, 50 %
- `json_schema.properties.wheel_size.enum` — 50 % — array
- `json_schema.required` — 50 % — array
- `json_schema.title` — 50 % — Especificaciones homogéneas de bicicleta completa (1)
- `json_schema.type` — 100 % — object (2)
- **version** (integer) — 100 % — min 1 · p25 1 · mediana 1 · p75 1 · máx 1
- **updated_at** (timestamp with time zone) — 100 %

## corporate_groups (tabla) · 35 filas

- **id** (bigint) — 100 % — min 1 · p25 9.5 · mediana 18 · p75 26.5 · máx 35
- **name** (text) — 100 % — Pon Holdings (1) · Lavoie (McLaren Applied) (1) · Wheeltop (1) · Shimano (1) · Advanced Sports International (ASI) (1) · Trek (1) · American Bicycle Group (1) · ICAN (1) · SRAM (1) · Winspace (1) · Cycleurope (Grimaldi) (1) · Madison (1) · United Wheels (1) · Farsports (1) · ReBirth Group (1) · Selle Royal Group (1) · Garmin (1) · Giant Group (1) · Halfords (1) · Lectric (1) · Specialized (1) · XDS (1) · Scott Sports (1) · Fox Factory (1) · Manifattura Valcismon (1) · DJI (1) · Decathlon (1) · Life Electric Vehicles (1) · Magene (1) · Haro (1) · QBP (1) · Accell Group (1) · ZEG (1) · Pierer (bicis) (1) · Derby Cycle (Pon) (1)
- **hq_country_code** (character(2)) — 100 % — US (12) · CN (7) · GB (3) · DE (2) · IT (2) · NL (2) · FR (2) · SE (1) · AT (1) · JP (1) · CH (1) · TW (1)
- **notes** (text) — 100 % — Fox, Marzocchi, Race Face, Easton (1) · Giant, Liv, Momentum, CADEX (1) · Specialized, Roval, S-Works. Merida con participación minoritaria (1) · Wheeltop, Rotor (mayoría) (1) · XDS, X-Lab (1) · Peugeot Cycles, Gitane, Solex, Cowboy. Adquirió Cowboy en dic 2025. Red de 95 tiendas Oxygen y unos 500 distribuidores (1) · Salsa, Surly (1) · Trek, Electra, Diamant, Villiger, Bontrager (1) · Haibike, Winora, Ghost, Batavus, Sparta, Koga, Lapierre, Raleigh, Babboe, Carqon, XLC. Quiebra de las sociedades neerlandesas (11 ago 2026). Cada marca sigue su propio proceso; unos 60 interesados en comprar (1) · Fuji, Kestrel, Breezer, SE Bikes (1) · VanMoof (1) · Bianchi, Crescent, Monark, DBS, Kildemoes, Legnano. Lista de Wikipedia probablemente desactualizada (incluye Gitane, hoy de ReBirth) (1) · Gazelle, Cervélo, Santa Cruz, Juliana, Cannondale, Focus, Kalkhoff, Rixe, Univega, Urban Arrow, Schwinn, Mongoose, GT. Compró la división de bicis de Dorel en 2021. GT en pausa (1) · Shimano, PRO, Lazer (verificar) (1) · Magene, Exar (1) · Haro, Masi (1) · Genesis, Ridgeback, Saracen (verificar) (1) · Focus, Kalkhoff, Rixe, Univega (1) · Bulls, Pegasus. Cooperativa de tiendas (1) · Boardman, Carrera (UK), Apollo, Voodoo. Marcas propias de la cadena (1) · Scott, Bergamont, Syncros, Bold Cycles (1) · Garmin, Tacx (1) · Farsports, Wheelsfar (1) · Huffy, Niner, Buzz. Niner y Buzz pausadas en 2026 (1) · Lectric eBikes, Juiced Bikes, Monarc. Juiced relanzada y Monarc creada en 2026 (1) · Van Rysel, Rockrider, Riverside, Elops, B'Twin (1) · Husqvarna E-Bicycles, GasGas, R Raymon, Felt (verificar). Liquidación de stock de Husqvarna y GasGas a finales de 2025 (1) · Rad Power Bikes. Compró los activos tras la quiebra (2026) (1) · Castelli, Sportful (1) · ICAN, Triaero (1) · Litespeed, Quintana Roo (1) · Winspace, Lún (1) · SRAM, RockShox, Zipp, Quarq, Hammerhead, Time (pedales), Truvativ (1) · Selle Royal, Fizik, Brooks, Crankbrothers (verificar) (1) · Amflow, Avinox (motor) (1)
- **created_at** (timestamp with time zone) — 100 %
- **updated_at** (timestamp with time zone) — 100 %

## external_reviews (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **model_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **publisher** (text) — — — 
- **title** (text) — — — 
- **url** (text) — — — 
- **published_on** (date) — —
- **summary_es** (text) — — — 
- **created_at** (timestamp with time zone) — —

## filter_definitions (tabla) · 21 filas

- **id** (bigint) — 100 % — min 1 · p25 6 · mediana 11 · p75 16 · máx 21
- **category_id** (bigint) — 100 % — min 1 · p25 1 · mediana 1 · p75 1 · máx 6
- **key** (text) — 100 % — precio (1) · suspension (1) · velocidades (1) · cubierta (1) · marca (1) · rueda (1) · material (1) · frenos (1) · peso (1) · recorrido_del (1) · tija_telescopica (1) · recorrido_tras (1) · electrica (1) · bateria (1) · origen (1) · transmision (1) · disciplina (1) · paso_rueda (1) · nota (1) · grupo (1) · cambio_electronico (1)
- **label_es** (text) — 100 % — Paso de rueda máximo (1) · Peso (1) · Frenos (1) · Grupo de transmisión (1) · Eléctrica (1) · Velocidades (1) · Origen de la marca (1) · Uso (1) · Platos (1) · Tamaño de rueda (1) · Cambio (1) · Recorrido trasero (1) · Recorrido delantero (1) · Marca (1) · Precio final (1) · Ancho de cubierta (1) · Nota calidad-precio (1) · Material del cuadro (1) · Batería (1) · Suspensión (1) · Tija telescópica (1)
- **source** (text) — 100 % — specs (14) · columna (7)
- **path** (text) — 100 % — origin_block (1) · suspension (1) · max_tyre_width_mm (1) · speeds (1) · tyre_width_mm (1) · wheel_size (1) · drivetrain (1) · battery_wh (1) · discipline (1) · weight_g (1) · dropper_post (1) · is_electric (1) · brakes (1) · shifting (1) · suspension_rear_mm (1) · suspension_front_mm (1) · best_final_price_cents (1) · brand_slug (1) · score_total (1) · groupset (1) · frame_material (1)
- **data_type** (text) — 100 % — opcion (9) · numero (9) · booleano (2) · texto (1)
- **unit** (text) — 33 % — mm (4) · € (1) · g (1) · Wh (1)
- **options** (jsonb) — 38 %
- **is_facet** (boolean) — 100 % — true (21)
- **sort_order** (smallint) — 100 % — min 0 · p25 5 · mediana 10 · p75 15 · máx 20

## media (tabla) · 6536 filas

- **id** (bigint) — 100 % — min 1 · p25 1634.75 · mediana 3268.5 · p75 4902.25 · máx 6536
- **variant_id** (bigint) — 100 % — min 1 · p25 420.75 · mediana 856.5 · p75 1357 · máx 1636
- **model_id** (bigint) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **storage_path** (text) — 0 % — 
- **source_url** (text) — 100 % — texto libre (>40 valores distintos)
- **license** (text) — 100 % — Enlace a la web oficial de la marca, sin licencia: pedir kit de prensa o permiso antes de publicar (6536)
- **alt_es** (text) — 100 % — texto libre (>40 valores distintos)
- **sort_order** (smallint) — 100 % — min 0 · p25 0 · mediana 2 · p75 3 · máx 100
- **created_at** (timestamp with time zone) — 100 %
- **kind** (text) — 100 % — foto (6353) · geometria (183)

## media_urls (vista) · 6536 filas

- **id** (bigint) — 100 % — min 1 · p25 1634.75 · mediana 3268.5 · p75 4902.25 · máx 6536
- **variant_id** (bigint) — 100 % — min 1 · p25 420.75 · mediana 856.5 · p75 1357 · máx 1636
- **model_id** (bigint) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **storage_path** (text) — 0 % — 
- **source_url** (text) — 100 % — texto libre (>40 valores distintos)
- **license** (text) — 100 % — Enlace a la web oficial de la marca, sin licencia: pedir kit de prensa o permiso antes de publicar (6536)
- **alt_es** (text) — 100 % — texto libre (>40 valores distintos)
- **sort_order** (smallint) — 100 % — min 0 · p25 0 · mediana 2 · p75 3 · máx 100
- **created_at** (timestamp with time zone) — 100 %
- **kind** (text) — 100 % — foto (6353) · geometria (183)
- **is_hotlink** (boolean) — 100 % — true (6536)
- **original_url** (text) — 100 % — texto libre (>40 valores distintos)

## models (tabla) · 307 filas

- **id** (bigint) — 100 % — min 1 · p25 77.5 · mediana 154 · p75 230.5 · máx 307
- **brand_id** (bigint) — 100 % — min 55 · p25 101 · mediana 383 · p75 570 · máx 659
- **category_id** (bigint) — 100 % — min 4 · p25 5 · mediana 6 · p75 7 · máx 34
- **slug** (text) — 100 % — texto libre (>40 valores distintos)
- **name** (text) — 100 % — texto libre (>40 valores distintos)
- **description_es** (text) — 0 % — 
- **first_year** (smallint) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **created_at** (timestamp with time zone) — 100 %
- **updated_at** (timestamp with time zone) — 100 %

## offers (tabla) · 1636 filas

- **id** (bigint) — 100 % — min 1 · p25 409.75 · mediana 818.5 · p75 1227.25 · máx 1636
- **store_id** (bigint) — 100 % — min 1 · p25 2 · mediana 4 · p75 19 · máx 21
- **variant_id** (bigint) — 100 % — min 1 · p25 409.75 · mediana 818.5 · p75 1227.25 · máx 1636
- **variant_size_id** (bigint) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **store_sku** (text) — 0 % — 
- **url** (text) — 100 % — texto libre (>40 valores distintos)
- **affiliate_url** (text) — 0 % — 
- **condition** (text) — 100 % — nuevo (1636)
- **price_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **shipping_cents** (integer) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **duties_taxes_cents** (integer) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **final_price_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **in_stock** (boolean) — 100 % — true (1632) · false (4)
- **is_active** (boolean) — 100 % — true (1636)
- **last_checked_at** (timestamp with time zone) — 100 %
- **price_changed_at** (timestamp with time zone) — 100 %
- **created_at** (timestamp with time zone) — 100 %

## outbound_clicks (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **offer_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **session_id** (uuid) — —
- **user_id** (uuid) — —
- **source_page** (text) — — — 
- **final_price_cents_at_click** (integer) — — — min null · p25 null · mediana null · p75 null · máx null
- **clicked_at** (timestamp with time zone) — —

## price_alerts (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **user_id** (uuid) — —
- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **variant_size_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **target_price_cents** (integer) — — — min null · p25 null · mediana null · p75 null · máx null
- **is_active** (boolean) — — — 
- **last_notified_at** (timestamp with time zone) — —
- **created_at** (timestamp with time zone) — —

## price_history (tabla) · 1633 filas

- **id** (bigint) — 100 % — min 1 · p25 409 · mediana 817 · p75 1225 · máx 1633
- **offer_id** (bigint) — 100 % — min 1 · p25 409 · mediana 819 · p75 1228 · máx 1636
- **valid_from** (timestamp with time zone) — 100 %
- **price_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **shipping_cents** (integer) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **duties_taxes_cents** (integer) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **final_price_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **in_stock** (boolean) — 100 % — true (1629) · false (4)

## profiles (tabla) · 0 filas

- **id** (uuid) — —
- **display_name** (text) — — — 
- **height_cm** (smallint) — — — min null · p25 null · mediana null · p75 null · máx null
- **inseam_cm** (smallint) — — — min null · p25 null · mediana null · p75 null · máx null
- **created_at** (timestamp with time zone) — —
- **updated_at** (timestamp with time zone) — —

## recommendations (tabla) · 0 filas

- **session_id** (uuid) — —
- **rank** (smallint) — — — min null · p25 null · mediana null · p75 null · máx null
- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **variant_size_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **reason_es** (text) — — — 
- **created_at** (timestamp with time zone) — —

## score_formulas (tabla) · 1 filas

- **version** (integer) — 100 % — min 1 · p25 1 · mediana 1 · p75 1 · máx 1
- **weights** (jsonb) — 100 %
- `weights.componentes` — 100 % — min 0.3 · p25 0.3 · mediana 0.3 · p75 0.3 · máx 0.3
- `weights.cuadro` — 100 % — min 0.2 · p25 0.2 · mediana 0.2 · p75 0.2 · máx 0.2
- `weights.peso` — 100 % — min 0.15 · p25 0.15 · mediana 0.15 · p75 0.15 · máx 0.15
- `weights.posventa` — 100 % — min 0.1 · p25 0.1 · mediana 0.1 · p75 0.1 · máx 0.1
- `weights.precio` — 100 % — min 0.25 · p25 0.25 · mediana 0.25 · p75 0.25 · máx 0.25
- **description_es** (text) — 100 % — Propuesta inicial: pesos por ajustar antes de publicar notas (1)
- **created_at** (timestamp with time zone) — 100 %

## sources (tabla) · 36 filas

- **id** (bigint) — 100 % — min 1 · p25 9.75 · mediana 18.5 · p75 27.25 · máx 36
- **key** (text) — 100 % — KW (1) · BR (1) · ES4 (1) · CE (1) · ACC (1) · FI (1) · VMD (1) · ACC2 (1) · MM (1) · EQ (1) · ES3 (1) · SB (1) · CH (1) · RB (1) · OR (1) · GT (1) · CBI (1) · RAD (1) · K (1) · VM (1) · FP (1) · OC (1) · GS (1) · W (1) · NIN (1) · ES1 (1) · ORC (1) · BRK (1) · BM (1) · RC (1) · YT (1) · SS (1) · TM (1) · ES2 (1) · LEC (1) · EBM (1)
- **title** (text) — 100 % — Electric Bike Explorer – Accell Group bankruptcy (ago 2026) (1) · Silent Streets – Best Engwe alternative in Europe (1) · TechCrunch – Lectric grew as VC-backed e-bike startups went bankrupt (jun 2026) (1) · Wikipedia – List of bicycle brands and manufacturing companies (1) · Tuvalum – Mejores MTB españolas (1) · Micromobility.io – What does 2026 hold for Cowboy? (1) · Singletrack – Sixty bidders for Accell's brands (sep 2026) (1) · Fiido ES – Dónde comprar una bicicleta eléctrica china (1) · VeloMedia – The rise of China: are Western brands ready? (1) · BIKE Magazin – Bicycle industry in crisis (seguimiento 2025-2026) (1) · OfertasCiclismo – Marcas de bicicletas españolas (1) · KiWAV – 250+ eBike Brands in 2026 (1) · Cycling Industry News – Cowboy completes acquisition by ReBirth (dic 2025) (1) · ebikemag.eu – Problems of Accell Group (2026) (1) · off.road.cc – portada (titulares sobre Fazua y Five Ten) (1) · Ruta en Bici – Mejores marcas de bicis españolas (1) · GeekWire – Rad Power Bikes sells for $13.2M (2026) (1) · TodoMountainBike – Orange Bikes se declara en quiebra (ene 2024) (1) · EqualOcean – China's e-bike brands going global (dic 2025) (1) · Global Sources – Best Chinese Bike Brands (2026) (1) · Cyclists Hub – 11 Best Chinese Bicycle Brands (act. dic 2025) (1) · BikeRadar – The cycling industry always goes from boom to bust (2026) (1) · Wikipedia – GT Bicycles (1) · road.cc ebiketips – VanMoof S6 tras la compra de McLaren Applied (1) · road.cc – The rise of Chinese cycling brands (ene 2025) (1) · Justia Trademarks – Amflow Bicycles (Shenzhen) Co., Ltd. (1) · CB Insights – Cowboy (incluye nota sobre Sushi Bikes) (1) · Diario de un Campista – Marcas españolas de ciclismo (dic 2024) (1) · BikeRadar – 5 Chinese mountain bike brands you need to know about (1) · Conocimiento previo de la industria – sin fuente web en esta pasada (VERIFICAR) (1) · Pinkbike – YT Industries returns after Flossmann completes purchase (1) · Wikipedia – Niner (pausa 2026) (1) · Samebike – Top 10 China folding e-bike manufacturers (1) · FrontPack Sports – Six Chinese bike brands (2026) [solo extracto de búsqueda; la web bloquea la lectura] (1) · chinaelektro.de – Chinesische E-Bikes 2026 (1) · Bikepa – Marcas de bicis hechas en España (1)
- **url** (text) — 97 % — https://en.wikipedia.org/wiki/List_of_bicycle_brands_and_manufacturing_companies (1) · https://micromobility.io/news/what-does-2026-hold-for-cowboy (1) · https://road.cc/content/feature/rise-chinese-brands-312243 (1) · https://road.cc/ebiketips/tech-news/revived-e-bike-specialist-vanmoof-launches-the-s6-its-first-new-model-since-mclaren-applied-takeover (1) · https://equalocean.com/analysis/2025121921682-chinas-e-bike-brands-going-global-review-26-leading-players (1) · https://cyclingindustry.news/cowboy-completes-acquisition-by-rebirth-group-holding/ (1) · https://en.wikipedia.org/wiki/GT_Bicycles (1) · https://bikepa.es/marcas-de-bicicletas-espanolas/ (1) · https://ddcampista.wordpress.com/2024/12/28/marcas-espanolas-de-ciclismo-bicicletas-y-componentes/ (1) · https://singletrackworld.com/2026/09/accell-bankruptcy-sixty-bidders-haibike-ghost-lapierre-raleigh (1) · https://www.geekwire.com/2026/rad-power-bikes-asset-auction-attracts-two-successful-bidders-as-part-of-e-bike-makers-bankruptcy/ (1) · https://www.todomountainbike.net/general/orange-bikes-declara-quiebra-solicita-concurso-acreedores (1) · https://www.bikeradar.com/features/tech/5-chinese-mountain-bike-brands-you-need-to-know-about (1) · https://road.cc/offroad (1) · https://silentstreets.eu/de/electric-guides/best-engwe-alternative-in-europe/ (1) · https://www.cyclistshub.com/best-chinese-bicycle-brands/ (1) · https://www.ebikemag.eu/problems-of-the-european-e-bike-giant-accell-group-manufacturer-of-the-haibike-ghost-and-lapierre-brands/ (1) · https://www.gzsamebike.com/top-10-china-folding-electric-bike-manufacturers/ (1) · https://ofertasciclismo.es/marcas-de-bicicletas-espanolas/ (1) · https://en.wikipedia.org/wiki/Niner_(bicycle_company) (1) · https://techcrunch.com/2026/06/05/as-vc-backed-e-bike-startups-went-bankrupt-bootstrapped-lectric-grew/ (1) · https://velomedia.io/the-rise-of-china-are-western-brands-ready (1) · https://www.bike-magazin.de/en/about-us/magazine/backgrounds/bicycle-industry-in-crisis-sympatex-files-for-insolvency-what-s-next/ (1) · https://www.cbinsights.com/company/cowboy-bike (1) · https://www.pinkbike.com/news/yt-industries-returns-after-markus-flossmann-completes-purchase-of-the-brand.html (1) · https://frontpacksports.com/chinese-bike-brands-2026-xds-winspace-pardus-quickpro-seka-incolor/ (1) · https://electricbikeexplorer.com/accell-group-insolvency-ebike-brands/ (1) · https://trademark.justia.com/owners/amflow-bicycles-shenzhen-co-ltd-5565054 (1) · https://tuvalum.com/blog/mejores-mtb-espanolas/ (1) · https://www.bikeradar.com/features/opinion/cycling-industry-booms-and-busts (1) · https://es.fiido.com/blogs/news/where-to-buy-chinese-electric-bike (1) · https://www.globalsources.com/knowledge/chinese-bike-brands/ (1) · https://rutaenbici.online/mejores-marcas-bici-espanolas (1) · https://www.chinaelektro.de/e-bikes/ (1) · https://kiwavmotors.com/en/blog/a-complete-list-of-electric-bike-brands (1)
- **accessed_on** (date) — 100 %
- **created_at** (timestamp with time zone) — 100 %

## standards (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **kind** (text) — — — 
- **code** (text) — — — 
- **name_es** (text) — — — 

## stores (tabla) · 9 filas

- **id** (bigint) — 100 % — min 1 · p25 3 · mediana 5 · p75 19 · máx 21
- **slug** (text) — 100 % — trek-oficial-es (1) · bh-oficial-es (1) · decathlon-es (1) · cannondale-oficial-es (1) · canyon-oficial-es (1) · specialized-oficial-es (1) · orbea-oficial-es (1) · bianchi-oficial (1) · merida-oficial-es (1)
- **name** (text) — 100 % — Orbea España (web oficial) (1) · Trek España (web oficial) (1) · Canyon España (web oficial) (1) · Merida España (web oficial) (1) · Decathlon España (web oficial) (1) · Cannondale España (web oficial) (1) · Bianchi (web oficial, precio para España) (1) · BH España (web oficial) (1) · Specialized España (web oficial) (1)
- **kind** (text) — 100 % — marca_directa (9)
- **country_code** (character(2)) — 100 % — ES (8) · IT (1)
- **ships_from_eu** (boolean) — 100 % — true (9)
- **website** (text) — 100 % — https://www.merida-bikes.com/es-es (1) · https://www.orbea.com/es-es/ (1) · https://www.cannondale.com/es-es (1) · https://www.specialized.com/es/es (1) · https://www.bianchi.com/en/ (1) · https://www.bhbikes.com/es_ES (1) · https://www.canyon.com/es-es/ (1) · https://www.trekbikes.com/es/es_ES/ (1) · https://www.decathlon.es/es (1)
- **affiliate_network** (text) — 0 % — 
- **affiliate_program_ref** (text) — 0 % — 
- **is_active** (boolean) — 100 % — true (9)
- **created_at** (timestamp with time zone) — 100 %
- **updated_at** (timestamp with time zone) — 100 %

## user_reviews (tabla) · 0 filas

- **id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **user_id** (uuid) — —
- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **rating** (smallint) — — — min null · p25 null · mediana null · p75 null · máx null
- **body** (text) — — — 
- **verified_purchase** (boolean) — — — 
- **status** (text) — — — 
- **created_at** (timestamp with time zone) — —

## variant_components (tabla) · 38373 filas

- **variant_id** (bigint) — 100 % — min 1 · p25 408 · mediana 801 · p75 1214 · máx 1636
- **role** (text) — 100 % — texto libre (>40 valores distintos)
- **component_variant_id** (bigint) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **description** (text) — 100 % — texto libre (>40 valores distintos)

## variant_listing (vista materializada) · 1636 filas

- **variant_id** (bigint) — 100 % — min 1 · p25 409.75 · mediana 818.5 · p75 1227.25 · máx 1636
- **slug** (text) — 100 % — texto libre (>40 valores distintos)
- **variant_name** (text) — 100 % — texto libre (>40 valores distintos)
- **model_year** (smallint) — 47 % — min 2021 · p25 2025 · mediana 2026 · p75 2027 · máx 2027
- **is_electric** (boolean) — 100 % — false (999) · true (637)
- **frame_material** (text) — 90 % — carbono (790) · aluminio (681) · acero (4)
- **weight_g** (integer) — 47 % — min 3970 · p25 9492.5 · mediana 13670 · p75 21827.5 · máx 39600
- **msrp_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **specs** (jsonb) — 100 %
- `specs.assist_speed_kmh` — 10 % — min 25.0 · p25 25 · mediana 25 · p75 25 · máx 25.0
- `specs.axle_front` — 52 % — 12x100 (423) · 15x110 (299) · cierre_rapido (101) · 15x100 (24) · 12x110 (9)
- `specs.axle_rear` — 51 % — 12x142 (401) · 12x148 (340) · cierre_rapido (95) · 12x157 (1)
- `specs.battery_wh` — 37 % — min 237 · p25 500 · mediana 630 · p75 800 · máx 900
- `specs.brakes` — 99 % — disco_hidraulico (1496) · disco (57) · disco_mecanico (36) · llanta (21) · hidromecanico (7) · contrapedal (1)
- `specs.cassette_range` — 87 % — texto libre (>40 valores distintos)
- `specs.chainrings` — 82 % — 34 (217) · 32 (166) · 40 (132) · 50/34 (127) · 52/36 (112) · 30 (109) · 42 (75) · 48/35 (58) · 38 (55) · 46/30 (42) · 44 (36) · 50 (34) · 36 (26) · 46 (26) · 48 (17) · 50/37 (16) · 28 (13) · 48/31 (13) · 46/33 (9) · 46/36 (9) · 36/22 (6) · 48/34 (5) · 48/32 (4) · 54/40 (4) · 40/26 (3) · 46/32 (3) · 52 (3) · 48/38/28 (3) · 54/39 (2) · 46/34 (2) · 26 (2) · 36/26 (1) · 48/36 (1) · 43/30 (1) · 58 (1) · 53/48/43 (1) · 50/38 (1) · 55/44 (1)
- `specs.discipline` — 100 % — trail (305) · urbana (262) · xc (230) · gravel (211) · competicion (167) · trekking (89) · aero (81) · endurance (78) · enduro (73) · infantil (67) · triatlon (28) · ciclocross (14) · descenso (13) · dirt (9) · cargo (8) · fat (1)
- `specs.drivetrain` — 99 % — 1x (1067) · 2x (432) · buje_interno (97) · una_velocidad (23) · 3x (4)
- `specs.dropper_post` — 100 % — false (1309) · true (327)
- `specs.fenders` — 100 % — false (1383) · true (253)
- `specs.groupset` — 97 % — Shimano XT (240) · Shimano CUES (190) · Shimano Deore (143) · Shimano 105 (106) · Shimano GRX (104) · Shimano Ultegra (74) · SRAM GX (55) · SRAM Red (55) · SRAM Force (52) · Shimano Dura-Ace (46) · SRAM Eagle 90 (45) · Shimano Nexus (45) · SRAM X0 (44) · SRAM Rival (43) · microSHIFT (42) · Enviolo (39) · SRAM Apex (28) · Shimano XTR (25) · SRAM Eagle 70 (23) · Shimano Altus (23) · SRAM NX (22) · SRAM XX (17) · Shimano (14) · SRAM XX SL (14) · Shimano Acera (14) · Shimano Tourney (12) · microSHIFT Advent (11) · Shimano Tiagra (11) · Shimano SLX (9) · Shimano Alfine (7) · Shimano Alivio (6) · Campagnolo Record (5) · SRAM SX (4) · SRAM Eagle (4) · Shimano Claris (4) · Campagnolo Super Record (3) · microSHIFT Sword (3) · Campagnolo Ekar (1) · SRAM (1) · Shimano Sora (1)
- `specs.groupset_brand` — 97 % — Shimano (1074) · SRAM (407) · microSHIFT (56) · Enviolo (39) · Campagnolo (9)
- `specs.kickstand` — 100 % — false (1388) · true (248)
- `specs.lights` — 100 % — false (1338) · true (298)
- `specs.max_system_weight_kg` — 19 % — min 80.0 · p25 136 · mediana 136 · p75 136 · máx 250.0
- `specs.max_tyre_width_mm` — 29 % — min 25.0 · p25 35 · mediana 45 · p75 61 · máx 80.0
- `specs.motor` — objeto, 38 %
- `specs.motor.brand` — 33 % — Bosch (225) · Shimano (117) · Specialized (85) · TQ (45) · Avinox (26) · Brose (18) · Mahle (13) · Oli (3) · Fazua (3) · Yamaha (3)
- `specs.motor.model` — 38 % — texto libre (>40 valores distintos)
- `specs.motor.position` — 38 % — central (605) · buje_trasero (14)
- `specs.motor.torque_nm` — 29 % — min 35.0 · p25 65 · mediana 80 · p75 90 · máx 150.0
- `specs.pedals_included` — 100 % — false (1045) · true (591)
- `specs.power_meter` — 100 % — false (1484) · true (152)
- `specs.rack` — 100 % — false (1424) · true (212)
- `specs.range_extender` — 39 % — false (637)
- `specs.rotor_front_mm` — 75 % — min 140.0 · p25 160 · mediana 180 · p75 200 · máx 220.0
- `specs.rotor_rear_mm` — 75 % — min 140.0 · p25 160 · mediana 160 · p75 180 · máx 220.0
- `specs.seatpost_diameter_mm` — 66 % — min 27.2 · p25 27.2 · mediana 31.6 · p75 31.6 · máx 34.9
- `specs.shifting` — 97 % — mecanico (985) · electronico (602)
- `specs.speeds` — 94 % — min 1 · p25 10 · mediana 12 · p75 12 · máx 13
- `specs.suspension` — 99 % — rigida (728) · doble (490) · delantera (400)
- `specs.suspension_front_mm` — 98 % — min 0 · p25 0 · mediana 60 · p75 120 · máx 203
- `specs.suspension_rear_mm` — 84 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 200
- `specs.tubeless_ready` — 58 % — true (945)
- `specs.tyre_width_mm` — 85 % — min 22.0 · p25 35 · mediana 50 · p75 61 · máx 114
- `specs.tyre_width_rear_mm` — 1 % — min 30.0 · p25 60.25 · mediana 61 · p75 61 · máx 61
- `specs.weight_note` — 9 % — con sellante TLR, sin cámaras (97) · con cámaras (13) · batería no incluida (12) · con sellante TLR, sin cámara (8) · con sellante TLR sealant, sin cámaras (5) · con sellante TLR, sin cámaras ni bidones/portabidones (4) · con batería de 545 Wh (3) · sin batería (3) · con cámaras, sin bidones/portabidones (2) · con sellante TLR, sin cámaras, excluyendo el portabultos trasero (2)
- `specs.wheel_size` — 90 % — 700c (803) · 29 (319) · mixta (107) · 27.5 (96) · segun_talla (71) · 20 (33) · 24 (17) · 26 (13) · 16 (5) · 12 (4)
- **colors** (text[]) — 100 %
- **model_id** (bigint) — 100 % — min 1 · p25 58 · mediana 149 · p75 232 · máx 307
- **model_name** (text) — 100 % — texto libre (>40 valores distintos)
- **model_slug** (text) — 100 % — texto libre (>40 valores distintos)
- **category_id** (bigint) — 100 % — min 4 · p25 5 · mediana 6 · p75 7 · máx 34
- **category_slug** (text) — 100 % — bici-mtb (631) · bici-carretera (363) · bici-urbana (359) · bici-gravel (216) · bici-infantil (67)
- **category_kind** (text) — 100 % — bici (1636)
- **brand_id** (bigint) — 100 % — min 55 · p25 56 · mediana 432 · p75 570 · máx 659
- **brand_name** (text) — 100 % — BH (325) · Trek (317) · Specialized (219) · Orbea (167) · Cannondale (149) · Canyon (140) · Merida (100) · Bianchi (94) · Van Rysel (62) · Rockrider (56) · Electra (7)
- **brand_slug** (text) — 100 % — bh (325) · trek (317) · specialized (219) · orbea (167) · cannondale (149) · canyon (140) · merida (100) · bianchi (94) · van-rysel (62) · rockrider (56) · electra (7)
- **origin_block** (text) — 100 % — occidental (1536) · taiwan (100)
- **hq_country_code** (character(2)) — 100 % — US (692) · ES (492) · DE (140) · FR (118) · TW (100) · IT (94)
- **brand_status** (text) — 100 % — activa (1629) · desconocido (7)
- **best_final_price_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **store_count** (bigint) — 100 % — min 1 · p25 1 · mediana 1 · p75 1 · máx 1
- **in_stock_offers** (bigint) — 100 % — min 0 · p25 1 · mediana 1 · p75 1 · máx 1
- **main_image_url** (text) — 100 % — texto libre (>40 valores distintos)
- **main_image_is_hotlink** (boolean) — 100 % — true (1636)
- **official_url** (text) — 100 % — texto libre (>40 valores distintos)
- **score_total** (numeric(3,1)) — 0 % — min null · p25 null · mediana null · p75 null · máx null
- **score_partials** (jsonb) — 0 %
- **wants_count** (bigint) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **owns_count** (bigint) — 100 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 0
- **search_vector** (tsvector) — 100 %

## variant_scores (tabla) · 0 filas

- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **formula_version** (integer) — — — min null · p25 null · mediana null · p75 null · máx null
- **total** (numeric(3,1)) — — — min null · p25 null · mediana null · p75 null · máx null
- **partials** (jsonb) — —
- **computed_at** (timestamp with time zone) — —

## variant_sizes (tabla) · 6881 filas

- **id** (bigint) — 100 % — min 1 · p25 1721 · mediana 3441 · p75 5161 · máx 6881
- **variant_id** (bigint) — 100 % — min 1 · p25 389 · mediana 819 · p75 1260 · máx 1636
- **size_label** (text) — 100 % — texto libre (>40 valores distintos)
- **sort_order** (smallint) — 100 % — min 0 · p25 1 · mediana 2 · p75 3 · máx 8
- **rider_height_min_cm** (smallint) — 99 % — min 90 · p25 162 · mediana 173 · p75 183 · máx 207
- **rider_height_max_cm** (smallint) — 99 % — min 100 · p25 172 · mediana 180 · p75 190 · máx 213
- **stack_mm** (smallint) — 85 % — min 319 · p25 563 · mediana 608 · p75 634 · máx 734
- **reach_mm** (smallint) — 85 % — min 185 · p25 387 · mediana 410 · p75 450 · máx 535
- **geometry** (jsonb) — 100 %
- `geometry.bb_drop_mm` — 83 % — min -10.0 · p25 41 · mediana 68 · p75 73 · máx 94.0
- `geometry.bb_height_mm` — 46 % — min 162.0 · p25 280 · mediana 300.5 · p75 339 · máx 360.5
- `geometry.chainstay_mm` — 86 % — min 243.0 · p25 420 · mediana 434 · p75 444 · máx 702.0
- `geometry.fork_length_mm` — 57 % — min 205.0 · p25 385 · mediana 405 · p75 527 · máx 611.0
- `geometry.fork_offset_mm` — 54 % — min 5.0 · p25 44 · mediana 45 · p75 50 · máx 55.0
- `geometry.front_center_mm` — 49 % — min 297.0 · p25 602 · mediana 650 · p75 761 · máx 897.0
- `geometry.head_tube_angle_deg` — 86 % — min 62.5 · p25 66.5 · mediana 69.9 · p75 71.5 · máx 74.0
- `geometry.head_tube_length_mm` — 86 % — min 59.0 · p25 110 · mediana 130 · p75 160 · máx 267.0
- `geometry.reach_mm` — 85 % — min 185.0 · p25 387 · mediana 409.5 · p75 450 · máx 535.0
- `geometry.seat_tube_angle_deg` — 84 % — min 61.6 · p25 73.225 · mediana 74 · p75 75 · máx 86.0
- `geometry.seat_tube_angle_eff_deg` — 11 % — min 70.9 · p25 74 · mediana 75 · p75 77 · máx 78.7
- `geometry.seat_tube_mm` — 85 % — min 160.0 · p25 420 · mediana 465.5 · p75 518 · máx 650.0
- `geometry.stack_mm` — 85 % — min 319.0 · p25 563 · mediana 608 · p75 634 · máx 734.0
- `geometry.standover_mm` — 64 % — min 281.0 · p25 744 · mediana 768 · p75 807 · máx 911.0
- `geometry.top_tube_eff_mm` — 83 % — min 295.0 · p25 552 · mediana 582 · p75 615 · máx 716.0
- `geometry.top_tube_mm` — 5 % — min 398.0 · p25 520 · mediana 545 · p75 576.5 · máx 662.0
- `geometry.trail_mm` — 38 % — min 34.0 · p25 62.3 · mediana 74 · p75 109 · máx 139.0
- `geometry.wheel_size` — 26 % — 700c (985) · 29 (526) · mixta (140) · 27.5 (104) · 26 (4) · 20 (1) · 24 (1) · 16 (1) · 12 (1)
- `geometry.wheelbase_mm` — 84 % — min 544.0 · p25 1012 · mediana 1085 · p75 1200 · máx 1439.0
- **geometry_raw** (jsonb) — 86 %
- **components** (jsonb) — 100 %
- `components.crank_length_mm` — 33 % — min 140.0 · p25 165 · mediana 170 · p75 172.5 · máx 175.0
- `components.dropper_travel_mm` — 11 % — min 75.0 · p25 150 · mediana 170 · p75 200 · máx 240.0
- `components.handlebar_width_mm` — 25 % — min 360.0 · p25 420 · mediana 680 · p75 750 · máx 810.0
- `components.stem_length_mm` — 15 % — min 35.0 · p25 50 · mediana 80 · p75 100 · máx 120.0
- **rider_height_source** (text) — 99 % — oficial (4469) · estimado (2355)

## variant_standards (tabla) · 0 filas

- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **standard_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null

## variants (tabla) · 1636 filas

- **id** (bigint) — 100 % — min 1 · p25 409.75 · mediana 818.5 · p75 1227.25 · máx 1636
- **model_id** (bigint) — 100 % — min 1 · p25 58 · mediana 149 · p75 232 · máx 307
- **slug** (text) — 100 % — texto libre (>40 valores distintos)
- **name** (text) — 100 % — texto libre (>40 valores distintos)
- **model_year** (smallint) — 47 % — min 2021 · p25 2025 · mediana 2026 · p75 2027 · máx 2027
- **is_electric** (boolean) — 100 % — false (999) · true (637)
- **frame_material** (text) — 90 % — carbono (790) · aluminio (681) · acero (4)
- **weight_g** (integer) — 47 % — min 3970 · p25 9492.5 · mediana 13670 · p75 21827.5 · máx 39600
- **weight_size_label** (text) — 32 % — M (230) · 56 (84) · MD (74) · S (52) · ML (33) · L (30) · LG (13) · One (5) · 17.5 (1) · 26 (1)
- **msrp_cents** (integer) — 100 % — min 16800 · p25 249900 · mediana 407990 · p75 629900 · máx 2188500
- **specs** (jsonb) — 100 %
- `specs.assist_speed_kmh` — 10 % — min 25.0 · p25 25 · mediana 25 · p75 25 · máx 25.0
- `specs.axle_front` — 52 % — 12x100 (423) · 15x110 (299) · cierre_rapido (101) · 15x100 (24) · 12x110 (9)
- `specs.axle_rear` — 51 % — 12x142 (401) · 12x148 (340) · cierre_rapido (95) · 12x157 (1)
- `specs.battery_wh` — 37 % — min 237 · p25 500 · mediana 630 · p75 800 · máx 900
- `specs.brakes` — 99 % — disco_hidraulico (1496) · disco (57) · disco_mecanico (36) · llanta (21) · hidromecanico (7) · contrapedal (1)
- `specs.cassette_range` — 87 % — texto libre (>40 valores distintos)
- `specs.chainrings` — 82 % — 34 (217) · 32 (166) · 40 (132) · 50/34 (127) · 52/36 (112) · 30 (109) · 42 (75) · 48/35 (58) · 38 (55) · 46/30 (42) · 44 (36) · 50 (34) · 36 (26) · 46 (26) · 48 (17) · 50/37 (16) · 28 (13) · 48/31 (13) · 46/33 (9) · 46/36 (9) · 36/22 (6) · 48/34 (5) · 48/32 (4) · 54/40 (4) · 40/26 (3) · 46/32 (3) · 52 (3) · 48/38/28 (3) · 54/39 (2) · 46/34 (2) · 26 (2) · 36/26 (1) · 48/36 (1) · 43/30 (1) · 58 (1) · 53/48/43 (1) · 50/38 (1) · 55/44 (1)
- `specs.discipline` — 100 % — trail (305) · urbana (262) · xc (230) · gravel (211) · competicion (167) · trekking (89) · aero (81) · endurance (78) · enduro (73) · infantil (67) · triatlon (28) · ciclocross (14) · descenso (13) · dirt (9) · cargo (8) · fat (1)
- `specs.drivetrain` — 99 % — 1x (1067) · 2x (432) · buje_interno (97) · una_velocidad (23) · 3x (4)
- `specs.dropper_post` — 100 % — false (1309) · true (327)
- `specs.fenders` — 100 % — false (1383) · true (253)
- `specs.groupset` — 97 % — Shimano XT (240) · Shimano CUES (190) · Shimano Deore (143) · Shimano 105 (106) · Shimano GRX (104) · Shimano Ultegra (74) · SRAM GX (55) · SRAM Red (55) · SRAM Force (52) · Shimano Dura-Ace (46) · SRAM Eagle 90 (45) · Shimano Nexus (45) · SRAM X0 (44) · SRAM Rival (43) · microSHIFT (42) · Enviolo (39) · SRAM Apex (28) · Shimano XTR (25) · SRAM Eagle 70 (23) · Shimano Altus (23) · SRAM NX (22) · SRAM XX (17) · Shimano (14) · SRAM XX SL (14) · Shimano Acera (14) · Shimano Tourney (12) · microSHIFT Advent (11) · Shimano Tiagra (11) · Shimano SLX (9) · Shimano Alfine (7) · Shimano Alivio (6) · Campagnolo Record (5) · SRAM SX (4) · SRAM Eagle (4) · Shimano Claris (4) · Campagnolo Super Record (3) · microSHIFT Sword (3) · Campagnolo Ekar (1) · SRAM (1) · Shimano Sora (1)
- `specs.groupset_brand` — 97 % — Shimano (1074) · SRAM (407) · microSHIFT (56) · Enviolo (39) · Campagnolo (9)
- `specs.kickstand` — 100 % — false (1388) · true (248)
- `specs.lights` — 100 % — false (1338) · true (298)
- `specs.max_system_weight_kg` — 19 % — min 80.0 · p25 136 · mediana 136 · p75 136 · máx 250.0
- `specs.max_tyre_width_mm` — 29 % — min 25.0 · p25 35 · mediana 45 · p75 61 · máx 80.0
- `specs.motor` — objeto, 38 %
- `specs.motor.brand` — 33 % — Bosch (225) · Shimano (117) · Specialized (85) · TQ (45) · Avinox (26) · Brose (18) · Mahle (13) · Oli (3) · Fazua (3) · Yamaha (3)
- `specs.motor.model` — 38 % — texto libre (>40 valores distintos)
- `specs.motor.position` — 38 % — central (605) · buje_trasero (14)
- `specs.motor.torque_nm` — 29 % — min 35.0 · p25 65 · mediana 80 · p75 90 · máx 150.0
- `specs.pedals_included` — 100 % — false (1045) · true (591)
- `specs.power_meter` — 100 % — false (1484) · true (152)
- `specs.rack` — 100 % — false (1424) · true (212)
- `specs.range_extender` — 39 % — false (637)
- `specs.rotor_front_mm` — 75 % — min 140.0 · p25 160 · mediana 180 · p75 200 · máx 220.0
- `specs.rotor_rear_mm` — 75 % — min 140.0 · p25 160 · mediana 160 · p75 180 · máx 220.0
- `specs.seatpost_diameter_mm` — 66 % — min 27.2 · p25 27.2 · mediana 31.6 · p75 31.6 · máx 34.9
- `specs.shifting` — 97 % — mecanico (985) · electronico (602)
- `specs.speeds` — 94 % — min 1 · p25 10 · mediana 12 · p75 12 · máx 13
- `specs.suspension` — 99 % — rigida (728) · doble (490) · delantera (400)
- `specs.suspension_front_mm` — 98 % — min 0 · p25 0 · mediana 60 · p75 120 · máx 203
- `specs.suspension_rear_mm` — 84 % — min 0 · p25 0 · mediana 0 · p75 0 · máx 200
- `specs.tubeless_ready` — 58 % — true (945)
- `specs.tyre_width_mm` — 85 % — min 22.0 · p25 35 · mediana 50 · p75 61 · máx 114
- `specs.tyre_width_rear_mm` — 1 % — min 30.0 · p25 60.25 · mediana 61 · p75 61 · máx 61
- `specs.weight_note` — 9 % — con sellante TLR, sin cámaras (97) · con cámaras (13) · batería no incluida (12) · con sellante TLR, sin cámara (8) · con sellante TLR sealant, sin cámaras (5) · con sellante TLR, sin cámaras ni bidones/portabidones (4) · con batería de 545 Wh (3) · sin batería (3) · con cámaras, sin bidones/portabidones (2) · con sellante TLR, sin cámaras, excluyendo el portabultos trasero (2)
- `specs.wheel_size` — 90 % — 700c (803) · 29 (319) · mixta (107) · 27.5 (96) · segun_talla (71) · 20 (33) · 24 (17) · 26 (13) · 16 (5) · 12 (4)
- **is_published** (boolean) — 100 % — true (1636)
- **discontinued** (boolean) — 100 % — false (1636)
- **created_at** (timestamp with time zone) — 100 %
- **updated_at** (timestamp with time zone) — 100 %
- **colors** (text[]) — 100 %
- **source_url** (text) — 100 % — texto libre (>40 valores distintos)
- **source_market** (text) — 100 % — es-ES (1542) · global (94)
- **specs_raw** (jsonb) — 100 %
- **specs_captured_at** (timestamp with time zone) — 100 %
- **specs_reviewed_at** (timestamp with time zone) — 0 %
- **specs_reviewed_by** (text) — 0 % — 
- **data_notes** (text) — 84 % — texto libre (>40 valores distintos)

## wishlist_items (tabla) · 0 filas

- **user_id** (uuid) — —
- **variant_id** (bigint) — — — min null · p25 null · mediana null · p75 null · máx null
- **kind** (text) — — — 
- **created_at** (timestamp with time zone) — —
