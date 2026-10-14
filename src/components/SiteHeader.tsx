"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NavLinks } from "./NavLinks";

/**
 * Cabecera. En la portada flota transparente sobre el vídeo de la intro (el logo ya está en el centro)
 * y, al salir del vídeo, se vuelve la cabecera normal con logo, para no quedarse sin navegación.
 */
export function SiteHeader() {
  const home = usePathname() === "/";
  const [overIntro, setOverIntro] = useState(true);

  useEffect(() => {
    const intro = home ? document.getElementById("intro") : null;
    if (!intro) return;
    // Margen de la altura de la cabecera: cambia justo cuando el vídeo deja de quedar detrás
    const io = new IntersectionObserver(([e]) => setOverIntro(e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" });
    io.observe(intro);
    return () => io.disconnect();
  }, [home]);

  const floating = home && overIntro;
  const position = home ? "fixed inset-x-0 top-0" : "sticky top-0";
  const look = floating ? "on-dark text-white" : "bg-bg text-text border-b border-border";

  return (
    <header className={`${position} z-30 ${look}`}>
      <nav aria-label="Principal" className={`flex items-stretch h-8 ${floating ? "justify-end" : "justify-between"}`}>
        {!floating && (
          <Link href="/" aria-label="Roodada, inicio" className="flex items-center px-2 md:px-4">
            <Image src="/logo.png" alt="" width={128} height={32} preload className="h-4 w-auto" />
          </Link>
        )}
        <NavLinks />
      </nav>
    </header>
  );
}
