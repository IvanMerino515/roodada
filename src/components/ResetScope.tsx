"use client";

import { createContext, Fragment, useCallback, useContext, useState, type ReactNode } from "react";

import { clearCompare } from "./Compare";

/**
 * «Empezar de cero» al pulsar el logo: vuelve a montar todo el contenido de la página, así los filtros,
 * la guía y cualquier selección a medias vuelven a sus valores por defecto. Hace falta porque, con Cache
 * Components, Next guarda el estado de las páginas visitadas (un <select> cambiado sigue cambiado al volver).
 * También vacía la selección para comparar.
 */
const ResetContext = createContext<{ epoch: number; reset: () => void }>({ epoch: 0, reset: () => {} });

export function ResetScope({ children }: { children: ReactNode }) {
  const [epoch, setEpoch] = useState(0);
  const reset = useCallback(() => {
    clearCompare();
    setEpoch((e) => e + 1);
  }, []);
  return <ResetContext.Provider value={{ epoch, reset }}>{children}</ResetContext.Provider>;
}

/** Lo que va dentro se monta de nuevo en cada reset (el contenido de <main>) */
export function ResetBoundary({ children }: { children: ReactNode }) {
  const { epoch } = useContext(ResetContext);
  return <Fragment key={epoch}>{children}</Fragment>;
}

export const useReset = () => useContext(ResetContext).reset;
