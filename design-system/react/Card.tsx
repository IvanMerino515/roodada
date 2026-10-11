import type { HTMLAttributes } from 'react'

import { cx } from './cx'

type CardProps = HTMLAttributes<HTMLElement> & { as?: 'div' | 'article' | 'section' | 'li' }

export function Card({ as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cx('ds-card', className)} {...props} />
}
