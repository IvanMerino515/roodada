import type { Metadata } from "next";

import { Guide } from "@/components/Guide";

export const metadata: Metadata = {
  title: "Guía: encuentra tu bici",
  description: "Seis preguntas y te enseñamos las bicis que encajan con tu uso, tu altura y tu presupuesto.",
};

export default function GuidePage() {
  return (
    <div className="wrap pt-4 pb-8">
      <Guide />
    </div>
  );
}
