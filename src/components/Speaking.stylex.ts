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
    lineHeight: lh.tight,
    fontWeight: 700,
  },

  intro: {
    maxWidth: '42rem',
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

  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '0.75rem',
    rowGap: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  kind: {
    borderRadius: '9999px',
    backgroundColor: {
      default: color.gray100,
      [dark.mode]: color.gray800,
    },
    paddingInline: '0.75rem',
    paddingBlock: '0.25rem',
    fontSize: '0.75rem',
    lineHeight: '1rem',
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  talkTitle: {
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '1.5rem',
    lineHeight: lh.xl2,
    fontWeight: 700,
  },

  talkLink: {
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  summary: {
    lineHeight: lh.relaxed,
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  with: {
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  action: {
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
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
    transitionProperty: 'color',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  invite: {
    marginTop: '4rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  inviteLink: {
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
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

export const page = stylex.attrs(styles.page)
export const container = stylex.attrs(styles.container)
export const header = stylex.attrs(styles.header)
export const title = stylex.attrs(styles.title)
export const intro = stylex.attrs(styles.intro)
export const list = stylex.attrs(styles.list)
export const article = stylex.attrs(stylex.defaultMarker(), styles.article)
export const meta = stylex.attrs(styles.meta)
export const kind = stylex.attrs(styles.kind)
export const talkTitle = stylex.attrs(styles.talkTitle)
export const talkLink = stylex.attrs(styles.talkLink)
export const summary = stylex.attrs(styles.summary)
export const withLine = stylex.attrs(styles.with)
export const action = stylex.attrs(styles.action)
export const invite = stylex.attrs(styles.invite)
export const inviteLink = stylex.attrs(styles.inviteLink)
