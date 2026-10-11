/** Words per minute for reading-time estimates. */
export const WORDS_PER_MINUTE = 220

/**
 * Minutes to read a markdown/HTML body, rounded up, at least 1.
 * Strips tags, fenced code, image/link syntax and markdown punctuation so
 * only prose words count.
 */
export function readingMinutes(body = ''): number {
  const text = body
    .replace(/^```[\s\S]*?^```/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>`~|-]+/g, ' ')
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu)?.length ?? 0
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
