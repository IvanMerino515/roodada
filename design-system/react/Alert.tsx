import type { ReactNode } from 'react'

import { cx } from './cx'

export type AlertTone = 'neutral' | 'success' | 'warning' | 'danger'
const ICON: Record<AlertTone, string> = { neutral: 'ℹ', success: '✓', warning: '⚠', danger: '⚠' }

export function Alert({ tone = 'neutral', title, onClose, className, children }: { tone?: AlertTone; title?: ReactNode; onClose?: () => void; className?: string; children: ReactNode }) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cx('ds-alert', tone !== 'neutral' && 'ds-alert--' + tone, className)}>
      {(title || onClose) && (
        <div className="ds-alert__head">
          <span>{title}</span>
          {onClose && (
            <button type="button" className="ds-alert__close" aria-label="Cerrar" onClick={onClose}>
              ×
            </button>
          )}
        </div>
      )}
      <div className="ds-alert__body">
        <span className="ds-alert__icon" aria-hidden="true">
          {ICON[tone]}
        </span>
        <div>{children}</div>
      </div>
    </div>
  )
}
