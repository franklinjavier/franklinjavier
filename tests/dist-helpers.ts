// map: Shared built-site paths, reads and HTML enumeration.
import { readFileSync, readdirSync } from 'node:fs'
import { join, sep } from 'node:path'

export const DIST = join(import.meta.dir, '..', 'dist')

export function read(path: string, dir = DIST): string {
  return readFileSync(join(dir, path), 'utf-8')
}

export function htmlPages(dir = DIST): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf-8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.split(sep).join('/'))
}
