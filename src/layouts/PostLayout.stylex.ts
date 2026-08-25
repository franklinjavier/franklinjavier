import * as stylex from '@stylexjs/stylex'
import { color, dark, lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  page: {
    paddingTop: '8rem',
    paddingBottom: '5rem',
  },

  article: {
    marginInline: 'auto',
    maxWidth: '48rem',
    paddingInline: '2rem',
  },

  back: {
    marginBottom: '2rem',
    display: 'inline-block',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
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

  header: {
    marginBottom: '3rem',
  },

  title: {
    marginBottom: '1rem',
    fontSize: '3rem',
    lineHeight: lh.tight,
    fontWeight: 700,
  },

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1rem',
  },

  time: {
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },

  tag: {
    borderRadius: '9999px',
    backgroundColor: {
      default: color.gray100,
      ':hover': color.gray200,
      [dark.mode]: {
        default: color.gray800,
        ':hover': color.gray700,
      },
    },
    paddingInline: '0.75rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

export const page = stylex.attrs(styles.page)
export const article = stylex.attrs(styles.article)
export const back = stylex.attrs(styles.back)
export const header = stylex.attrs(styles.header)
export const title = stylex.attrs(styles.title)
export const meta = stylex.attrs(styles.meta)
export const time = stylex.attrs(styles.time)
export const tags = stylex.attrs(styles.tags)
export const tag = stylex.attrs(styles.tag)
