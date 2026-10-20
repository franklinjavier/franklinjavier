# Feature map

Drive all affected entries; one convenient page does not prove the entire map.

| Journey | Entry | Observable result |
| --- | --- | --- |
| [Reading](reading.md) | Home, blog index, article | Article prose, tag filtering, image viewer, return navigation |
| [Locales](locales.md) | Language toggle on pages and posts | English and Portuguese routes and translated content |
| [Recovery and feeds](recovery-feeds.md) | Missing route, RSS, sitemap | 404 recovery and valid published links |
| [Navigation and appearance](navigation.md) | Navigation, footer, theme button | Secondary pages and persistent visible theme |
| Health check | `GET /api/health` on the actual Vercel deployment | Dynamic JSON `{ "status": "ok" }`, HTTP 200 and `Cache-Control: no-store`; verify on Vercel because Astro static preview does not serve root API functions |
