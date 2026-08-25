import * as stylex from '@stylexjs/stylex'
import { color, dark, lh } from '../styles/tokens.stylex'

const styles = stylex.create({
  page: {
    paddingTop: '8rem',
    paddingBottom: '5rem',
  },

  container: {
    marginInline: 'auto',
    maxWidth: '56rem',
    paddingInline: '2rem',
  },

  header: {
    marginBottom: '4rem',
  },

  title: {
    marginBottom: '1rem',
    fontSize: '3rem',
    lineHeight: lh.none,
    fontWeight: 700,
  },

  lead: {
    fontSize: '1.125rem',
    lineHeight: lh.lg,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },

  article: {
    borderBottomWidth: {
      default: '1px',
      ':last-child': '0',
    },
    borderBottomStyle: 'solid',
    borderBottomColor: {
      default: color.gray200,
      [dark.mode]: color.gray800,
    },
    paddingBottom: '3rem',
  },

  block: {
    display: 'block',
  },

  time: {
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  articleTitle: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '1.5rem',
    lineHeight: lh.xl2,
    fontWeight: 700,
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  description: {
    lineHeight: lh.relaxed,
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  tagRow: {
    marginTop: '1rem',
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

  readMore: {
    marginTop: '1rem',
    display: 'block',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray600,
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
})

export const page = stylex.attrs(styles.page)
export const container = stylex.attrs(styles.container)
export const header = stylex.attrs(styles.header)
export const title = stylex.attrs(styles.title)
export const lead = stylex.attrs(styles.lead)
export const list = stylex.attrs(styles.list)
export const article = stylex.attrs(stylex.defaultMarker(), styles.article)
export const block = stylex.attrs(styles.block)
export const time = stylex.attrs(styles.time)
export const articleTitle = stylex.attrs(styles.articleTitle)
export const description = stylex.attrs(styles.description)
export const tagRow = stylex.attrs(styles.tagRow)
export const tag = stylex.attrs(styles.tag)
export const readMore = stylex.attrs(styles.readMore)
