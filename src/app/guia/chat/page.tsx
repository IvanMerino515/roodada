import type { Metadata } from "next";

import { ChatGuide } from "@/components/ChatGuide";

export const metadata: Metadata = {
  title: "Guía conversacional: encuentra tu bici hablando",
  description: "Cuéntale a Radio cómo montas en bici y te recomienda qué tipo de bici, qué gama y qué talla te encajan.",
  robots: { index: false }, // prueba: aún no sustituye a /guia
};

export default function ChatGuidePage() {
  return (
    <div className="wrap pt-4 pb-8">
      <ChatGuide />
    </div>
  );
}
