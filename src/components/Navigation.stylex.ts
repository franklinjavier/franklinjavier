import * as stylex from '@stylexjs/stylex'
import { color, dark, lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  nav: {
    position: 'sticky',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 50,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: {
      default: color.gray100,
      [dark.mode]: color.gray800,
    },
    backgroundColor: {
      default: color.white80,
      [dark.mode]: color.black80,
    },
    backdropFilter: 'blur(8px)',
  },

  inner: {
    marginInline: 'auto',
    maxWidth: '80rem',
    paddingInline: '2rem',
    paddingBlock: '0.75rem',
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
  },

  link: {
    color: {
      default: color.gray500,
      ':hover': color.gray900,
      [dark.mode]: {
        default: color.gray400,
        ':hover': color.gray100,
      },
    },
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
})

export const nav = stylex.attrs(styles.nav)
export const inner = stylex.attrs(styles.inner)
export const row = stylex.attrs(styles.row)
export const link = stylex.attrs(styles.link)
export const actions = stylex.attrs(styles.actions)
