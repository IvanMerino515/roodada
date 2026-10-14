"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavLinks } from "./NavLinks";

/** Cabecera. En la portada flota transparente sobre el vídeo de la intro (el logo ya está en el centro). */
export function SiteHeader() {
  const home = usePathname() === "/";
  return (
    <header className={home ? "absolute inset-x-0 top-0 z-30 text-white" : "sticky top-0 z-30 bg-bg border-b border-border"}>
      <nav aria-label="Principal" className={`flex items-stretch h-8 ${home ? "justify-end" : "justify-between"}`}>
        {!home && (
          <Link href="/" aria-label="Roodada, inicio" className="flex items-center px-2 md:px-4">
            <Image src="/logo.png" alt="" width={128} height={32} preload className="h-4 w-auto" />
          </Link>
        )}
        <NavLinks />
      </nav>
    </header>
  );
}
