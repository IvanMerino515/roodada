import type { HTMLAttributes } from 'react'

import { cx } from './cx'

type HeadingSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4'

/** Título. level fija la etiqueta (semántica); size, el estilo si debe ser distinto. Un solo h1 por página. */
export function Heading({ level = 2, size, className, ...props }: HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6; size?: HeadingSize }) {
  const Tag = ('h' + level) as 'h1'
  const style = size || (level <= 4 ? ('h' + level) as HeadingSize : 'h4')
  return <Tag className={cx('ds-' + style, className)} {...props} />
}

type TextSize = 'body' | 'small' | 'label' | 'mono'

export function Text({ size = 'body', muted, as: Tag = 'p', className, ...props }: HTMLAttributes<HTMLElement> & { size?: TextSize; muted?: boolean; as?: 'p' | 'span' | 'div' | 'small' }) {
  return <Tag className={cx(size === 'label' ? 'ds-label-text' : 'ds-' + size, muted && 'ds-muted', className)} {...props} />
}
