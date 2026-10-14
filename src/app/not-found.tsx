import Link from "next/link";

/** 404: la retícula de siempre, un titular claro y los dos caminos para seguir. */
export default function NotFound() {
  return (
    <div className="wrap grid-swiss gap-y-3 pt-8 pb-12">
      <p className="col-span-4 md:col-span-8 lg:col-span-12 eyebrow">Error 404</p>
      <h1 className="col-span-4 md:col-span-8 lg:col-span-9 text-display uppercase">Por aquí no se rueda</h1>
      <p className="col-span-4 md:col-span-6 lg:col-span-6">
        Esta página no existe o la bici ya no está en el catálogo. Sigue por uno de estos caminos:
      </p>
      <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-1 flex flex-wrap gap-1 mt-1">
        <Link href="/guia" className="btn btn-solid btn-lg">
          Empezar la guía <span aria-hidden="true">→</span>
        </Link>
        <Link href="/comparador" className="btn btn-lg">
          Ver el catálogo <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
