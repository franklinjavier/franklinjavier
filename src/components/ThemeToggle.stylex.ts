import * as stylex from '@stylexjs/stylex'
import { color, dark } from '../styles/tokens.stylex'

const styles = stylex.create({
  button: {
    height: '1.25rem',
    width: '1.25rem',
    color: {
      default: color.gray500,
      ':hover': color.gray900,
      [dark.mode]: {
        default: color.gray400,
        ':hover': color.gray100,
      },
    },
    backgroundColor: 'transparent',
    borderStyle: 'none',
    padding: 0,
    cursor: 'pointer',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  icon: {
    height: '1.25rem',
    width: '1.25rem',
  },
})

export const button = stylex.attrs(styles.button)
export const icon = stylex.attrs(styles.icon)
