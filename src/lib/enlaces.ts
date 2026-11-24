// Página de enlaces de la bio de Instagram (/enlaces), en lugar de Linktree: el tráfico se queda en
// roodada.com y se mide. «destacados» se actualiza cada semana con las publicaciones del momento.
export type Enlace = { href: string; titulo: string; texto?: string };

/** Lo de esta semana (las publicaciones recientes). Puede quedar vacío. */
export const DESTACADOS: Enlace[] = [];

/** Siempre */
export const FIJOS: Enlace[] = [
  { href: "/talla-bicicleta", titulo: "Calcula tu talla", texto: "Tu talla en cada marca con tu altura" },
  { href: "/guia", titulo: "¿Qué bici me compro?", texto: "Unas preguntas y te decimos cuáles te encajan" },
  { href: "/#rebajadas", titulo: "Rebajas de la semana", texto: "Bajadas de precio comprobadas" },
  { href: "/bicis", titulo: "Tipos de bici", texto: "Carretera, gravel, montaña, urbanas y eléctricas" },
  { href: "/marcas", titulo: "Marcas", texto: "Todas las marcas y sus mejores bicis" },
];
