import * as stylex from '@stylexjs/stylex'
import { color, dark, lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  footer: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: {
      default: color.gray100,
      [dark.mode]: color.gray800,
    },
  },

  inner: {
    marginInline: 'auto',
    display: 'flex',
    maxWidth: '80rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: '1.5rem',
    rowGap: '0.5rem',
    paddingInline: '2rem',
    paddingBlock: '2rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  links: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '1.5rem',
    rowGap: '0.5rem',
  },

  link: {
    color: {
      default: 'inherit',
      ':hover': color.gray900,
      [dark.mode]: {
        default: 'inherit',
        ':hover': color.gray100,
      },
    },
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

export const footer = stylex.attrs(styles.footer)
export const inner = stylex.attrs(styles.inner)
export const links = stylex.attrs(styles.links)
export const link = stylex.attrs(styles.link)
