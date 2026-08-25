import * as stylex from '@stylexjs/stylex'
import { color, dark, mq } from './tokens.stylex'

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

  page: {
    paddingTop: '8rem',
    paddingBottom: '5rem',
  },

  container7xl: {
    marginInline: 'auto',
    maxWidth: '80rem',
    paddingInline: '2rem',
  },

  container4xl: {
    marginInline: 'auto',
    maxWidth: '56rem',
    paddingInline: '2rem',
  },

  container3xl: {
    marginInline: 'auto',
    maxWidth: '48rem',
    paddingInline: '2rem',
  },

  header12: {
    marginBottom: '3rem',
  },

  header16: {
    marginBottom: '4rem',
  },

  pageTitle: {
    marginBottom: '1rem',
    fontSize: '3rem',
    lineHeight: 1.25,
    fontWeight: 700,
  },

  pageTitlePlain: {
    fontSize: '3rem',
    lineHeight: 1.25,
    fontWeight: 700,
  },

  sectionLead: {
    fontSize: '1.125rem',
    lineHeight: 1.75,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  mutedTime: {
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  backLink: {
    marginBottom: '2rem',
    display: 'inline-block',
    fontSize: '0.875rem',
    lineHeight: 1.25,
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

  backLinkTight: {
    marginBottom: '1rem',
    display: 'inline-block',
    fontSize: '0.875rem',
    lineHeight: 1.25,
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

  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '1rem',
  },

  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },

  tagRowSpaced: {
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

  tagStatic: {
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

  articleTitle: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '1.5rem',
    lineHeight: 2,
    fontWeight: 700,
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  description: {
    lineHeight: 1.625,
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  readMore: {
    marginTop: '1rem',
    display: 'block',
    fontSize: '0.875rem',
    lineHeight: 1.25,
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

  readMoreGroup: {
    marginTop: '1rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray600,
      [stylex.when.ancestor(':hover')]: color.gray900,
      [dark.mode]: {
        default: color.gray400,
        [stylex.when.ancestor(':hover')]: color.gray100,
      },
    },
  },

  titleMuted: {
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  empty: {
    paddingBlock: '3rem',
    textAlign: 'center',
  },

  // Navigation
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

  navInner: {
    marginInline: 'auto',
    maxWidth: '80rem',
    paddingInline: '2rem',
    paddingBlock: '0.75rem',
  },

  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },

  navLink: {
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

  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  // Footer
  footer: {
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: {
      default: color.gray100,
      [dark.mode]: color.gray800,
    },
  },

  footerInner: {
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
    lineHeight: 1.25,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  footerLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    columnGap: '1.5rem',
    rowGap: '0.5rem',
  },

  footerLink: {
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

  // Toggles
  themeButton: {
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

  themeIcon: {
    height: '1.25rem',
    width: '1.25rem',
  },

  languageToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    paddingInline: '0.5rem',
    paddingBlock: '0.375rem',
    fontSize: '1.5rem',
    lineHeight: 2,
    transitionProperty: 'opacity',
    transitionDuration: '150ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: {
      default: 1,
      ':hover': 0.8,
    },
  },

  // Home
  hero: {
    marginInline: 'auto',
    marginBottom: '8rem',
    maxWidth: '80rem',
    paddingInline: '2rem',
  },

  heroGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [mq.lg]: '1fr 1fr',
    },
    alignItems: 'start',
    gap: '4rem',
  },

  heroTitle: {
    marginBottom: '2rem',
    fontSize: {
      default: '3.75rem',
      [mq.lg]: '4.5rem',
    },
    lineHeight: 1.25,
    fontWeight: 700,
  },

  heroBio: {
    maxWidth: '36rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontSize: '1.125rem',
    lineHeight: 1.75,
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  photoWrap: {
    position: 'relative',
    marginTop: {
      default: 0,
      [mq.lg]: '4rem',
    },
  },

  photoFrame: {
    transform: 'rotate(3deg)',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },

  photo: {
    height: 'auto',
    width: '100%',
    borderRadius: '1.5rem',
  },

  info: {
    marginInline: 'auto',
    maxWidth: '80rem',
    paddingInline: '2rem',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [mq.md]: '1fr 1fr 1fr',
    },
    gap: '4rem',
  },

  infoTitle: {
    marginBottom: '1.5rem',
    fontSize: '1.125rem',
    lineHeight: 1.75,
    fontWeight: 700,
  },

  stack6: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },

  stack2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },

  stack2Muted: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  textPrimary: {
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  textMuted: {
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  contactLink: {
    display: 'block',
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

  posts: {
    marginInline: 'auto',
    marginTop: '8rem',
    maxWidth: '80rem',
    paddingInline: '2rem',
  },

  postsTitle: {
    marginBottom: '3rem',
    fontSize: '1.875rem',
    lineHeight: 2.25,
    fontWeight: 700,
  },

  postsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [mq.md]: '1fr 1fr',
      [mq.lg]: '1fr 1fr 1fr',
    },
    gap: '2rem',
  },

  cardTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.25rem',
    lineHeight: 1.75,
    fontWeight: 600,
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  cardDescription: {
    marginTop: '0.75rem',
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  // Speaking
  intro: {
    maxWidth: '42rem',
    fontSize: '1.125rem',
    lineHeight: 1.75,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  appearanceMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: '0.75rem',
    rowGap: '0.25rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  talkTitle: {
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
    fontSize: '1.5rem',
    lineHeight: 2,
    fontWeight: 700,
  },

  talkLink: {
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  with: {
    marginTop: '0.75rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  action: {
    marginTop: '1rem',
    display: 'block',
    fontSize: '0.875rem',
    lineHeight: 1.25,
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

  inviteWrap: {
    marginTop: '4rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
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

  // 404
  notFoundMain: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: '2rem',
  },

  notFoundCenter: {
    textAlign: 'center',
  },

  notFoundCode: {
    fontSize: '8rem',
    lineHeight: 1,
    fontWeight: 700,
    color: {
      default: color.gray900,
      [dark.mode]: color.gray100,
    },
  },

  notFoundMessage: {
    marginTop: '2rem',
    fontSize: '1.25rem',
    lineHeight: 1.75,
    color: {
      default: color.gray600,
      [dark.mode]: color.gray400,
    },
  },

  notFoundHelp: {
    marginTop: '2rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  notFoundList: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: 1.25,
  },

  notFoundLink: {
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

export const body = stylex.attrs(styles.body)
export const page = stylex.attrs(styles.page)
export const container7xl = stylex.attrs(styles.container7xl)
export const container4xl = stylex.attrs(styles.container4xl)
export const container3xl = stylex.attrs(styles.container3xl)
export const header12 = stylex.attrs(styles.header12)
export const header16 = stylex.attrs(styles.header16)
export const pageTitle = stylex.attrs(styles.pageTitle)
export const pageTitlePlain = stylex.attrs(styles.pageTitlePlain)
export const sectionLead = stylex.attrs(styles.sectionLead)
export const mutedTime = stylex.attrs(styles.mutedTime)
export const backLink = stylex.attrs(styles.backLink)
export const backLinkTight = stylex.attrs(styles.backLinkTight)
export const metaRow = stylex.attrs(styles.metaRow)
export const tagRow = stylex.attrs(styles.tagRow)
export const tagRowSpaced = stylex.attrs(styles.tagRowSpaced)
export const tag = stylex.attrs(styles.tag)
export const tagStatic = stylex.attrs(styles.tagStatic)
export const list = stylex.attrs(styles.list)
export const group = stylex.attrs(stylex.defaultMarker(), styles.article)
export const cardGroup = stylex.attrs(stylex.defaultMarker())
export const block = stylex.attrs(styles.block)
export const articleTitle = stylex.attrs(styles.articleTitle)
export const descriptionText = stylex.attrs(styles.description)
export const readMore = stylex.attrs(styles.readMore)
export const readMoreGroup = stylex.attrs(styles.readMoreGroup)
export const titleMuted = stylex.attrs(styles.titleMuted)
export const empty = stylex.attrs(styles.empty)
export const emptyText = stylex.attrs(styles.sectionLead)

export const nav = stylex.attrs(styles.nav)
export const navInner = stylex.attrs(styles.navInner)
export const navRow = stylex.attrs(styles.navRow)
export const navLink = stylex.attrs(styles.navLink)
export const navActions = stylex.attrs(styles.navActions)

export const footer = stylex.attrs(styles.footer)
export const footerInner = stylex.attrs(styles.footerInner)
export const footerLinks = stylex.attrs(styles.footerLinks)
export const footerLink = stylex.attrs(styles.footerLink)

export const themeButton = stylex.attrs(styles.themeButton)
export const themeIcon = stylex.attrs(styles.themeIcon)
export const languageToggle = stylex.attrs(styles.languageToggle)

export const hero = stylex.attrs(styles.hero)
export const heroGrid = stylex.attrs(styles.heroGrid)
export const heroTitle = stylex.attrs(styles.heroTitle)
export const heroBio = stylex.attrs(styles.heroBio)
export const photoWrap = stylex.attrs(styles.photoWrap)
export const photoFrame = stylex.attrs(styles.photoFrame)
export const photo = stylex.attrs(styles.photo)
export const info = stylex.attrs(styles.info)
export const infoGrid = stylex.attrs(styles.infoGrid)
export const infoTitle = stylex.attrs(styles.infoTitle)
export const stack6 = stylex.attrs(styles.stack6)
export const stack2 = stylex.attrs(styles.stack2)
export const stack2Muted = stylex.attrs(styles.stack2Muted)
export const textPrimary = stylex.attrs(styles.textPrimary)
export const textMuted = stylex.attrs(styles.textMuted)
export const contactLink = stylex.attrs(styles.contactLink)
export const posts = stylex.attrs(styles.posts)
export const postsTitle = stylex.attrs(styles.postsTitle)
export const postsGrid = stylex.attrs(styles.postsGrid)
export const cardTitle = stylex.attrs(styles.cardTitle)
export const cardDescription = stylex.attrs(styles.cardDescription)

export const intro = stylex.attrs(styles.intro)
export const appearanceMeta = stylex.attrs(styles.appearanceMeta)
export const talkTitle = stylex.attrs(styles.talkTitle)
export const talkLink = stylex.attrs(styles.talkLink)
export const withLine = stylex.attrs(styles.with)
export const action = stylex.attrs(styles.action)
export const inviteWrap = stylex.attrs(styles.inviteWrap)
export const inviteLink = stylex.attrs(styles.inviteLink)

export const notFoundMain = stylex.attrs(styles.notFoundMain)
export const notFoundCenter = stylex.attrs(styles.notFoundCenter)
export const notFoundCode = stylex.attrs(styles.notFoundCode)
export const notFoundMessage = stylex.attrs(styles.notFoundMessage)
export const notFoundHelp = stylex.attrs(styles.notFoundHelp)
export const notFoundList = stylex.attrs(styles.notFoundList)
export const notFoundLink = stylex.attrs(styles.notFoundLink)
