import type { HTMLAttributes } from 'react'

import { cx } from './cx'

type Div = HTMLAttributes<HTMLDivElement>

/** Contenedor centrado con los márgenes de cada dispositivo. size: narrow (texto largo), wide (galerías), full (sin límite). */
export function Container({ size, className, ...props }: Div & { size?: 'narrow' | 'wide' | 'full' }) {
  return <div className={cx('ds-container', size && 'ds-container--' + size, className)} {...props} />
}

/** Sección de página con el espacio vertical del sistema (sm, md por defecto, lg). */
export function Section({ size, className, ...props }: HTMLAttributes<HTMLElement> & { size?: 'sm' | 'lg' }) {
  return <section className={cx('ds-section', size && 'ds-section--' + size, className)} {...props} />
}

/** Retícula de columnas del sistema (columnas, separación y márgenes cambian por dispositivo). */
export function Grid({ className, ...props }: Div) {
  return <div className={cx('ds-grid', className)} {...props} />
}

/** Apila elementos en vertical con la separación del sistema. */
export function Stack({ className, ...props }: Div) {
  return <div className={cx('ds-stack', className)} {...props} />
}

/** Fila que salta de línea (botones, etiquetas, enlaces). */
export function Cluster({ className, ...props }: Div) {
  return <div className={cx('ds-cluster', className)} {...props} />
}

/** Dos columnas (1:1) apiladas en móvil. reverse pone la segunda primero en tablet y escritorio. */
export function Split({ reverse, className, ...props }: Div & { reverse?: boolean }) {
  return <div className={cx('ds-split', reverse && 'ds-split--reverse', className)} {...props} />
}

/** Rejilla de tarjetas: 1 columna en móvil, 2 en tablet, 4 en escritorio. */
export function Cards({ className, ...props }: Div) {
  return <div className={cx('ds-cards', className)} {...props} />
}

/** Texto largo (artículos, aviso legal) con ancho de lectura y ritmo entre párrafos y títulos. */
export function Prose({ className, ...props }: Div) {
  return <div className={cx('ds-prose', className)} {...props} />
}

/** Cabecera de página a 70% de la altura de pantalla, alineada a la izquierda. */
export function Hero({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <header className={cx('ds-hero', className)} {...props} />
}
