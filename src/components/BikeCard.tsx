import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Bike } from "@/lib/catalog/types";
import { eur } from "@/lib/format";
import { QualityBadge } from "./QualityBadge";

type Props = {
  bike: Bike;
  /** Enlace de la ficha; los resultados de la guía añaden la altura para marcar la talla */
  href?: string;
  /** Contenido extra bajo el precio: razones, avisos… */
  children?: ReactNode;
  /** Arriba a la derecha, fuera del enlace: la casilla de comparar */
  corner?: ReactNode;
  preload?: boolean;
};

/** Casilla del catálogo: la bici protagonista sobre un fondo liso, y solo lo esencial debajo. */
export function BikeCard({ bike, href = `/bici/${bike.slug}`, children, corner, preload }: Props) {
  return (
    <article className="relative flex flex-col h-full bg-white">
      <Link href={href} className="group flex flex-col flex-1 p-2 no-underline focus-inset">
        <div className="flex items-center min-h-4 pr-12">
          {bike.electric && <span className="eyebrow">Eléctrica</span>}
        </div>
        <div className="aspect-[4/3] flex items-center justify-center my-1">
          <Image
            src={bike.imageUrl}
            alt=""
            width={600}
            height={400}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="product w-full h-full object-contain transition-transform duration-200 ease-ds group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            preload={preload}
          />
        </div>
        <div className="mt-auto grid gap-0.5">
          <p className="eyebrow">{bike.brand}</p>
          <h3 className="text-body font-display leading-tight group-hover:underline">{bike.name}</h3>
          {/* El precio es el dato con el que se decide: pesa más que la marca */}
          <p className="font-display font-semibold num mt-0.5">{eur(bike.priceCents)}</p>
          <QualityBadge bike={bike} />
        </div>
      </Link>
      {children && <div className="px-2 pb-2 grid gap-1 text-small">{children}</div>}
      {corner && <div className="absolute top-0 right-0">{corner}</div>}
    </article>
  );
}

/** Casilla de color que rompe la rejilla: un mensaje editorial en lugar de una bici. */
export function FeatureTile({
  eyebrow, title, children, href, cta, className = "",
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  href: string;
  cta: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-2 p-2 md:p-3 bg-surface text-text no-underline min-h-40 hover:bg-surface-alt ${className}`}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <p className="font-display text-h3 uppercase leading-none">{title}</p>
      {children && <div className="text-small">{children}</div>}
      <span className="mt-auto flex items-center justify-between eyebrow border-t border-current pt-1">
        {cta}
        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
      </span>
    </Link>
  );
}
