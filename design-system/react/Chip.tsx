import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from './cx'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; onRemove?: () => void; children: ReactNode }

/** Filtro o selección (botón conmutable). Con onRemove, etiqueta con botón para quitarla. */
export function Chip({ selected = false, onRemove, className, children, ...props }: ChipProps) {
  if (onRemove)
    return (
      <span className={cx('ds-chip', className)} data-selected={selected || undefined}>
        {children}
        <button type="button" className="ds-chip__remove" aria-label="Quitar" onClick={onRemove}>
          ×
        </button>
      </span>
    )
  return (
    <button type="button" aria-pressed={selected} className={cx('ds-chip', className)} {...props}>
      {children}
    </button>
  )
}
