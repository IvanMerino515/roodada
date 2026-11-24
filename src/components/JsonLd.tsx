import { jsonLdHtml } from "@/lib/seo";

/** Datos estructurados para Google y los buscadores de IA. No se ve en la página. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }} />;
}
