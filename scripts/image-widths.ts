// Adds a resized webp step next to a post's responsive images, so srcset has
// a size between the 1024w and full-size (1600w) files. For every
// `<name>.webp` in the directory that already has a `<name>-640.webp` sibling
// and is wider than the target, it writes `<name>-<width>.webp`. Fixed encoder
// settings, so re-running produces the same files.
//
// Usage: bun scripts/image-widths.ts [dir] [width]
//   default: public/images/blog/lisbon-ai-2026 1200
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

const dir = process.argv[2] ?? 'public/images/blog/lisbon-ai-2026'
const width = Number(process.argv[3] ?? 1200)
const WEBP = { quality: 72, effort: 6, smartSubsample: true } as const

const sources = readdirSync(dir)
  .filter((file) => file.endsWith('.webp') && !/-\d+\.webp$/.test(file))
  .filter((file) => existsSync(join(dir, file.replace(/\.webp$/, '-640.webp'))))
  .sort()

for (const file of sources) {
  const input = join(dir, file)
  const { width: sourceWidth = 0 } = await sharp(input).metadata()
  if (sourceWidth <= width) {
    console.log(`skip  ${file} (${sourceWidth}w)`)
    continue
  }
  const output = join(dir, file.replace(/\.webp$/, `-${width}.webp`))
  await sharp(input).resize({ width }).webp(WEBP).toFile(output)
  console.log(`wrote ${output} (${Math.round(statSync(output).size / 1024)} KB)`)
}
