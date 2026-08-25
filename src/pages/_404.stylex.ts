import * as stylex from '@stylexjs/stylex'
import { color, dark, lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  main: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: '2rem',
  },

  center: {
    textAlign: 'center',
  },

  code: {
    fontSize: '8rem',
    lineHeight: lh.none,
    fontWeight: 700,
    color: {
      default: color.gray900,
      [dark.mode]: color.gray100,
    },
  },

  message: {
    marginTop: '2rem',
    fontSize: '1.25rem',
    lineHeight: lh.xl,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  help: {
    marginTop: '2rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  list: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
  },

  link: {
    color: {
      default: color.gray700,
      ':hover': color.gray900,
      [dark.mode]: {
        default: color.gray300,
        ':hover': color.gray100,
      },
    },
    textDecorationLine: 'underline',
  },
})

export const main = stylex.attrs(styles.main)
export const center = stylex.attrs(styles.center)
export const code = stylex.attrs(styles.code)
export const message = stylex.attrs(styles.message)
export const help = stylex.attrs(styles.help)
export const list = stylex.attrs(styles.list)
export const link = stylex.attrs(styles.link)
