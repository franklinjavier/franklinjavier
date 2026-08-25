---
title: I swapped Tailwind for StyleX on a site that already scored 100
date: 2026-08-25
description: PageSpeed was already 100. Matching production ate the CSS win. What shipped was unused typography, still on Tailwind.
author: Franklin Javier
tags: performance, css, stylex, tailwind, frontend
lang: en
translationKey: stylex-personal-site
---

I put StyleX on [franklinjavier.com](https://franklinjavier.com). PageSpeed was already 100, no JavaScript in the bundle, system font, one photo. LCP did not budge. Once the page looked like production, CSS was 8% smaller raw and 6% smaller gzipped. I reverted.

What landed on master is unused `@tailwindcss/typography`, a thinner preflight, and three client scripts folded into one. Still Tailwind. StyleX never shipped.

## The tweet I was chasing

[Aiden Bai posted a Tailwind-to-StyleX swap](https://x.com/aidenybai/status/2092021888642085254) with a screenshot: FCP 20% faster, LCP 7%, CSS half the size, JS down 5%, INP still 24ms. I wanted that experiment on this site, measured more than once on each side.

His numbers are the frame. They are not what happened here.

## What the site already was

Five PageSpeed mobile runs on production Tailwind: FCP 0.8s, LCP 1.1s, score 100. Desktop once: 0.3s / 0.3s. This property has no CrUX INP, so I am not making one up.

Home CSS: `BaseLayout.B8I3ZO9w.css`, 40325 bytes, 6932–6961 at gzip-6. `_astro` JS bundle: zero. The file starts with `/*! tailwindcss v4.3.3`.

Lighthouse CLI 12.8.2 on the same machine, no CDN, `master` against [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e): FCP 1051ms vs 1052ms, LCP 1351ms vs 1352ms. A wash. Neutral, here, means revert.

## Pixel-perfect first

The first StyleX preview was a different site. Measuring that would have been cheating. I wanted the pixels to match before I took an after number.

Along the way I wrote an 837-line `src/styles/app.ts` with one `stylex.create` and about 80 styles re-exported. Tailwind with extra steps. I threw it out.

[StyleX's own docs](https://stylexjs.com/docs/learn/thinking-in-stylex) want styles next to the markup. `*.stylex.ts` beside each view. Tokens only in `tokens.stylex.ts`. A local `create` compiles to a static class. One small CSS file up front, because lazy-loading their CSS recalculates the whole page.

## What StyleX actually moved

Commit [`d044686`](https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e), preview `zub4vcjma`, same look as production. PageSpeed again, five mobile runs: FCP 0.8s every time. LCP 1.1s on three, 0.8s on two. Desktop 0.3 / 0.3. Score 100. JS zero.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>Live Tailwind</th>
<th>StyleX <a href="https://github.com/franklinjavier/franklinjavier/commit/d044686f53996cfab8fa1a1f763dae12e8b1ce8e"><code>d044686</code></a> <code>zub4vcjma</code></th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">FCP mobile (PageSpeed ×5)</th>
<td>0.8s</td>
<td>0.8s</td>
</tr>
<tr>
<th scope="row">LCP mobile (PageSpeed ×5)</th>
<td>1.1s</td>
<td>1.1s in 3, 0.8s in 2</td>
</tr>
<tr>
<th scope="row">FCP / LCP desktop</th>
<td>0.3 / 0.3</td>
<td>0.3 / 0.3</td>
</tr>
<tr>
<th scope="row">Score</th>
<td>100</td>
<td>100</td>
</tr>
<tr>
<th scope="row">Raw CSS</th>
<td>40325</td>
<td>36972</td>
</tr>
<tr>
<th scope="row">CSS gzip-6</th>
<td>6932–6961</td>
<td>6499–6519</td>
</tr>
<tr>
<th scope="row">Raw HTML / gzip-6</th>
<td>14829 / 4289</td>
<td>14448 / 4523</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

Matching production ate the win. Preflight, typography, v4 line-heights, a grid that only exists at md and lg. All of that came back, and the CSS came with it.

## The leftover was not StyleX

Home, the blog index, and speaking never use `.prose`. Live markdown is `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong`, `code`, `pre`, `hr`. The `@tailwindcss/typography` dump still went out on every page.

I ran the same cut on Tailwind so I would not credit StyleX for it. Three hosts, same byte math, gzip-6 with `mtime=0`.

<div class="overflow-x-auto">
<table>
<thead>
<tr>
<th></th>
<th>A Tailwind, no cuts</th>
<th>B StyleX + cuts (unpublished)</th>
<th>C Tailwind + cuts (live)</th>
</tr>
</thead>
<tbody>
<tr>
<th scope="row">Home CSS</th>
<td><code>B8I3ZO9w</code> 40325 / 6932</td>
<td><code>0JEitMbP</code> 9475 / 2764</td>
<td><code>ClV8krB3</code> 15304 / 3519</td>
</tr>
<tr>
<th scope="row">Home requests <code>prose.css</code></th>
<td>yes</td>
<td>no</td>
<td>no</td>
</tr>
<tr>
<th scope="row">Post CSS <code>/blog/avoid-prop-drilling-react/</code></th>
<td>40325 / 6932</td>
<td>12982 / 3693 (prose 3507/929 + BaseLayout)</td>
<td>18811 / 4448 (same prose + BaseLayout)</td>
</tr>
<tr>
<th scope="row">Home HTML</th>
<td>14829 / 4289</td>
<td>13445 / 4357</td>
<td>13909 / 4160</td>
</tr>
<tr>
<th scope="row">Post HTML</th>
<td>14874 / 4429</td>
<td>13491 / 4384</td>
<td>13675 / 4196</td>
</tr>
<tr>
<th scope="row">JS <code>_astro</code></th>
<td>0</td>
<td>0</td>
<td>0</td>
</tr>
</tbody>
</table>
</div>

A to C is the leftover, no StyleX in it. C to B is StyleX vs Tailwind with that leftover held still: smaller CSS, worse HTML gzip.

C is what shipped. [PR #45](https://github.com/franklinjavier/franklinjavier/pull/45), commit [`0f4917c`](https://github.com/franklinjavier/franklinjavier/commit/0f4917ce0c647ab17ec200cb8657ed932e418472). franklinjavier.com now serves `BaseLayout.ClV8krB3.css` at 15304/3519. Home does not request `prose.css`. A post loads `prose.D-rI_UlP.css` 3507/929 plus BaseLayout. The 40325 dump is gone.

The [StyleX PR](https://github.com/franklinjavier/franklinjavier/pull/43) closed without a merge.

I did not rerun PageSpeed after the cut. I am not inventing LCP, FCP, or INP for what is live now.

## Unique class names lose at gzip

Home HTML on C: 13909 / 4160. StyleX with the same cuts: 13445 / 4357. Less raw HTML, worse gzip. A Tailwind utility repeats. A StyleX atom does not.

StyleX says CSS plateaus as a codebase grows. A one-photo site never gets there. This one was shipping typography the homepage never used. I cut that. I did not change the styling system.
