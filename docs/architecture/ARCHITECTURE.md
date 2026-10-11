# Arquitectura de la información · Roodada

> Generado desde Office el 11 de octubre de 2026. Fuente de verdad de las rutas, la navegación y los flujos. Si cambias rutas en el código, actualiza también la arquitectura.

6 páginas/pantallas · 8 conexiones · portada: Comparador (`/comparador`)

## Reglas para construir

- Crea exactamente las rutas de `routes.json`; los segmentos `:param` son dinámicos.
- La navegación principal y el pie se construyen con las listas de abajo, en ese orden.
- Cada página incluye sus bloques de contenido en el orden indicado.
- Lo marcado como **Después** queda fuera del MVP: no lo construyas salvo que se pida.

## Navegación

**Principal**

- (vacía)

## Mapa del sitio

- 1 **Comparador** — `/comparador`
- 2 **Comparativa** — `/comparativa`
- 3 **Ficha de bici** — `/bici`
- 4 **Roodada Inicio** — `hola` · Inicio
- 5 **Formulario** — `/formulario` · Formulario
- 6 **Cátalogo Personalizado** — `/pagina`

## Flujos

### Flujo 1 · desde Roodada Inicio

- Roodada Inicio → Clic en formulario
- Roodada Inicio → Clic en comparador
- Clic en formulario → Formulario (`/formulario`)
- Clic en comparador → Comparador (`/comparador`)
- Formulario → Cátalogo Personalizado (`/pagina`)
- Comparador → Comparativa (`/comparativa`)
- Cátalogo Personalizado → Ficha de bici (`/bici`)
- Comparativa → Ficha de bici (`/bici`)

## Páginas

### 3 Ficha de bici · `/bici`

Página · idea · MVP · a 2 clics

Bloques:

1. header
2. imagen
3. Especs
4. Recomendador

### 4 Roodada Inicio · `hola`

Página · plantilla inicio · idea · MVP

Bloques:

1. Hero
2. Descripción de Roodada
3. Llamada a la acción al formulario

### 5 Formulario · `/formulario`

Página · plantilla formulario · idea · MVP

Bloques:

1. Campos
2. Validación
3. Confirmación

### 6 Cátalogo Personalizado · `/pagina`

Página · idea · MVP

Bloques:

1. Header
2. Modo de visualización
3. Catálogo
4. Footer

### Clic en formulario

Acción · idea · MVP

> Clic para rellenar la configuración

## Notas

- Poner especificaciones.

## Avisos pendientes

- «Roodada Inicio» es huérfana: no se llega a ella desde la portada ni desde un flujo
- «Formulario» es huérfana: no se llega a ella desde la portada ni desde un flujo
- «Cátalogo Personalizado» es huérfana: no se llega a ella desde la portada ni desde un flujo

---

Leyenda de conexiones: jerarquía: cuelga de (árbol del sitio) · navegación: enlace entre ramas · flujo: paso siguiente de una tarea.
