// Huecos de carga con la forma real de lo que va a llegar: mismo tamaño y misma rejilla, para que al
// llegar los datos nada salte. Para el lector de pantalla, una sola frase ("Cargando…") y aria-busy.
import { ViewTransition, type ReactNode } from "react";

/** Envuelve el hueco: al llegar el contenido, el hueco se va rápido. */
export function SkeletonExit({ children }: { children: ReactNode }) {
  return (
    <ViewTransition exit="salir" default="none">
      {children}
    </ViewTransition>
  );
}

/** Envuelve el contenido que sustituye a un hueco: entra subiendo un poco. */
export function ContentEnter({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="entrar" default="none">
      {children}
    </ViewTransition>
  );
}

function Line({ w, className = "" }: { w: string; className?: string }) {
  return <span className={`hueco block h-[0.9em] ${className}`} style={{ width: w }} />;
}

/** Hueco de una casilla de bici (BikeCard) */
export function BikeCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white p-2" aria-hidden="true">
      <div className="min-h-4" />
      <div className="hueco aspect-[4/3] my-1" />
      <div className="mt-auto grid gap-1">
        <Line w="35%" />
        <Line w="85%" />
        <Line w="30%" />
      </div>
    </div>
  );
}

function Header({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="wrap grid-swiss gap-y-2 pt-4 pb-3 items-end">
      <p className="col-span-4 md:col-span-5 lg:col-span-8 text-display uppercase font-display" aria-hidden="true">{title}</p>
      <div className="col-span-4 md:col-span-3 lg:col-span-4 grid gap-1">{children}</div>
    </div>
  );
}

/** Comparador: título, total, barra de filtros y la rejilla de casillas */
export function CatalogSkeleton() {
  return (
    <SkeletonExit>
      <div aria-busy="true">
        <p className="sr-only" role="status">Cargando bicis…</p>
        <Header title="Comparador">
          <Line w="40%" className="h-[2em]" />
          <Line w="80%" />
        </Header>
        <div className="border-y border-border bg-bg" aria-hidden="true">
          <div className="hueco h-6" />
        </div>
        <ul className="wrap py-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-2 list-none m-0" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i}>
              <BikeCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </SkeletonExit>
  );
}

/** Resultados de la guía: tres recomendaciones (número, foto, datos, a favor y en contra) */
export function ResultsSkeleton() {
  return (
    <SkeletonExit>
      <div aria-busy="true">
        <p className="sr-only" role="status">Buscando tus bicis…</p>
        <Header title="Tus bicis">
          <Line w="90%" />
          <Line w="60%" />
        </Header>
        <ol className="wrap list-none my-0 py-2 grid grid-cols-[minmax(0,1fr)] gap-2" aria-hidden="true">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="grid lg:grid-cols-12 border border-border bg-white">
              <div className="lg:col-span-4 grid grid-cols-[auto_1fr] border-b lg:border-b-0 lg:border-r border-border">
                <p className="font-display text-h1 num leading-none p-2 border-r border-border opacity-30">{String(i + 1).padStart(2, "0")}</p>
                <div className="p-2"><div className="hueco aspect-[3/2]" /></div>
              </div>
              <div className="lg:col-span-4 p-2 md:p-3 grid gap-2 content-start border-b lg:border-b-0 lg:border-r border-border">
                <Line w="40%" />
                <Line w="80%" className="h-[1.6em]" />
                <Line w="35%" className="h-[1.4em]" />
                <div className="hueco h-6" />
              </div>
              <div className="lg:col-span-4 p-2 md:p-3 grid gap-1 content-start">
                <Line w="30%" />
                <Line w="90%" />
                <Line w="75%" />
                <Line w="85%" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SkeletonExit>
  );
}

/** Comparativa: cabecera con las fotos y filas de dato */
export function ComparisonSkeleton() {
  return (
    <SkeletonExit>
      <div aria-busy="true">
        <p className="sr-only" role="status">Preparando la comparativa…</p>
        <Header title="Comparativa">
          <Line w="90%" />
          <Line w="70%" />
        </Header>
        <div className="wrap pb-4" aria-hidden="true">
          <div className="border border-border bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,2fr))] gap-2 p-2 border-b border-border">
              <span />
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="grid gap-1">
                  <div className="hueco aspect-[3/2]" />
                  <Line w="70%" />
                </div>
              ))}
            </div>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,2fr))] gap-2 px-2 py-1.5 border-t border-border first:border-t-0">
                <Line w="60%" />
                <Line w="50%" />
                <Line w="45%" />
                <Line w="55%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonExit>
  );
}
