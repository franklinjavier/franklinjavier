// map: Optional build-time GitHub stars and compact count formatting.
import { OPEN_SOURCE } from './site'

export async function fetchStars(fetcher: typeof fetch = fetch): Promise<Record<string, number>> {
  try {
    const response = await fetcher(
      'https://api.github.com/users/franklinjavier/repos?per_page=100',
      {
        redirect: 'error',
        credentials: 'omit',
        signal: AbortSignal.timeout(2000),
      },
    )
    if (!response.ok) return {}
    const data: unknown = await response.json()
    if (!Array.isArray(data)) return {}
    const counts: Record<string, number> = {}
    for (const repo of data) {
      if (
        repo &&
        OPEN_SOURCE.some(({ name }) => name === repo.name) &&
        Number.isSafeInteger(repo.stargazers_count) &&
        repo.stargazers_count >= 0
      ) {
        counts[repo.name] = repo.stargazers_count
      }
    }
    return counts
  } catch {
    return {}
  }
}

export function formatStars(count: number): string {
  return count < 1000 ? String(count) : `${Number((count / 1000).toFixed(1))}k`
}

export const stars = await fetchStars()
