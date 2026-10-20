export default {
  fetch(_request: Request) {
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  },
}
