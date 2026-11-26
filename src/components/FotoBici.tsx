"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

import { track } from "@/lib/actividad/cliente";
import { SIN_FOTO, sinOptimizar } from "@/lib/imagen";

/** Cada foto rota se apunta una vez por visita a la página, aunque salga en varias casillas */
const avisadas = new Set<string>();

function avisar(url: string, bici?: number) {
  if (avisadas.has(url)) return;
  avisadas.add(url);
  let host = "";
  try {
    host = new URL(url).host;
  } catch {}
  track("foto_rota", { bici: bici ?? null, host, url: url.slice(0, 300) });
}

type Props = Omit<ImageProps, "src" | "onError" | "unoptimized"> & {
  src: string;
  /** Otras fotos de la misma bici, por orden: si la primera no carga, se pasa a la siguiente */
  fallbacks?: string[];
  /** Id de la bici, para el aviso «foto_rota» */
  bici?: number;
};

/**
 * Foto de una bici que se defiende sola (26-11-2026, fotos de Cube caídas):
 * 1. Si la versión optimizada por Vercel falla (cuota agotada, 402, o error al optimizar), prueba la foto
 *    original de la marca tal cual.
 * 2. Si la original tampoco carga (la marca la ha movido o borrado: 404), apunta «foto_rota» y pasa a la
 *    siguiente foto de la bici; si no quedan, «sin foto». Nunca se queda el hueco roto.
 */
export function FotoBici({ src, fallbacks = [], bici, alt, ...rest }: Props) {
  const list = [src, ...fallbacks.filter((f) => f && f !== src)];
  const [index, setIndex] = useState(0);
  const [direct, setDirect] = useState(false);
  const url = list[index] ?? SIN_FOTO;
  return (
    <Image
      {...rest}
      key={`${url}|${direct}`}
      src={url}
      alt={alt}
      unoptimized={direct || sinOptimizar(url)}
      onError={() => {
        if (url === SIN_FOTO) return;
        if (!direct && !sinOptimizar(url) && url.startsWith("http")) {
          setDirect(true);
          return;
        }
        avisar(url, bici);
        setDirect(false);
        setIndex((i) => i + 1);
      }}
    />
  );
}
