import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container, Text } from "../../design-system/react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Roodada · Encuentra tu bici", template: "%s · Roodada" },
  description:
    "Te ayudamos a elegir bicicleta con datos reales: talla, componentes y precio de más de 1.600 bicis comparadas.",
  openGraph: { locale: "es_ES", siteName: "Roodada", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Modo claro fijo: el modo oscuro del sistema de diseño aún no tiene colores definidos en Office
    <html lang="es" data-theme="light">
      <head>
        {/* Las familias de los tokens (DM Mono, Space Mono) se cargan con su nombre real para que coincidan */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-bg text-text font-body">
        <a href="#contenido" className="sr-only focus:not-sr-only">
          Saltar al contenido
        </a>
        <header className="border-b-[length:var(--ds-border-width)] border-border">
          <Container className="flex items-center justify-between gap-3 py-2">
            <Link href="/" aria-label="Roodada, inicio">
              <Image src="/logo.png" alt="Roodada" width={160} height={40} preload />
            </Link>
            <nav aria-label="Principal" className="flex gap-3 text-label">
              <Link href="/guia" className="ds-link">Guía</Link>
              <Link href="/comparador" className="ds-link">Comparador</Link>
            </nav>
          </Container>
        </header>
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <footer className="border-t-[length:var(--ds-border-width)] border-border">
          <Container className="py-4">
            <Text size="small">
              Roodada compara datos publicados por cada marca. Precios y disponibilidad de su web oficial; compruébalos
              antes de comprar.
            </Text>
          </Container>
        </footer>
      </body>
    </html>
  );
}
