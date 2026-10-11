import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Alert, Badge, Button, Cards, Cluster, Container, Heading, Section, Stack, Text } from "../../../../design-system/react";
import { BikeCard } from "@/components/BikeCard";
import { CompareProvider, CompareToggle } from "@/components/Compare";
import { getCatalog } from "@/lib/catalog/load";
import { eur } from "@/lib/format";
import { recommend } from "@/lib/recommender";
import { ELECTRIC, LEVELS, PRIORITIES, USES, parseAnswers, type Answers } from "@/lib/recommender/questions";

export const metadata: Metadata = {
  title: "Tus bicis recomendadas",
  robots: { index: false }, // cada combinación de respuestas es una URL distinta
};

export default function ResultsPage({ searchParams }: PageProps<"/guia/resultados">) {
  return (
    <Section size="sm">
      <Container>
        <Suspense fallback={<Text>Buscando tus bicis…</Text>}>
          {searchParams.then((sp) => (
            <Results params={sp} />
          ))}
        </Suspense>
      </Container>
    </Section>
  );
}

async function Results({ params }: { params: Record<string, string | string[] | undefined> }) {
  const answers = parseAnswers(params);
  if (!answers) {
    return (
      <Alert tone="warning" title="Faltan respuestas">
        No hemos podido leer tus respuestas. <Link href="/guia" className="ds-link">Vuelve a la guía</Link>.
      </Alert>
    );
  }

  const { results, matched } = recommend(await getCatalog(), answers);

  return (
    <Stack>
      <Heading level={1} size="h2">
        {results.length ? `Tus ${results.length === 1 ? "bici" : `${results.length} bicis`}` : "Sin resultados"}
      </Heading>
      <Summary answers={answers} matched={matched} shown={results.length} />

      {results.length === 0 ? (
        <Alert tone="warning" title="Ninguna bici encaja con todo">
          Prueba a subir el presupuesto, a cambiar si la quieres eléctrica o a revisar tu altura.{" "}
          <Link href="/guia" className="ds-link">Cambiar respuestas</Link>
        </Alert>
      ) : (
        <CompareProvider>
          <Cards>
            {results.map((r, i) => (
              <BikeCard
                key={r.bike.id}
                bike={r.bike}
                href={`/bici/${r.bike.slug}?altura=${answers.altura}`}
                preload={i < 4}
                topBadge={i === 0 ? <Badge tone="success">La que más encaja</Badge> : undefined}
              >
                <ul className="grid gap-1 text-small list-none p-0">
                  {r.reasons.map((reason) => (
                    <li key={reason}>✓ {reason}</li>
                  ))}
                </ul>
                {r.warnings.length > 0 && (
                  <ul className="grid gap-1 text-small list-none p-0">
                    {r.warnings.map((w) => (
                      <li key={w}>! {w}</li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <Text size="label" as="p" title={`Confianza ${r.confidence}: según los datos que publica la marca`}>
                    Encaje {r.score}/100
                  </Text>
                  <CompareToggle slug={r.bike.slug} />
                </div>
              </BikeCard>
            ))}
          </Cards>
        </CompareProvider>
      )}
    </Stack>
  );
}

function Summary({ answers: a, matched, shown }: { answers: Answers; matched: number; shown: number }) {
  const bits = [
    USES[a.uso].label,
    a.uso === "infantil" ? null : ELECTRIC[a.electrica],
    `hasta ${eur(a.presupuesto * 100)}`,
    `${a.altura} cm`,
    a.uso === "infantil" ? null : LEVELS[a.nivel].label,
    ...a.prioridades.map((p) => PRIORITIES[p].label),
  ].filter(Boolean);
  return (
    <Stack>
      <Cluster>
        {bits.map((b) => (
          <Badge key={b}>{b}</Badge>
        ))}
        <Button variant="ghost" size="sm" href="/guia">Cambiar respuestas</Button>
      </Cluster>
      <Text size="small">
        {matched > shown
          ? `${matched} bicis encajan; te enseñamos las ${shown} mejores, con como mucho dos versiones de cada modelo.`
          : `${matched} ${matched === 1 ? "bici encaja" : "bicis encajan"} con tus respuestas.`}{" "}
        Ordenadas por encaje: talla, calidad-precio y lo que has dicho que te importa.
      </Text>
    </Stack>
  );
}
