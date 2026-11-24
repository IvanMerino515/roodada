"use client";

import Image from "next/image";
import Link from "next/link";

import type { Menu } from "@/lib/landings";
import { MainNav } from "./MainNav";
import { useReset } from "./ResetScope";

/**
 * Cabecera: la misma en todas las páginas, con fondo, logo y filete inferior. En la portada va encima
 * del vídeo, no flotando sobre él (decisión de Iván, 24-11-2026); la intro descuenta su altura.
 */
export function SiteHeader({ menu }: { menu: Menu | null }) {
  const reset = useReset();
  return (
    <header className="sticky top-0 z-30 bg-bg text-text border-b border-border">
      <nav aria-label="Principal" className="relative flex items-stretch justify-between h-8">
        <Link href="/" onClick={reset} aria-label="Roodada, inicio" className="flex items-center px-2 md:px-4">
          <Image src="/logo.png" alt="" width={128} height={32} preload className="h-4 w-auto" />
        </Link>
        <MainNav menu={menu} />
      </nav>
    </header>
  );
}
