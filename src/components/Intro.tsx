"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "../../design-system/react";

/**
 * Intro de la portada: vídeo a pantalla completa, el logo en blanco apareciendo en el centro,
 * el claim y el botón de empezar. El vídeo es decorativo (sin sonido) y se puede pausar;
 * con "reducir movimiento" no se reproduce y se queda la primera imagen.
 */
export function Intro({ bikes }: { bikes: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Sin autoPlay en el HTML: así, con "reducir movimiento", el vídeo no llega a moverse ni un instante.
    // preload="none": con movimiento reducido o ahorro de datos no se descargan sus 4 MB; se queda el póster
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!saveData && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) video.current?.play().catch(() => {});
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section id="intro" aria-labelledby="claim" className="on-dark relative min-h-svh overflow-hidden bg-black text-white">
      <video
        ref={video}
        className="absolute inset-0 size-full object-cover"
        muted
        loop
        playsInline
        preload="none"
        poster="/intro-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>
      {/* Velo ligero para no apagar el vídeo, y sombra solo detrás del texto para que el blanco se lea sobre el cielo */}
      <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/10 to-black/55" aria-hidden="true" />
      <div className="absolute inset-0 bg-radial from-black/45 via-black/20 via-45% to-transparent to-75%" aria-hidden="true" />

      {/* Al menos la pantalla entera; si no cabe (móvil en horizontal), crece y se baja con scroll. py-10 deja sitio a la cabecera */}
      <div className="relative min-h-svh flex flex-col items-center justify-center gap-3 px-2 py-10 text-center">
        <Image
          src="/logo-blanco.png"
          alt="Roodada"
          width={800}
          height={200}
          preload
          sizes="(min-width: 768px) 400px, 70vw"
          className="intro-in intro-logo w-[min(70vw,400px)] [@media(max-height:500px)]:w-[min(40vw,240px)] h-auto"
        />
        <h1 id="claim" className="intro-in intro-claim text-display uppercase max-w-120">
          Deja de buscar. Empieza a rodar.
        </h1>
        <p className="intro-in intro-claim max-w-60">
          Unas pocas preguntas y te decimos qué bici te encaja, con datos reales de {bikes} bicis.
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
        aria-label={playing ? "Pausar vídeo" : "Reproducir vídeo"}
        className="absolute bottom-2 right-2 grid place-items-center size-6 border border-white/60 hover:bg-white hover:text-black cursor-pointer"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width={20} height={20} fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
        ) : (
          <Icon name="play" size={20} />
        )}
      </button>
    </section>
  );
}
