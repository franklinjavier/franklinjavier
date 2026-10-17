# Hosting

Vercel remains the live host. This checkout also supports Cloudflare Workers
with prebuilt static assets; it does not configure an account, token, route or DNS.

`bun run build` checks and builds Astro into `dist/`. `wrangler.jsonc` points to
that directory and runs `worker.ts` before the ASSETS binding. Missing HTML uses
the static 404 page; Markdown requests receive recovery links with status 404.
The handler reuses the Vercel negotiation helpers, including `.md` aliases and
HTML alternate links. It reads a twin once through ASSETS instead of issuing
the separate network HEAD probe used by Vercel middleware.

`vercel.json` remains the hosting contract. Its redirects and headers also live
in `public/_redirects` and `public/_headers`, copied into `dist/` by Astro.
The Worker applies those rules to its own responses as well; keep all three
representations synchronized when changing hosting rules.

Analytics is selected at build time: `VERCEL=1 bun run build` includes Vercel
Analytics; builds without `VERCEL=1` omit it. Keep the Vercel dependencies while
both hosts are supported. Cloudflare Web Analytics is a later owner choice.

The owner must supply Cloudflare access, review deployment tooling and explicitly
approve deployment and the DNS move before switching production. This change
performs none of those actions. Follow the [Cloudflare migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/vercel-to-workers/)
when preparing that separate step.
