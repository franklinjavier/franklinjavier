---
title: How I share links with my agents
date: 2026-10-21
description: xmd takes a link (an X post, an article, or a page that needs JavaScript) and returns just the content as Markdown. No login, no API key, no MCP.
author: Franklin Javier
tags: ai, agents, tooling, open-source
lang: en
translationKey: xmd-links-to-markdown-for-agents
---

When I want an agent to read a page, I give it an xmd link: `https://xmd.imfrank.dev/?url=` followed by the URL. The agent gets the content as Markdown and nothing else. There's no login, no API key, and no MCP server to set up. If the agent can make a GET request, it can use xmd. The code is at [github.com/franklinjavier/xmd](https://github.com/franklinjavier/xmd).

I use it with Grok Bot and Claude, for example to read the replies to a post on X.

## Raw HTML is mostly noise

I tested it on a reply from @jack. A plain `curl` on `x.com/jack/status/2110642522355638381` returns 160 KB of HTML. The post text is in there, between the "Log in" and "Sign up" buttons, but the replies aren't. Through xmd with `mode=replies`, the same URL becomes 3.5 KB of Markdown with the post and 13 replies.

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Link</th>
      <th scope="col">Original HTML</th>
      <th scope="col">xmd output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">X post, <code>replies</code> mode</th>
      <td>160 KB, no replies</td>
      <td>3.5 KB, post + 13 replies</td>
    </tr>
    <tr>
      <th scope="row">MDN, status 418</th>
      <td>208 KB</td>
      <td>3.8 KB</td>
    </tr>
    <tr>
      <th scope="row"><a href="/pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/">My StyleX post (Portuguese edition)</a></th>
      <td>49 KB</td>
      <td>12.5 KB, the Markdown the site serves itself</td>
    </tr>
    <tr>
      <th scope="row">Excalidraw (SPA, needs JavaScript)</th>
      <td>6.9 KB, almost all script</td>
      <td>885 bytes, the text of the start screen</td>
    </tr>
  </tbody>
</table>
</div>

Numbers from October 21, 2026.

## Using it

Paste the URL straight into the agent's chat, a `curl` call, or a script:

```text
https://xmd.imfrank.dev/?url=https://x.com/jack/status/2110642522355638381&mode=replies
```

The `https://` is optional, so `?url=example.com` works too. If the link has a `?` or `&` in it, URL-encode it, or its parameters get mixed up with xmd's. In a terminal, `curl` does the encoding for you:

```sh
curl -G 'https://xmd.imfrank.dev/' --data-urlencode 'url=https://example.com'
```

There's also a CLI. It needs Bun 1.4 or later. To install it straight from GitHub:

```sh
bun add -g github:franklinjavier/xmd
```

Or clone the repo:

```sh
git clone https://github.com/franklinjavier/xmd && cd xmd && bun install && bun link
```

The install takes 34 MB on disk, mostly `@cloudflare/puppeteer`, which the endpoint uses to open a browser. The command is `xmd`, and `x-md` works too:

```sh
xmd https://example.com
xmd --mode replies https://x.com/jack/status/2110642522355638381
```

The CLI also asks the site for its Markdown first. When it has to convert, it does it locally with a built-in HTML converter. Workers AI and Browser Run, which come up next, only exist on the endpoint.

## xmd only converts when the site has no Markdown

X links go to the [public FxTwitter API](https://docs.fxembed.com/api/introduction/), which returns the post as JSON without asking for a key. xmd builds the Markdown from that JSON.

For every other link, xmd asks the site for its own Markdown first. The request goes out with an `Accept: text/markdown` header. If HTML comes back, xmd looks for a `<link rel="alternate" type="text/markdown">` on the page. If there isn't one, it tries the same URL with `.md` on the end, the [llms.txt](https://llmstxt.org/) convention. Only when all of that fails does the HTML go to [Workers AI's `toMarkdown`](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/). Cloudflare's docs say that conversion is free for most formats.

My blog answers in Markdown when it gets that header:

```text
$ curl -sI -H 'Accept: text/markdown' https://franklinjavier.com/pt-br/blog/stylex-nao-deixou-o-site-mais-rapido/
HTTP/2 200
content-type: text/markdown; charset=utf-8
vary: Accept
```

