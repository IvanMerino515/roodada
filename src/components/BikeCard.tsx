import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";

import type { Bike } from "@/lib/catalog/types";
import { eur, priceLabel } from "@/lib/format";
import { LinkPending } from "./LinkPending";
import { QualityBadge } from "./QualityBadge";
import { sinOptimizar } from "@/lib/imagen";

type Props = {
  bike: Bike;
  /** Enlace de la ficha; los resultados de la guía añaden la altura para marcar la talla */
  href?: string;
  /** Contenido extra bajo el precio: razones, avisos… */
  children?: ReactNode;
  /** Arriba a la derecha, fuera del enlace: la casilla de comparar */
  corner?: ReactNode;
  preload?: boolean;
  /** Precio anterior (tachado de la web oficial), en céntimos: se enseña tachado junto al precio */
  previousCents?: number;
};

/** Casilla del catálogo: la bici protagonista sobre un fondo liso, y solo lo esencial debajo. */
export function BikeCard({ bike, href = `/bici/${bike.slug}`, children, corner, preload, previousCents }: Props) {
  return (
    <article className="casilla relative flex flex-col h-full bg-white">
      <Link href={href} className="group relative flex flex-col flex-1 p-2 no-underline focus-inset">
        {/* Hueco para la casilla de comparar (va absoluta, arriba a la derecha). «Eléctrica» va con la marca:
            arriba se pisaba con «Comparar» en móvil, donde la casilla mide unos 165 px */}
        {corner && <div className="min-h-4" aria-hidden="true" />}
        {/* La foto va absoluta: si no, una foto cuadrada estira la caja y rompe la proporción 4:3 de todas.
            Y "viaja" a la ficha: mismo nombre de transición que la foto grande de la galería */}
        <ViewTransition name={`foto-${bike.id}`} share="foto-bici" default="none">
          <div className="relative aspect-[4/3] my-1">
            <Image
              src={bike.imageUrl}
              unoptimized={sinOptimizar(bike.imageUrl)}
              alt=""
              width={600}
              height={400}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="product absolute inset-0 size-full object-contain transition-transform duration-200 ease-ds group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              preload={preload}
            />
          </div>
        </ViewTransition>
        <div className="mt-auto grid gap-0.5">
          <p className="eyebrow">
            {bike.brand}
            {bike.electric && <> · Eléctrica</>}
          </p>
          {/* Hasta 3 líneas: hay nombres de 12 palabras. El texto entero sigue ahí para lectores y en la ficha */}
          <h3 className="text-body font-display leading-tight line-clamp-3 group-hover:underline" title={bike.name}>{bike.name}</h3>
          {/* El precio es el dato con el que se decide: pesa más que la marca */}
          {previousCents && previousCents > bike.priceCents ? (
            <p className="font-display font-semibold num mt-0.5 flex flex-wrap items-baseline gap-x-1">
              <span>{priceLabel(bike)}</span>
              <s className="font-normal text-small text-text-muted">
                <span className="sr-only">Antes </span>{eur(previousCents)}
              </s>
              <span className="font-normal text-small text-rebaja whitespace-nowrap">
                −{Math.round((1 - bike.priceCents / previousCents) * 100)} %<span aria-hidden="true"> ↓</span>
              </span>
            </p>
          ) : (
            <p className="font-display font-semibold num mt-0.5">{priceLabel(bike)}</p>
          )}
          <QualityBadge bike={bike} />
        </div>
        <LinkPending />
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
