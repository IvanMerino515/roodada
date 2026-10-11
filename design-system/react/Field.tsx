import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cx } from './cx'

type FieldProps = { label?: ReactNode; hint?: ReactNode; error?: ReactNode; htmlFor?: string; className?: string; children: ReactNode }

/** Envoltorio de un control de formulario: etiqueta, ayuda y error (el error sustituye a la ayuda). */
export function Field({ label, hint, error, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cx('ds-field', className)}>
      {label && (
        <label className="ds-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="ds-error-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="ds-hint">{hint}</p>
      ) : null}
    </div>
  )
}

type Invalid = { invalid?: boolean }

export function Input({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & Invalid) {
  return <input className={cx('ds-input', className)} aria-invalid={invalid || undefined} {...props} />
}

export function Textarea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & Invalid) {
  return <textarea className={cx('ds-textarea', className)} aria-invalid={invalid || undefined} {...props} />
}

export function Select({ className, invalid, ...props }: SelectHTMLAttributes<HTMLSelectElement> & Invalid) {
  return <select className={cx('ds-select', className)} aria-invalid={invalid || undefined} {...props} />
}

export function Checkbox({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode }) {
  return (
    <label className={cx('ds-check', className)}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
}
