import type { Metadata } from "next";
import Link from "next/link";

import { Guide } from "@/components/Guide";

export const metadata: Metadata = {
  title: "Guía: encuentra tu bici",
  description: "Unas pocas preguntas y te enseñamos las bicis que encajan con tu uso, tu altura y tu presupuesto.",
};

export default function GuidePage() {
  return (
    <div className="wrap pt-4 pb-8">
      <p className="text-small mb-3">
        ¿Prefieres contarlo con tus palabras? <Link href="/guia/chat" className="link">Prueba la guía conversacional</Link> (en pruebas).
      </p>
      <Guide />
    </div>
  );
}
