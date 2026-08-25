import * as stylex from '@stylexjs/stylex'
import { lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  toggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontSize: '1.5rem',
    lineHeight: lh.xl2,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: {
      default: 1,
      ':hover': 0.8,
    },
  },
})

export const toggle = stylex.attrs(styles.toggle)
