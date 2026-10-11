import type { AnchorHTMLAttributes } from 'react'

import { cx } from './cx'

/** Enlace dentro de un texto. Para acciones usa Button. */
export function TextLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cx('ds-link', className)} {...props} />
}
