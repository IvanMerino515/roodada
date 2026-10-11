import type { SVGAttributes } from 'react'

import { cx } from './cx'

// Generado por Office: iconos con el estilo de Roodada (trazo 1.75, round/round)
const ICONS = {
  "search": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>",
    "fill": false
  },
  "menu": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M4 5h16\"/><path d=\"M4 12h16\"/><path d=\"M4 19h16\"/>",
    "fill": false
  },
  "close": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>",
    "fill": false
  },
  "plus": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>",
    "fill": false
  },
  "minus": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14\"/>",
    "fill": false
  },
  "check": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M20 6 9 17l-5-5\"/>",
    "fill": false
  },
  "chevron-down": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m6 9 6 6 6-6\"/>",
    "fill": false
  },
  "chevron-right": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m9 18 6-6-6-6\"/>",
    "fill": false
  },
  "arrow-right": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>",
    "fill": false
  },
  "arrow-left": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>",
    "fill": false
  },
  "external": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M15 3h6v6\"/><path d=\"M10 14 21 3\"/><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"/>",
    "fill": false
  },
  "home": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>",
    "fill": false
  },
  "user": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>",
    "fill": false
  },
  "users": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><path d=\"M16 3.128a4 4 0 0 1 0 7.744\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/>",
    "fill": false
  },
  "heart": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>",
    "fill": false
  },
  "star": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>",
    "fill": false
  },
  "cart": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\"/><path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\"/><circle cx=\"18\" cy=\"20\" r=\"2\"/><circle cx=\"8\" cy=\"20\" r=\"2\"/>",
    "fill": false
  },
  "bag": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M16 10a4 4 0 0 1-8 0\"/><path d=\"M3.103 6.034h17.794\"/><path d=\"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z\"/>",
    "fill": false
  },
  "ticket": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z\"/><path d=\"M13 5v2\"/><path d=\"M13 17v2\"/><path d=\"M13 11v2\"/>",
    "fill": false
  },
  "calendar": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>",
    "fill": false
  },
  "clock": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>",
    "fill": false
  },
  "map-pin": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>",
    "fill": false
  },
  "mail": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/>",
    "fill": false
  },
  "phone": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"/>",
    "fill": false
  },
  "share": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"/><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"/>",
    "fill": false
  },
  "download": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 15V3\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5\"/>",
    "fill": false
  },
  "upload": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M12 3v12\"/><path d=\"m17 8-5-5-5 5\"/><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/>",
    "fill": false
  },
  "settings": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "fill": false
  },
  "bell": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>",
    "fill": false
  },
  "lock": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>",
    "fill": false
  },
  "eye": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
    "fill": false
  },
  "trash": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M3 6h18\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>",
    "fill": false
  },
  "edit": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>",
    "fill": false
  },
  "filter": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\"/>",
    "fill": false
  },
  "info": {
    "viewBox": "0 0 24 24",
    "body": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>",
    "fill": false
  },
  "warning": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>",
    "fill": false
  },
  "play": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>",
    "fill": false
  },
  "music": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M9 18V5l12-2v13\"/><circle cx=\"6\" cy=\"18\" r=\"3\"/><circle cx=\"18\" cy=\"16\" r=\"3\"/>",
    "fill": false
  },
  "camera": {
    "viewBox": "0 0 24 24",
    "body": "<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>",
    "fill": false
  },
  "image": {
    "viewBox": "0 0 24 24",
    "body": "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>",
    "fill": false
  }
} as const

export type IconName = keyof typeof ICONS
export const ICON_NAMES = Object.keys(ICONS) as IconName[]

type Props = Omit<SVGAttributes<SVGSVGElement>, 'children'> & { name: IconName; size?: number | string; label?: string }

/** Icono del sistema. Hereda el color del texto (currentColor). Con label se anuncia a lectores de pantalla. */
export function Icon({ name, size, label, className, ...props }: Props) {
  const icon = ICONS[name]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon.viewBox}
      width={size}
      height={size}
      fill={icon.fill ? 'currentColor' : 'none'}
      stroke={icon.fill ? undefined : 'currentColor'}
      strokeWidth={icon.fill ? undefined : 'var(--ds-icon-stroke)'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cx('ds-icon', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...props}
    />
  )
}
