// map: Optional build-time GitHub stars and compact count formatting.
import { OPEN_SOURCE } from './site'

export const pushedAt: Record<string, string> = {}

export async function fetchStars(
  fetcher: typeof fetch = fetch,
  pushes = pushedAt,
): Promise<Record<string, number>> {
  const signal = AbortSignal.timeout(2000)
  try {
    const data = await Promise.all(
      [
        'https://api.github.com/users/franklinjavier/repos?per_page=100',
        'https://api.github.com/repos/stonegiantstudio/skills',
      ].map(async (url) => {
        const response = await fetcher(url, { redirect: 'error', credentials: 'omit', signal })
        if (!response.ok) throw Error('GitHub unavailable')
        return response.json()
      }),
    )
    if (!Array.isArray(data[0]) || data[1]?.name !== 'skills') return {}
    const counts: Record<string, number> = {}
    for (const repo of [...data[0], { ...data[1], name: 'stonegiantstudio/skills' }]) {
      if (
        repo &&
        OPEN_SOURCE.some(({ name }) => name === repo.name) &&
        Number.isSafeInteger(repo.stargazers_count) &&
        repo.stargazers_count >= 0
      ) {
        counts[repo.name] = repo.stargazers_count
        pushes[repo.name] = typeof repo.pushed_at === 'string' ? repo.pushed_at : ''
      }
    }
    return counts
  } catch {
    return {}
  }
}

export function orderOpenSource(counts: Record<string, number>, pushes = pushedAt) {
  if (!Object.keys(counts).length) return OPEN_SOURCE
  return [...OPEN_SOURCE].sort(
    (a, b) =>
      (counts[b.name] ?? 0) - (counts[a.name] ?? 0) ||
      (pushes[b.name] ?? '').localeCompare(pushes[a.name] ?? ''),
  )
}

export function formatStars(count: number): string {
  return count < 1000 ? String(count) : `${Number((count / 1000).toFixed(1))}k`
}

export const stars = await fetchStars()
