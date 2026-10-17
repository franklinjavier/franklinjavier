// map: Cloudflare asset dispatch, Markdown negotiation and hosting response rules.
import rules from './vercel.json'
import {
  prefersMarkdown,
  markdownPathFor,
  markdownSuffixPage,
  notFoundMarkdown,
  isPostPath,
  markdownLinkHeader,
} from './src/lib/negotiation.js'

type Env = { ASSETS: { fetch(request: Request): Promise<Response> } }
const headerValue = (group: number) => rules.headers[group]!.headers[0]!.value

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname
    const legacy = /^\/posts\/([^/]+)$/.exec(path)
    const destination = legacy
      ? rules.redirects[0]!.destination.replace(':slug', legacy[1]!)
      : path === rules.redirects[1]!.source
        ? rules.redirects[1]!.destination
        : null
    let response: Response
    let markdown = path.endsWith('.md')
    if (destination) {
      url.pathname = destination
      response = new Response(null, { status: 308, headers: { Location: url.href } })
    } else {
      const suffix = markdownSuffixPage(path)
      const eligible = !path.includes('.') || path.endsWith('.md')
      const negotiated =
        !path.endsWith('/index.md') &&
        eligible &&
        (suffix !== null ||
          (prefersMarkdown(request.headers.get('accept')) && !path.startsWith('/posts/')))
      if (negotiated) {
        url.pathname = markdownPathFor(suffix ?? path)
        url.search = ''
        markdown = true
      }
      response = await env.ASSETS.fetch(new Request(url, request))
      if (negotiated && response.status === 404) {
        await response.body?.cancel()
        response = new Response(request.method === 'HEAD' ? null : notFoundMarkdown(path), {
          status: 404,
        })
      }
    }
    const headers = new Headers(response.headers)
    const vary =
      headers
        .get('Vary')
        ?.split(',')
        .map((value) => value.trim()) ?? []
    if (!vary.some((value) => value.toLowerCase() === 'accept')) vary.push(headerValue(0))
    headers.set('Vary', vary.join(', '))
    if (markdown) headers.set('Content-Type', headerValue(1))
    if (path === '/llms.txt') headers.set('Content-Type', headerValue(2))
    if (path === '/') headers.set('Link', headerValue(3))
    else if (/^\/pt-br\/?$/.test(path)) headers.set('Link', headerValue(4))
    else if (!markdown && isPostPath(path)) headers.set('Link', markdownLinkHeader(path))
    return new Response(request.method === 'HEAD' ? null : response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