Run that post through xmd and the Markdown comes straight from the site, with no conversion:

```text
x-xmd-engine: native
x-xmd-source: native
```

MDN doesn't return Markdown for any of those attempts, so the header shows a conversion:

```text
x-xmd-engine: ai
x-xmd-source: ai
```

Some pages have no content until JavaScript runs. When the conversion comes back empty or looks like one of those pages, xmd opens the link in [Browser Run](https://developers.cloudflare.com/browser-run/), Cloudflare's headless Chrome (formerly Browser Rendering), and converts the rendered HTML. On Excalidraw that took 5 seconds in one test and 7 in another, and it returned the text on the screen, down to "Pick a tool & Start drawing!".

`x-xmd-source` and `x-xmd-engine` carry the same value and tell you where each response came from:

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Value</th>
      <th scope="col">Where it came from</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><code>native</code></th>
      <td>The site's own Markdown (via <code>Accept</code>, <code>rel=alternate</code>, or the <code>.md</code> URL)</td>
    </tr>
    <tr>
      <th scope="row"><code>x</code></th>
      <td>X post, via FxTwitter</td>
    </tr>
    <tr>
      <th scope="row"><code>ai</code></th>
      <td>HTML converted by Workers AI</td>
    </tr>
    <tr>
      <th scope="row"><code>browser</code></th>
      <td>Page rendered in Browser Run, then converted</td>
    </tr>
    <tr>
      <th scope="row"><code>fallback</code></th>
      <td>Built-in converter, which also passes plain text through unchanged</td>
    </tr>
  </tbody>
</table>
</div>

## On X, mode decides what comes along

Sometimes a post is a reply to someone, or the fifth post in a thread. The `mode` parameter decides what comes with it:

<div class="overflow-x-auto">
<table>
  <thead>
    <tr>
      <th scope="col">Mode</th>
      <th scope="col">What goes into the Markdown</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row"><code>post</code></th>
      <td>Just the linked post. This is the default.</td>
    </tr>
    <tr>
      <th scope="row"><code>ancestors</code></th>
      <td>The conversation from the first post down to the linked one, up to 32 levels.</td>
    </tr>
    <tr>
      <th scope="row"><code>thread</code></th>
      <td>The author's thread, in order. Other people's replies are left out.</td>
    </tr>
    <tr>
      <th scope="row"><code>replies</code></th>
      <td>The linked post and the replies to it from anyone, in chronological order. Permalinks and metrics go into a reference list at the end.</td>
    </tr>
  </tbody>
</table>
</div>

The start of `replies` on @jack's post:

```markdown
## Replies to @jack

### 1/14 · jack (@jack)

@marcportermagee if you want. or use the screen.

### 2/14 · The Nth ° (@The_future_i)

@jack @marcportermagee Jack. Help a Jack.
```

## A Chrome extension, so you don't build the URL by hand

The repo also has a Chrome extension in `extension/`. One click copies the xmd link for the current tab and opens it in a new tab. It isn't on the Chrome Web Store. To install it:

```sh
curl -fsSL https://xmd.imfrank.dev/extension.sh | sh
```

The script downloads the extension to `~/xmd-extension` and prints the steps to load the folder in Chrome.

## Where it breaks

`replies` only gets one page of replies. @jack's post shows 24 replies, and 13 came back. FxTwitter returns a single page, xmd doesn't paginate, and the output ends with a note that there may be more. Deleted and protected posts don't come back at all.

The conversion isn't perfect either. On the MDN page, the "Skip to main content" links survive, along with a scrap of the original HTML, `&lt;!doctype html>`, right before the title.

The browser has a quota. Cloudflare's free plan allows [10 minutes a day, 3 browsers at once, and one new instance every 20 seconds](https://developers.cloudflare.com/browser-run/limits/). When the browser is busy, xmd returns 503 with `Retry-After: 60`. When the daily quota runs out, it returns 503 until midnight UTC. xmd also caps the browser at 3 pages per minute per IP.

The endpoint accepts 30 uncached requests per minute per IP, then returns 429. It only fetches public pages: `localhost`, private IPs, and ports other than 80 and 443 get a 400 with "Blocked target".
