// Fotos que Vercel no puede optimizar: devuelve 502 (OPTIMIZED_EXTERNAL_IMAGE_REQUEST_UNAUTHORIZED) con las .avif de
// bike-discount.de (Radon), comprobado el 2026-11-11. Ya vienen en AVIF: el navegador las carga tal cual.
export const sinOptimizar = (url?: string | null) => !!url && /\.avif(\?|$)/i.test(url);
