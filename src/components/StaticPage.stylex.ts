import * as stylex from '@stylexjs/stylex'
import { lh } from '../styles/tokens.stylex'

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

  header: {
    marginBottom: '3rem',
  },

  title: {
    fontSize: '3rem',
    lineHeight: lh.tight,
    fontWeight: 700,
  },
})

export const page = stylex.attrs(styles.page)
export const article = stylex.attrs(styles.article)
export const header = stylex.attrs(styles.header)
export const title = stylex.attrs(styles.title)
