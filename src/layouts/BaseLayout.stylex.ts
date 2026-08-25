import * as stylex from '@stylexjs/stylex'
import { color, dark } from '../styles/tokens.stylex'

const styles = stylex.create({
  body: {
    minHeight: '100vh',
    backgroundColor: {
      default: color.gray50,
      [dark.mode]: color.black,
    },
    color: {
      default: color.gray900,
      [dark.mode]: color.gray100,
    },
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    transitionProperty: 'color, background-color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

export const body = stylex.attrs(styles.body)
