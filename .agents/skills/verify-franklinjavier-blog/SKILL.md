---
name: verify-franklinjavier-blog
description: Drive Franklin Javier's Astro blog in a real browser, verify navigation and locale routes, and retain proof after cleanup. Use after changes to pages, posts, layouts, feeds, or interactions.
---

# Verify Franklin Javier's blog

Generated from pstack 0.15.2 create-verification-skill and its Codex platform mapping.
See [LICENSE](LICENSE) for the retained MIT notice. This skill uses Codex's native project location.
The primary surface is a public static Astro website. No login, database, seed, or secret is needed.
Read [the feature map](features/README.md) before deciding coverage.

## Launch

Run from the repository root with the existing Bun installation and locked dependencies.
Freeze the source commit before building or capturing proof. Keep evidence outside the checkout.

```sh
export BLOG_PROOF=$(mktemp -d /tmp/franklinjavier-proof.XXXXXX)
git rev-parse HEAD HEAD^{tree} > "$BLOG_PROOF/source.txt"
git status --porcelain=v1 > "$BLOG_PROOF/status.txt"
bun run build > "$BLOG_PROOF/build.log" 2>&1
bun run preview --host 127.0.0.1 --port 4322 > "$BLOG_PROOF/server.log" 2>&1 &
export BLOG_PID=$!
printf '%s\n' "$BLOG_PID" > "$BLOG_PROOF/server.pid"
```

The build must exit zero before preview starts. If 4322 is occupied, select a free port and record it.
Astro may choose another port on collision: verify the actual listener and URL before driving.
Use the built preview, not a dev server that can change beneath the proof.
Readiness is a successful `curl -fsS http://127.0.0.1:4322/` plus the preview log's Local URL.
Parallel verification is safe only with separate ports, evidence directories, and owned tabs.
Do not build concurrently in this checkout because `dist/` is shared.

## Doctor

Run before driving and whenever navigation looks wrong:

```sh
kill -0 "$BLOG_PID"
lsof -nP -iTCP:4322 -sTCP:LISTEN
curl -fsS http://127.0.0.1:4322/ > "$BLOG_PROOF/doctor-home.html"
git rev-parse HEAD HEAD^{tree}
git status --porcelain=v1
```

The listener must descend from the recorded preview process, serve this checkout's built blog,
and match the frozen commit/tree and clean source status. Check process ancestry with `ps`.
Confirm the returned HTML contains `Franklin Javier`, and the build log reports successful generation.
A stale build, foreign listener, failed build, or changed source invalidates the run.

## Drive

Use `mcp__cua_repl` and the existing IAB browser. Do not install a browser dependency.
Read its returned documentation before using locators or optional viewport capabilities.
Create a hidden owned tab with `cua.createBrowserTab('iab', url, {visible:false})`.
Inspect `tab.playwright.domSnapshot()` after each transition; derive selectors from current content.
Use real clicks via `getByRole`, `getByLabel`, or observed `href` locators.
Do not change the DOM, call internal setters, or use fabricated pages to demonstrate behavior.

Start at `/`, click a visible recent article, and check its heading, date, prose, and URL.
Use its visible tag link to reach a filtered list, open a result, and use Back to blog.
Click `Mudar para Português` and then `Switch to English`, verifying translated routes and content.
The language toggle is `#language-toggle`; the theme button is `#theme-toggle`.
Exercise the image viewer when an article contains an eligible image. Open by clicking the image,
verify `#image-viewer[open]` and the enlarged image, close with the visible close button or Escape.
The blog has no drawer, popover, command menu, or tooltip UI. Do not invent those states.
Repeat relevant journeys at 1440×900 and 400×900 using the documented viewport capability.
Restore temporary viewport overrides in cleanup. Capture real before/after states at each width.

For XML, fetch the actual preview's `/rss.xml` and `/sitemap.xml`, save bytes and HTTP status,
parse them as XML, and follow their entry paths on the local origin. Do not request production URLs.
Assert RSS items and sitemap URLs resolve to the corresponding published localized article routes.
Visit a missing local route, verify HTTP 404 and helpful links, then click Go home.
The feature map includes secondary navigation and interaction coverage; do not report it passed unrun.

## Evidence

Keep screenshots, DOM observations, actions and consequences, HTTP bodies/statuses, build logs,
and a report in `$BLOG_PROOF`. Record timestamps, viewport, URL, expected and actual outcomes.
For each meaningful step, retain the action and resulting visible state, not just the destination.
Inspect screenshots for overflow, clipped controls, readable content, and open interactive states.
Verify side effects too: theme persistence after reload, viewer closing, route changes, and HTTP links.
The site is read-only; do not submit external forms, contact links, analytics, or production writes.
No mock boundaries are needed for these public local flows.
Report failures and untested paths explicitly. Never replace a failed assertion with a skipped pass.
If source changes after capture, rebuild and repeat affected proof against the new frozen commit.

## Cleanup

Close only tabs created by this run. Reset viewport overrides and restore theme if changed.
Stop the recorded preview process and its observed child listener by PID, never by process name.
Use `ps` and `lsof` to verify the owned listener stopped. Do not kill an unrelated port owner.
Keep `$BLOG_PROOF` intact, including failed attempts. Confirm proof files still exist after cleanup.

## Helpers

No custom driver script or browser package is shipped. Use the repository's `bun run build`,
`bun run preview`, native browser API, `curl`, and standard XML parsing tools.
For upkeep, use `/maintain-verification-skill` whenever routes or controls change.
