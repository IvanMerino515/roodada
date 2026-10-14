import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";

import { SiteAnalytics } from "@/components/SiteAnalytics";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

// Poppins, la familia de los tokens, servida desde nuestro dominio: sin pedir nada a Google en cada visita
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Roodada · Encuentra tu bici", template: "%s · Roodada" },
  description:
    "Te ayudamos a elegir bicicleta con datos reales: talla, componentes y precio de más de 1.600 bicis comparadas.",
  openGraph: {
    locale: "es_ES",
    siteName: "Roodada",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Roodada: deja de buscar, empieza a rodar" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Modo claro fijo: el modo oscuro del sistema de diseño aún no tiene colores definidos en Office
    <html lang="es" data-theme="light" className={poppins.variable}>
      <body className="min-h-dvh flex flex-col bg-bg text-text font-body">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-1 focus:left-1 focus:z-50 focus:bg-accent focus:text-on-accent focus:p-2 eyebrow"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <footer className="border-t border-border mt-12">
          <div className="wrap grid-swiss gap-y-3 py-4">
            <p className="col-span-4 md:col-span-4 lg:col-span-6 font-display text-h3">
              Elegir bici con datos, no con anuncios.
            </p>
            <ul className="col-span-2 md:col-span-2 lg:col-span-2 list-none m-0 p-0 grid gap-1 content-start eyebrow">
              <li><Link href="/guia" className="link">Guía</Link></li>
              <li><Link href="/comparador" className="link">Comparador</Link></li>
              <li><Link href="/aviso-legal" className="link">Aviso legal</Link></li>
              <li><Link href="/privacidad" className="link">Privacidad</Link></li>
            </ul>
            <p className="col-span-4 md:col-span-2 lg:col-span-4 text-small">
              Roodada compara los datos que publica cada marca. Precio y disponibilidad de su web oficial: compruébalos
              antes de comprar.
            </p>
          </div>
        </footer>
        <SiteAnalytics />
      </body>
    </html>
  );
}
