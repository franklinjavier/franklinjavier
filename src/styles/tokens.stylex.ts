import * as stylex from '@stylexjs/stylex'

// Official defineConsts: inlined at compile time, valid as create() keys/values.
// https://stylexjs.com/docs/api/javascript/defineConsts
export const mq = stylex.defineConsts({
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1024px)',
})

// Matches the previous Tailwind v4 custom variant: `&:where(.dark, .dark *)`
export const dark = stylex.defineConsts({
  mode: ':where(.dark, .dark *)',
})

// Cool-gray palette previously remapped in global.css @theme
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
