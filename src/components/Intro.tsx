"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Intro de la portada: vídeo a pantalla completa, el logo en blanco apareciendo en el centro,
 * el claim y el botón de empezar. El vídeo es decorativo (sin sonido) y se puede pausar;
 * con "reducir movimiento" no se reproduce y se queda la primera imagen.
 */
export function Intro({ bikes }: { bikes: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Sin autoPlay en el HTML: así, con "reducir movimiento", el vídeo no llega a moverse ni un instante
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.play().catch(() => {});
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section aria-labelledby="claim" className="relative h-svh min-h-100 overflow-hidden bg-black text-white">
      <video
        ref={video}
        className="absolute inset-0 size-full object-cover"
        muted
        loop
        playsInline
        preload="auto"
        poster="/intro-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>
      {/* Velo para que el blanco se lea sobre el cielo del vídeo */}
      <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/60" aria-hidden="true" />

      <div className="relative h-full flex flex-col items-center justify-center gap-3 px-2 text-center">
        <Image
          src="/logo-blanco.png"
          alt="Roodada"
          width={800}
          height={200}
          preload
          sizes="(min-width: 768px) 640px, 80vw"
          className="intro-in intro-logo w-[min(80vw,640px)] h-auto"
        />
        <h1 id="claim" className="intro-in intro-claim text-h2 uppercase max-w-80">
          Deja de buscar. Empieza a rodar.
        </h1>
        <p className="intro-in intro-claim max-w-60">
          Seis preguntas y te decimos qué bici te encaja, con datos reales de {bikes} bicis.
        </p>
        <Link
          href="/guia"
          className="intro-in intro-cta btn btn-lg mt-2 bg-white text-black border-white hover:bg-transparent hover:text-white"
        >
          Empezar <span aria-hidden="true">→</span>
        </Link>
      </div>

      <a href="#descubre" className="intro-in intro-cta absolute bottom-2 left-1/2 -translate-x-1/2 eyebrow hidden md:flex flex-col items-center gap-0.5 min-h-6 px-2 hover:underline">
        Descubre Roodada <span aria-hidden="true" className="intro-bounce">↓</span>
      </a>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-2 right-2 eyebrow min-h-6 px-2 border border-white/60 hover:bg-white hover:text-black cursor-pointer"
      >
        {playing ? "Pausar vídeo" : "Reproducir vídeo"}
      </button>
    </section>
  );
}
