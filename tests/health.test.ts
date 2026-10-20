import { describe, expect, spyOn, test } from 'bun:test'
import health, { REHEARSAL_FAILURE_DEADLINE } from '../api/health'

async function callAt(now: number) {
  const spy = spyOn(Date, 'now').mockReturnValue(now)
  try {
    return await health.fetch(new Request('https://franklinjavier.com/api/health'))
  } finally {
    spy.mockRestore()
  }
}

describe('health function', () => {
  test('deadline is the fixed BLOG-14 rehearsal instant', () => {
    expect(REHEARSAL_FAILURE_DEADLINE).toBe(Date.parse('2026-10-20T01:08:00.000Z'))
  })

  test('returns 200 JSON { status: "ok" } with no-store before the deadline', async () => {
    for (const now of [Date.parse('2026-01-01T00:00:00.000Z'), REHEARSAL_FAILURE_DEADLINE - 1]) {
      const response = await callAt(now)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ status: 'ok' })
    }
  })

  test('returns 503 JSON { status: "error" } with no-store at and after the deadline', async () => {
    for (const now of [REHEARSAL_FAILURE_DEADLINE, REHEARSAL_FAILURE_DEADLINE + 60_000]) {
      const response = await callAt(now)
      expect(response.status).toBe(503)
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ status: 'error' })
    }
  })
})
