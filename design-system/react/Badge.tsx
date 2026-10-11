import type { HTMLAttributes } from 'react'

import { cx } from './cx'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cx('ds-badge', tone !== 'neutral' && 'ds-badge--' + tone, className)} {...props} />
}
