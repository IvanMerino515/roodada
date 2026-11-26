import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";

import { ActivityTracker } from "@/components/ActivityTracker";
import { Consentimiento, PreferenciasCookies } from "@/components/Consentimiento";
import { NavProgress } from "@/components/NavProgress";
import { SiteAnalytics } from "@/components/SiteAnalytics";
import { ResetBoundary, ResetScope } from "@/components/ResetScope";
import { SiteHeader } from "@/components/SiteHeader";
import { getCatalog } from "@/lib/catalog/load";
import { HAY_OPCIONALES } from "@/lib/consentimiento";
import { buildMenu } from "@/lib/landings";
import { MODO_PRUEBA } from "@/lib/site";
import "./globals.css";

// Poppins, la familia de los tokens, servida desde nuestro dominio: sin pedir nada a Google en cada visita
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Roodada · Encuentra tu bici", template: "%s · Roodada" },
  description:
    "Te ayudamos a elegir bicicleta con datos reales: talla, componentes y precio de miles de bicis comparadas.",
  openGraph: {
    locale: "es_ES",
    siteName: "Roodada",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Roodada: deja de buscar, empieza a rodar" }],
  },
  twitter: { card: "summary_large_image" },
  // En modo prueba, ninguna página se indexa (las páginas que fijan su propio robots ya son noindex)
  ...(MODO_PRUEBA ? { robots: { index: false, follow: false } } : {}),
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
        {/* Lee la dirección (useSearchParams): con Cache Components necesita su propio Suspense */}
        <Suspense fallback={null}>
          <NavProgress />
          {/* Registro anónimo de uso: páginas vistas y salidas a tienda */}
          <ActivityTracker />
        </Suspense>
        {/* El logo «empieza de cero»: vuelve a montar el contenido con todo por defecto (ResetScope) */}
        <ResetScope>
          {/* El menú (tipos y marcas) sale del catálogo en caché; mientras llega, la barra sin desplegables */}
          <Suspense fallback={<SiteHeader menu={null} />}>
            <HeaderWithMenu />
          </Suspense>
          <main id="contenido" className="flex-1">
            <ResetBoundary>{children}</ResetBoundary>
          </main>
        </ResetScope>
        {/* Pie en tres bandas horizontales: frase de marca, navegación y, tras un filete, lo legal y el aviso de precios */}
        <footer className="border-t border-border mt-12">
          <div className="wrap grid gap-3 py-4">
            <p className="font-display text-h3">Elegir bici con datos, no con anuncios.</p>
            <nav aria-label="Pie de página">
              <ul className="list-none m-0 p-0 flex flex-wrap gap-x-3 gap-y-1 eyebrow">
                <li><Link href="/guia" className="link inline-flex items-center min-h-3">Recomendador</Link></li>
                <li><Link href="/comparador" className="link inline-flex items-center min-h-3">Comparador</Link></li>
                <li><Link href="/bicis" className="link inline-flex items-center min-h-3">Tipos de bici</Link></li>
                <li><Link href="/marcas" className="link inline-flex items-center min-h-3">Marcas</Link></li>
                <li><Link href="/talla-bicicleta" className="link inline-flex items-center min-h-3">Calcula tu talla</Link></li>
              </ul>
            </nav>
            <div className="border-t border-border pt-2 grid gap-2 lg:grid-cols-[1fr_auto] lg:items-start">
              <ul aria-label="Información legal" className="list-none m-0 p-0 flex flex-wrap gap-x-3 gap-y-1 eyebrow">
                <li><Link href="/aviso-legal" className="link inline-flex items-center min-h-3">Aviso legal</Link></li>
                <li><Link href="/privacidad" className="link inline-flex items-center min-h-3">Privacidad</Link></li>
                <li><Link href="/cookies" className="link inline-flex items-center min-h-3">Cookies</Link></li>
                <li><Link href="/transparencia" className="link inline-flex items-center min-h-3">Cómo nos financiamos</Link></li>
                {HAY_OPCIONALES && <li><PreferenciasCookies className="link inline-flex items-center min-h-3 eyebrow cursor-pointer text-left" /></li>}
              </ul>
              <p className="text-small lg:max-w-[40ch]">
                Roodada compara los datos que publica cada marca. Precio y disponibilidad de su web oficial: compruébalos
                antes de comprar.
              </p>
            </div>
          </div>
        </footer>
        {/* Vercel Web Analytics solo funciona en Vercel; en el VPS no existe su script */}
        {process.env.VERCEL && <SiteAnalytics />}
        {/* Aviso de cookies y Google Analytics (solo con consentimiento). Lee la ruta: en su propio Suspense */}
        <Suspense fallback={null}>
          <Consentimiento />
        </Suspense>
      </body>
    </html>
  );
}

async function HeaderWithMenu() {
  return <SiteHeader menu={buildMenu(await getCatalog({ sizes: false }))} />;
}
