import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

import { cx } from './cx'

/** Grupo de pestañas. La lógica (qué panel se muestra) la pone quien lo usa. */
export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tablist" className={cx('ds-tabs', className)} {...props} />
}

export function Tab({ selected = false, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button type="button" role="tab" aria-selected={selected} tabIndex={selected ? 0 : -1} className={cx('ds-tab', className)} {...props} />
}
