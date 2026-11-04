# Hosting

Cloudflare Workers is the live host. Since 2026-10-21, franklinjavier.com has been a
Workers Custom Domain on the production `blog` Worker (see `wrangler.jsonc`).
`blog-preview.imfrank.dev` is a separate `blog-preview` Worker that Workers Builds
deploys from the latest pushed non-main branch.

`bun run build` checks and builds Astro into `dist/`. `wrangler.jsonc` points to
that directory and runs `worker.ts` before the ASSETS binding. Missing HTML uses
the static 404 page; Markdown requests receive recovery links with status 404.
The handler reuses the Vercel negotiation helpers, including `.md` aliases and
HTML alternate links. It reads a twin once through ASSETS instead of issuing
the separate network HEAD probe used by Vercel middleware.

The Vercel setup (`vercel.json`, `middleware.ts`) still builds and is tested, but
it no longer serves production. `vercel.json` is the source for the shared
redirects and headers. They are also in `public/_redirects` and `public/_headers`,
which Astro copies into `dist/`, and the Worker applies the same rules to its
own responses. Keep all three in sync when changing hosting rules.

Retired tag pages (`/blog/tag/<old>/`, `/pt-br/blog/tag/<old>/`) are redirected
by the Worker only, from `TAG_ALIASES` in `src/lib/tags.ts`. Vercel does not
have these redirects.

## Analytics

Production loads no analytics script. The Cloudflare Web Analytics beacon was
removed on 2026-11-04: it was the only third-party request on the page and cost
first paint time. Aggregate request counts are still in the Cloudflare dashboard
(Workers & Pages → blog → Metrics), measured server-side.

Keep Web Analytics' automatic injection off for franklinjavier.com (Analytics &
Logs → Web Analytics), or Cloudflare adds the beacon back on its own.

`VERCEL=1` adds Vercel Analytics. Only Vercel builds set it.

When the analytics setup changes, update the privacy pages
(`src/content/pages/privacy.md` and its pt-br version) and the privacy line in
`src/pages/llms.txt.ts`.
