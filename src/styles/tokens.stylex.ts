import * as stylex from '@stylexjs/stylex'

// Official defineConsts: inlined at compile time, valid as create() keys/values.
// https://stylexjs.com/docs/api/javascript/defineConsts
export const mq = stylex.defineConsts({
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
  // StyleX emits min-width queries in source order; 768px would otherwise
  // override 1024px when both match. Keep the tablet band exclusive.
  mdOnly: '@media (min-width: 768px) and (max-width: 1023.98px)',
})

// Matches the previous Tailwind v4 custom variant: `&:where(.dark, .dark *)`
export const dark = stylex.defineConsts({
  mode: ':where(.dark, .dark *)',
})

// Cool-gray palette previously remapped in global.css @theme
// Tailwind v4 default line-heights (length/size), not unitless multipliers.
export const lh = stylex.defineConsts({
  xs: 'calc(1 / 0.75)',
  sm: 'calc(1.25 / 0.875)',
  lg: 'calc(1.75 / 1.125)',
  xl: 'calc(1.75 / 1.25)',
  xl2: 'calc(2 / 1.5)',
  xl3: 'calc(2.25 / 1.875)',
  tight: '1.25',
  relaxed: '1.625',
  none: '1',
})

export const color = stylex.defineConsts({
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  black: '#000000',
  white: '#ffffff',
  white80: 'rgba(255, 255, 255, 0.8)',
  black80: 'rgba(0, 0, 0, 0.8)',
})
