---
name: roodada-design-system
description: Sistema de diseño de Roodada. Úsalo SIEMPRE que crees o modifiques interfaz en este proyecto (componentes, páginas, maquetación, estilos, CSS o clases de Tailwind): define los colores, la tipografía, el espaciado, los radios y los componentes básicos que hay que respetar.
---

# Sistema de diseño de Roodada

Antes de escribir o cambiar interfaz, lee `design-system/DESIGN.md` (reglas, tokens y componentes).

## Reglas clave
- No escribas colores, tamaños de letra, radios, sombras ni duraciones a mano: usa `var(--ds-…)` o las utilidades del tema de Tailwind (`bg-surface`, `text-text`, `text-h2`, `rounded-md`…). La paleta por defecto de Tailwind está desactivada.
- Usa los componentes de `design-system/react` (`Button`, `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `Card`, `Badge`, `Chip`, `TabList`/`Tab`, `Alert`, `Container`, `Section`, `Grid`, `Stack`, `Cluster` y los patrones de layout activos, `Heading`, `Text`, `TextLink`) antes de crear estilos nuevos.
- Color por rol (`bg`, `surface`, `text`, `text-muted`, `border`, `accent`, `on-accent`, `success`, `warning`, `danger`, `focus`), nunca por tono, para que el modo oscuro funcione.
- Un solo `Button` primary por vista; un solo `h1` por página; espaciado en múltiplos de 8 px.
- Accesibilidad: foco visible, objetivos de 44 px, labels en todos los campos, contraste AA.
- Si necesitas algo que el sistema no cubre, compónlo con los mismos tokens y avisa de que convendría añadirlo al sistema en Office.

## Ficheros
- `design-system/tokens/tokens.css` — variables `--ds-*` (claro/oscuro)
- `design-system/tokens/theme.css` — tema de Tailwind 4
- `design-system/components/components.css` — clases `ds-*`
- `design-system/react/` — componentes básicos
- `design-system/tokens/tokens.json` — tokens W3C
- `design-system/DESIGN.md` — guía completa

No edites estos ficheros: se generan desde Office y se sobrescriben al actualizar.
