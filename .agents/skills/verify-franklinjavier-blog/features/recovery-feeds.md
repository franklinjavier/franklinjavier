# Recover from missing pages and discover feeds

## Sub-features

404 helpful links, RSS article entries, sitemap localized posts, tags, and trust pages.

## How to get to it (user POV)

Open an unknown path. Use Go home or Blog. Sitemap is a visible 404 help link.
RSS is available at `/rss.xml`, and sitemap at `/sitemap.xml`.

## Driving it with IAB and HTTP

Open `/verify-missing-page/`, assert HTTP 404, inspect 404 and recovery links, and click Go home.
Fetch and save both XML responses. Parse RSS channel items and sitemap loc entries.
Require nonempty entries, valid canonical URLs, and successful local article destinations.
Check Portuguese RSS item paths against real `/pt-br/blog/` routes and the sitemap.
Record every unresolved path as a failure, with status and response body.

## Gotchas

The preview's unknown-route handling must be observed; `/404/` alone does not prove missing paths.
Canonical URLs use production origin. Follow only their paths against the owned local preview.
A 200 XML response alone does not prove that feed links work.
