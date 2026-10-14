# Kit del sistema de diseño · Roodada

1. Descomprime este ZIP en la raíz del proyecto. Crea:
   - `design-system/` — tokens, CSS, componentes React y DESIGN.md
   - `.claude/skills/roodada-design-system/SKILL.md` — skill para Claude Code
2. Añade a tu CSS principal (Tailwind 4):

   ```css
   @import "tailwindcss";
   @import "./design-system/tokens/tokens.css";
   @import "./design-system/tokens/theme.css";
   @import "./design-system/components/components.css";
   ```

   Ajusta las rutas según dónde esté tu CSS. Sin Tailwind, importa solo tokens.css y components.css.
3. Pega el contenido de `CLAUDE.snippet.md` en el `CLAUDE.md` del proyecto.
4. Carga las fuentes: poppins (Google Fonts).
5. Si tu proyecto no usa el alias `@/`, importa los componentes con la ruta relativa a `design-system/react`.

En Claude Code, pide la interfaz con normalidad: la skill se activa sola al trabajar en UI.
