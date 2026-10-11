import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

import { cx } from './cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
type Base = { variant?: ButtonVariant; size?: ButtonSize }
type AsButton = Base & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type AsLink = Base & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
export type ButtonProps = AsButton | AsLink

/**
 * Botón del sistema. Con href se renderiza como enlace con aspecto de botón.
 * Un solo botón primary por vista; secondary/ghost para el resto de acciones.
 */
export function Button({ variant = 'primary', size = 'md', className, ...rest }: ButtonProps) {
  const cls = cx('ds-btn', 'ds-btn--' + variant, size !== 'md' && 'ds-btn--' + size, className)
  if (rest.href !== undefined) return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} />
  const { type = 'button', ...props } = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return <button type={type} className={cls} {...props} />
}
