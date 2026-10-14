"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/guia", label: "Guía" },
  { href: "/comparador", label: "Comparador" },
] as const;

/** Navegación principal: marca la sección en la que estás (aria-current). */
export function NavLinks() {
  const path = usePathname();
  return (
    <ul className="flex items-stretch list-none m-0 p-0 h-full">
      {LINKS.map(({ href, label }) => {
        const current = path === href || path.startsWith(`${href}/`);
        return (
          <li key={href} className="border-l border-current">
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className="eyebrow flex items-center h-full px-2 md:px-3 no-underline hover:bg-accent hover:text-on-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
