// map: Portuguese RSS endpoint.
import type { APIContext } from 'astro'
import { buildFeed } from '../../lib/rss'

export const GET = (context: APIContext) => buildFeed(context, 'pt-br')
