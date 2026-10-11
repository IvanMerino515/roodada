import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge, Card, Heading, Stack, Text } from "../../design-system/react";
import type { Bike } from "@/lib/catalog/types";
import { CATEGORY_LABEL, DISCIPLINE_LABEL, eur } from "@/lib/format";
import { QualityBadge } from "./QualityBadge";

type Props = {
  bike: Bike;
  /** Enlace de la ficha; los resultados de la guía añaden la altura para marcar la talla */
  href?: string;
  /** Contenido extra bajo el precio: razones, avisos, casilla de comparar… */
  children?: ReactNode;
  topBadge?: ReactNode;
  preload?: boolean;
};

export function BikeCard({ bike, href = `/bici/${bike.slug}`, children, topBadge, preload }: Props) {
  return (
    <Card as="article" className="flex flex-col gap-2 h-full">
      <Link href={href} className="block bg-white" aria-label={`${bike.brand} ${bike.name}`}>
        <Image
          src={bike.imageUrl}
          alt={`${bike.brand} ${bike.name}`}
          width={600}
          height={400}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="w-full h-auto aspect-[3/2] object-contain"
          preload={preload}
        />
      </Link>
      <Stack className="flex-1">
        <div className="flex flex-wrap gap-1">
          {topBadge}
          <Badge>{bike.specs.discipline === "infantil" ? CATEGORY_LABEL[bike.category] : DISCIPLINE_LABEL[bike.specs.discipline]}</Badge>
          {bike.electric && <Badge tone="accent">Eléctrica</Badge>}
        </div>
        <div>
          <Text size="label" as="p">{bike.brand}</Text>
          <Heading level={3} size="h4">
            <Link href={href} className="hover:underline">{bike.name}</Link>
          </Heading>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <Text as="p" className="text-h4 font-display">{eur(bike.priceCents)}</Text>
          <QualityBadge bike={bike} />
        </div>
        {children}
      </Stack>
    </Card>
  );
}
