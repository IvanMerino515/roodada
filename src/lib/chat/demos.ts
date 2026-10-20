// Conversaciones de prueba (datos inventados de personas ficticias) para enseñar el chat con los cuatro perfiles.
// Solo son mensajes de la persona: las respuestas las genera el motor como con cualquier otro texto.
import type { Level } from "./types";

export const DEMOS: Record<Level, { title: string; messages: string[] }> = {
  novato: {
    title: "Novato que quiere ir al trabajo",
    messages: [
      "Soy novato, hace años que no monto",
      "Quiero algo para ir al trabajo y pasear, unos 700 €",
      "Lo de eléctrica no lo tengo claro",
      "Unos 30 minutos cada día",
      "Mido 1,68",
      "Sí, todo bien",
    ],
  },
  curioso: {
    title: "Curiosa de fin de semana",
    messages: [
      "Salgo de vez en cuando los fines de semana",
      "Me apetecen caminos de tierra y algo de carretera, hasta 1.500 €, sin motor",
      "Un par de horas y mido 1,64",
      "Aluminio y cambio mecánico",
      "Sí",
    ],
  },
  avanzado: {
    title: "Avanzado de carretera y puertos",
    messages: [
      "Avanzado, salgo 3 veces por semana",
      "Carretera, hasta 3.000 € y sin motor",
      "Salidas de 3 horas y mido 1,82",
      "Me interesa el carbono y el cambio me da igual",
      "Entrenar para marchas, desarrollos suaves para puertos y que pese menos de 8,5 kg",
      "Sí, todo bien",
    ],
  },
  pro: {
    title: "Pro de XC",
    messages: [
      "Soy pro, compito en XC",
      "MTB, unos 6.000 €, nada de motor",
      "Unas 2 horas y mido 1,79",
      "Carbono y electrónico",
      "Competición, monoplato con piñón grande para subir y menos de 10 kg",
      "Potenciómetro de serie y tija telescópica",
      "Sí, todo bien",
    ],
  },
};
