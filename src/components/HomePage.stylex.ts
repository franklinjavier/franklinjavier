import * as stylex from '@stylexjs/stylex'
import { color, dark, lh, mq } from '../styles/tokens.stylex'

const styles = stylex.create({
  page: {
    paddingTop: '8rem',
    paddingBottom: '5rem',
  },

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
    lineHeight: lh.tight,
    fontWeight: 700,
  },

  heroBio: {
    maxWidth: '36rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontSize: '1.125rem',
    lineHeight: lh.lg,
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
    lineHeight: lh.lg,
    fontWeight: 700,
  },

  stack6: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
  },

  stack2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
  },

  stack2Muted: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: lh.sm,
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
    lineHeight: lh.xl3,
    fontWeight: 700,
  },

  postsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      default: '1fr',
      [mq.mdOnly]: '1fr 1fr',
      [mq.lg]: '1fr 1fr 1fr',
    },
    gap: '2rem',
  },

  cardTitle: {
    marginBottom: '0.5rem',
    fontSize: '1.25rem',
    lineHeight: lh.xl,
    fontWeight: 600,
    textDecorationLine: {
      default: 'none',
      [stylex.when.ancestor(':hover')]: 'underline',
    },
  },

  mutedTime: {
    fontSize: '0.875rem',
    lineHeight: lh.sm,
    color: {
      default: color.gray500,
      [dark.mode]: color.gray400,
    },
  },

  cardDescription: {
    marginTop: '0.75rem',
    color: {
      default: color.gray700,
      [dark.mode]: color.gray300,
    },
  },

  block: {
    display: 'block',
  },
})

export const page = stylex.attrs(styles.page)
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
export const cardGroup = stylex.attrs(stylex.defaultMarker())
export const block = stylex.attrs(styles.block)
export const cardTitle = stylex.attrs(styles.cardTitle)
export const mutedTime = stylex.attrs(styles.mutedTime)
export const cardDescription = stylex.attrs(styles.cardDescription)
