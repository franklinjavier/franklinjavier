// Run alone with `bun run test:cache`. Builds a throwaway copy of the project twice, sharing the content layer cache
// between builds (like Vercel restoring node_modules/.astro), and checks that a
// diagram-only change still reaches the rendered post.
import { afterAll, beforeAll, expect, test } from 'bun:test'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repo = join(import.meta.dir, '..')
const skip = new Set(['node_modules', 'dist', '.astro', '.git', '.vercel', 'work', 'research'])
let dir: string

function build() {
  const run = Bun.spawnSync([join(dir, 'node_modules/.bin/astro'), 'build'], {
    cwd: dir,
    stdout: 'pipe',
    stderr: 'pipe',
    // Kill a hung build so the test fails instead of waiting forever.
    timeout: 240_000,
  })
  if (run.exitedDueToTimeout)
    throw new Error(`astro build timed out:\n${run.stdout}\n${run.stderr}`)
  if (run.exitCode !== 0) throw new Error(`astro build failed:\n${run.stdout}\n${run.stderr}`)
  return run.stdout.toString()
}

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'diagram-cache-'))
  for (const name of readdirSync(repo)) {
    if (!skip.has(name)) cpSync(join(repo, name), join(dir, name), { recursive: true })
  }
  // Astro needs node_modules inside the project root (a symlink breaks .astro
  // compilation), so hardlink-copy it, or plain-copy across filesystems. The
  // copy's own node_modules/.astro starts empty and is the cache under test.
  // The trailing /. copies the contents even when node_modules is a symlink
  // (worktrees sharing an install).
  const copy = (flags: string) =>
    Bun.spawnSync(['cp', flags, `${join(repo, 'node_modules')}/.`, join(dir, 'node_modules')])
      .exitCode === 0
  if (!copy('-al')) {
    rmSync(join(dir, 'node_modules'), { recursive: true, force: true })
    if (!copy('-a')) throw new Error('could not copy node_modules')
  }
  rmSync(join(dir, 'node_modules/.astro'), { recursive: true, force: true })
})

afterAll(() => {
  if (dir) rmSync(dir, { recursive: true, force: true })
})

test(
  'changing a diagram source re-renders the post without touching its text',
  () => {
    const post = join(dir, 'src/content/blog/how-always-on-agents-work.md')
    const html = join(dir, 'dist/blog/how-always-on-agents-work/index.html')
    const wakeups = join(dir, 'src/diagrams/wakeups.ts')
    const postBefore = readFileSync(post, 'utf8')

    build()
    expect(readFileSync(html, 'utf8').includes('TO THE BACK')).toBe(true)

    const source = readFileSync(wakeups, 'utf8')
    expect(source).toContain(`back: 'TO THE BACK'`)
    writeFileSync(wakeups, source.replace(`back: 'TO THE BACK'`, `back: 'TO THE REAR'`))

    // Second build reuses node_modules/.astro/data-store.json from the first.
    expect(readdirSync(join(dir, 'node_modules/.astro'))).toContain('data-store.json')
    build()
    const after = readFileSync(html, 'utf8')
    expect({
      newLabel: after.includes('TO THE REAR'),
      oldLabel: after.includes('TO THE BACK'),
    }).toEqual({
      newLabel: true,
      oldLabel: false,
    })
    expect(readFileSync(post, 'utf8')).toBe(postBefore)
  },
  { timeout: 600_000 },
)
