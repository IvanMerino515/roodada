import { Cluster, Container, Heading, Hero, Section, Split, Stack, Text, Button } from "../../design-system/react";
import { getCatalog } from "@/lib/catalog/load";

export default async function HomePage() {
  const bikes = await getCatalog();
  const brands = new Set(bikes.map((b) => b.brand)).size;
  const n = bikes.length.toLocaleString("es-ES");

  return (
    <>
      <Hero>
        <Container>
          <Stack>
            <Heading level={1} size="display">Encuentra la bici que te encaja</Heading>
            <Text className="max-w-narrow">
              Seis preguntas y te enseñamos las bicis que encajan con tu uso, tu altura y tu presupuesto, y por qué.
              Sin publicidad disfrazada: solo los datos que publica cada marca.
            </Text>
            <Cluster>
              <Button size="lg" href="/guia">Empezar la guía</Button>
              <Button size="lg" variant="secondary" href="/comparador">Ir al comparador</Button>
            </Cluster>
          </Stack>
        </Container>
      </Hero>

      <Section>
        <Container>
          <Split>
            <Stack>
              <Heading level={2}>Cómo elegimos</Heading>
              <Text>
                Analizamos {n} bicis de {brands} marcas: talla por altura, geometría, grupo de transmisión, frenos, peso y
                precio. Para cada una calculamos una nota de calidad-precio comparándola con las de su mismo tipo.
              </Text>
            </Stack>
            <ol className="grid gap-3 list-none p-0">
              <li>
                <Heading level={3} size="h4">1 · Tu talla primero</Heading>
                <Text size="small">Te decimos si la talla sale de la tabla oficial de la marca, si es una estimación o si estás entre dos.</Text>
              </li>
              <li>
                <Heading level={3} size="h4">2 · Lo que te importa</Heading>
                <Text size="small">Comodidad, ligereza, componentes, autonomía… Ordenamos según lo que tú eliges.</Text>
              </li>
              <li>
                <Heading level={3} size="h4">3 · Sin inventar</Heading>
                <Text size="small">Si una marca no publica un dato, te lo decimos. Nunca lo rellenamos.</Text>
              </li>
            </ol>
          </Split>
        </Container>
      </Section>
    </>
  );
}
