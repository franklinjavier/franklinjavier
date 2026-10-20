// TEMPORARY (BLOG-14 rehearsal): fixed UTC failure deadline used to rehearse
// deploy smoke failure + rollback. REMOVE this constant and the 503 branch in cleanup.
export const REHEARSAL_FAILURE_DEADLINE = Date.parse('2026-10-20T01:08:00.000Z')

export default {
  fetch(_request: Request) {
    if (Date.now() >= REHEARSAL_FAILURE_DEADLINE) {
      return Response.json({ status: 'error' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  },
}
