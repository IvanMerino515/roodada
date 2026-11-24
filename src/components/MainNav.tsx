"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "../../design-system/react";
import type { Menu } from "@/lib/landings";

type Panel = "bicis" | "marcas" | null;

const n = (v: number) => v.toLocaleString("es-ES", { useGrouping: "always" });

const DIRECTOS = [
  { href: "/guia", label: "Guía" },
  { href: "/comparador", label: "Comparador" },
  { href: "/talla-bicicleta", label: "Tu talla" },
] as const;

const cell =
  "eyebrow flex items-center gap-1 h-full px-2 md:px-3 no-underline cursor-pointer hover:bg-accent hover:text-on-accent aria-[current=page]:bg-accent aria-[current=page]:text-on-accent aria-expanded:bg-accent aria-expanded:text-on-accent";

/**
 * Navegación principal. En escritorio, la barra de celdas con «Bicis» y «Marcas» que abren un panel a
 * todo el ancho; en móvil, un botón «Menú» con todo en desplegables. Se abre con clic o teclado y se
 * cierra con Esc, al pulsar fuera o al cambiar de página; el foco vuelve al botón.
 */
export function MainNav({ menu }: { menu: Menu | null }) {
  const path = usePathname();
  const [open, setOpen] = useState<Panel>(null);
  const [movil, setMovil] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  // Al cambiar de página, todo cerrado
  const [prevPath, setPrevPath] = useState(path);
  if (prevPath !== path) {
    setPrevPath(path);
    setOpen(null);
    setMovil(false);
  }

  useEffect(() => {
    if (!open && !movil) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      setMovil(false);
      trigger.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (open && root.current && !root.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    // Con el menú del móvil abierto, la página de detrás no se desplaza
    if (movil) document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      document.documentElement.style.overflow = "";
    };
  }, [open, movil]);

  function toggle(p: Exclude<Panel, null>, boton: HTMLButtonElement) {
    trigger.current = boton;
    setOpen((o) => (o === p ? null : p));
  }
  const en = (href: string) => path === href || path.startsWith(`${href}/`);

  return (
    <div ref={root} className="flex items-stretch h-full">
      {/* Escritorio */}
      <ul className="hidden lg:flex items-stretch list-none m-0 p-0 h-full">
        {menu && (
          <>
            <li className="border-l border-current">
              <button type="button" className={cell} aria-expanded={open === "bicis"} aria-controls="panel-bicis" aria-current={en("/bicis") ? "page" : undefined} onClick={(e) => toggle("bicis", e.currentTarget)}>
                Bicis <Icon name="chevron-down" size={16} className={`transition-transform duration-200 ease-ds motion-reduce:transition-none ${open === "bicis" ? "rotate-180" : ""}`} />
              </button>
            </li>
            <li className="border-l border-current">
              <button type="button" className={cell} aria-expanded={open === "marcas"} aria-controls="panel-marcas" aria-current={en("/marcas") ? "page" : undefined} onClick={(e) => toggle("marcas", e.currentTarget)}>
                Marcas <Icon name="chevron-down" size={16} className={`transition-transform duration-200 ease-ds motion-reduce:transition-none ${open === "marcas" ? "rotate-180" : ""}`} />
              </button>
            </li>
          </>
        )}
        {DIRECTOS.map(({ href, label }) => (
          <li key={href} className="border-l border-current">
            <Link href={href} aria-current={en(href) ? "page" : undefined} className={cell}>
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Móvil */}
      <button
        type="button"
        className={`lg:hidden border-l border-current ${cell}`}
        aria-expanded={movil}
        aria-controls="menu-movil"
        onClick={(e) => {
          trigger.current = e.currentTarget;
          setMovil(true);
        }}
      >
        Menú <Icon name="menu" size={18} />
      </button>

      {menu && open === "bicis" && (
        <PanelEscritorio id="panel-bicis" titulo="Tipos de bici" todas={{ href: "/bicis", texto: "Todos los tipos" }}>
          <div className="grid grid-cols-6 gap-x-3 gap-y-2">
            {menu.tipos.map((t) => (
              <div key={t.path} className="grid gap-1 content-start border-t border-border pt-1">
                <Link href={t.path} className="font-display text-h4 uppercase hover:underline">
                  {t.titulo} <span className="eyebrow num opacity-70">{n(t.n)}</span>
                </Link>
                <ul className="grid gap-0.5 list-none m-0 p-0 text-small">
                  {t.subs.map((s) => (
                    <li key={s.path}>
                      <Link href={s.path} className="hover:underline">{s.titulo}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1 mt-3">
            <Link href="/guia" className="bg-surface border border-border p-2 grid gap-0.5 no-underline group">
              <span className="eyebrow">¿No sabes cuál?</span>
              <span className="font-display text-h4 uppercase group-hover:underline">Te decimos cuál te encaja <span aria-hidden="true">→</span></span>
            </Link>
            <Link href="/talla-bicicleta" className="bg-white border border-border p-2 grid gap-0.5 no-underline group">
              <span className="eyebrow">Calculadora</span>
              <span className="font-display text-h4 uppercase group-hover:underline">Tu talla en cada marca <span aria-hidden="true">→</span></span>
            </Link>
          </div>
        </PanelEscritorio>
      )}

      {menu && open === "marcas" && (
        <PanelEscritorio id="panel-marcas" titulo="Marcas" todas={{ href: "/marcas", texto: "Todas las marcas" }}>
          <p className="eyebrow mb-1">Con más bicis</p>
          <ul className="grid grid-cols-6 gap-1 list-none m-0 p-0 mb-3">
            {[...menu.marcas].sort((a, b) => b.n - a.n).slice(0, 6).map((m) => (
              <li key={m.slug}>
                <Link href={`/marcas/${m.slug}`} className="grid bg-white border border-border p-1.5 no-underline hover:underline">
                  <span className="font-display text-h4 uppercase">{m.nombre}</span>
                  <span className="eyebrow num opacity-70">{n(m.n)} bicis</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mb-1">De la A a la Z</p>
          <ul className="columns-6 gap-3 list-none m-0 p-0 text-small">
            {menu.marcas.map((m) => (
              <li key={m.slug} className="break-inside-avoid">
                <Link href={`/marcas/${m.slug}`} className="flex justify-between gap-1 py-0.5 hover:underline">
                  {m.nombre} <span className="num opacity-60">{n(m.n)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </PanelEscritorio>
      )}

      {movil && (
        <div id="menu-movil" role="dialog" aria-modal="true" aria-label="Menú" className="lg:hidden fixed inset-0 z-50 bg-bg text-text overflow-y-auto llegar">
          <div className="flex items-stretch justify-between h-8 border-b border-border">
            <Link href="/" className="eyebrow flex items-center px-2">Roodada</Link>
            <button type="button" className={`border-l border-border ${cell}`} onClick={() => { setMovil(false); trigger.current?.focus(); }} autoFocus>
              Cerrar <Icon name="close" size={18} />
            </button>
          </div>
          <ul className="list-none m-0 p-0">
            {DIRECTOS.map(({ href, label }) => (
              <li key={href} className="border-b border-border">
                <Link href={href} aria-current={en(href) ? "page" : undefined} className="font-display text-h3 uppercase flex items-center justify-between px-2 min-h-8 aria-[current=page]:bg-accent aria-[current=page]:text-on-accent">
                  {label} <Icon name="arrow-right" size={20} />
                </Link>
              </li>
            ))}
            {menu && (
              <>
                <Desplegable titulo="Bicis">
                  {menu.tipos.map((t) => (
                    <div key={t.path} className="grid gap-0.5 py-1 border-t border-border first:border-t-0">
                      <Link href={t.path} className="font-display text-h4 uppercase">
                        {t.titulo} <span className="eyebrow num opacity-70">{n(t.n)}</span>
                      </Link>
                      {t.subs.length > 0 && (
                        <ul className="flex flex-wrap gap-x-2 gap-y-0.5 list-none m-0 p-0 text-small">
                          {t.subs.map((s) => (
                            <li key={s.path}><Link href={s.path} className="underline">{s.titulo}</Link></li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  <Link href="/bicis" className="btn mt-1">Todos los tipos <Icon name="arrow-right" size={18} /></Link>
                </Desplegable>
                <Desplegable titulo="Marcas">
                  <ul className="columns-2 gap-2 list-none m-0 p-0">
                    {menu.marcas.map((m) => (
                      <li key={m.slug} className="break-inside-avoid">
                        <Link href={`/marcas/${m.slug}`} className="flex justify-between gap-1 py-1 border-b border-border">
                          {m.nombre} <span className="num opacity-60">{n(m.n)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Desplegable>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Panel a todo el ancho bajo la barra (escritorio) */
function PanelEscritorio({ id, titulo, todas, children }: { id: string; titulo: string; todas: { href: string; texto: string }; children: ReactNode }) {
  return (
    <div id={id} className="hidden lg:block absolute inset-x-0 top-full bg-bg text-text border-y border-border shadow-[0_12px_24px_-16px_rgb(0_0_0/0.25)] llegar">
      <div className="wrap py-3">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="font-display text-h3 uppercase">{titulo}</p>
          <Link href={todas.href} className="btn">
            {todas.texto} <Icon name="arrow-right" size={18} />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Sección plegable del menú del móvil */
function Desplegable({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <li className="border-b border-border">
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)} className="w-full font-display text-h3 uppercase flex items-center justify-between px-2 min-h-8 cursor-pointer">
        {titulo} <Icon name={abierto ? "minus" : "plus"} size={20} />
      </button>
      {abierto && <div className="px-2 pb-2 grid gap-1 llegar">{children}</div>}
    </li>
  );
}
