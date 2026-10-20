import { describe, expect, test } from 'bun:test'
import health from '../api/health'

describe('health function', () => {
  test('always returns 200 JSON { status: "ok" } with no-store', async () => {
    for (let i = 0; i < 3; i++) {
      const response = await health.fetch(new Request('https://franklinjavier.com/api/health'))
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toBe('no-store')
      expect(await response.json()).toEqual({ status: 'ok' })
    }
  })
})
